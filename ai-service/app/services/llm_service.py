"""
Multi-provider LLM engine with automatic failover.

Tries several providers in priority order (default: Groq -> Gemini -> OpenRouter ->
Mistral). Groq is first because its LPU inference is ~10x faster than the others, which
is what keeps generation fast even on a weak free-tier host. When a provider is missing a
key, rate-limited (429), or errors, the engine transparently moves to the next candidate.
An admin can pin a specific provider/model at runtime; the rest still act as fallbacks.

Groq, OpenRouter and Mistral all speak the OpenAI /chat/completions format, so they share
one HTTP path (httpx). Gemini uses the google-generativeai SDK.
"""
import re
import json
import time
import asyncio
import logging
from typing import Dict, Any, Optional, List, Tuple

import httpx
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger("llm-service")

# A single call must never hang the pipeline; hard-capped well under the gateway budget.
PER_CALL_TIMEOUT_S = 70.0

# Process-level cooldown for (provider:model) entries that returned 429 (quota/rate limit),
# so we stop paying the round-trip on an exhausted model for a while.
_COOLDOWN: Dict[str, float] = {}
_DEFAULT_COOLDOWN_S = 60.0


class QuotaExceededError(RuntimeError):
    """Raised when every candidate across every provider is rate-limited (429)."""


# ---------------------------------------------------------------------------
# Provider registry. `kind`: "gemini" (SDK) or "openai" (OpenAI-compatible HTTP).
# Only providers with a configured API key are ever used.
# ---------------------------------------------------------------------------
PROVIDERS: Dict[str, Dict[str, Any]] = {
    "groq": {
        "kind": "openai",
        "base_url": "https://api.groq.com/openai/v1",
        "api_key": lambda: settings.GROQ_API_KEY,
        "json_mode": True,
        "max_tokens": 8192,
        "models": ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
    },
    "gemini": {
        "kind": "gemini",
        "api_key": lambda: settings.GEMINI_API_KEY,
        "json_mode": True,
        "max_tokens": 16384,
        "models": [
            "gemini-3.5-flash",
            "gemini-flash-latest",
            "gemini-2.5-flash",
            "gemini-3-flash-preview",
            "gemini-3.1-flash-lite",
        ],
    },
    "openrouter": {
        "kind": "openai",
        "base_url": "https://openrouter.ai/api/v1",
        "api_key": lambda: settings.OPENROUTER_API_KEY,
        # Many free OpenRouter models ignore/reject strict json_object mode, so we rely on
        # the prompt ("Output JSON only") + our JSON repair instead.
        "json_mode": False,
        "max_tokens": 8192,
        "models": [
            "meta-llama/llama-3.3-70b-instruct:free",
            "google/gemini-2.0-flash-exp:free",
            "mistralai/mistral-small-3.2-24b-instruct:free",
        ],
        "extra_headers": {
            "HTTP-Referer": "https://projectmind-ai.vercel.app",
            "X-Title": "ProjectMind AI",
        },
    },
    "mistral": {
        "kind": "openai",
        "base_url": "https://api.mistral.ai/v1",
        "api_key": lambda: settings.MISTRAL_API_KEY,
        "json_mode": True,
        "max_tokens": 8192,
        "models": ["mistral-small-latest", "open-mistral-nemo"],
    },
}


def _is_quota_error_text(text: str) -> bool:
    t = text.lower()
    return "429" in t or "resourceexhausted" in t or "quota" in t or "rate limit" in t or "rate-limit" in t


def _retry_delay_from_error(text: str) -> float:
    m = re.search(r"retry in (\d+(?:\.\d+)?)s", text)
    if m:
        try:
            return min(float(m.group(1)), 300.0)
        except ValueError:
            pass
    return _DEFAULT_COOLDOWN_S


def _sanitize_json_escapes(text: str) -> str:
    """Escape stray backslashes not part of a valid JSON escape (\\d, \\ , C:\\path...)."""
    return re.sub(r'\\(?!["\\/bfnrtu])', r'\\\\', text)


def _repair_json(raw_text: str) -> str:
    """Strip markdown fences and best-effort repair invalid-escape / truncated JSON."""
    text = raw_text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    if not text:
        return text
    try:
        json.loads(text)
        return text
    except json.JSONDecodeError:
        pass
    sanitized = _sanitize_json_escapes(text)
    try:
        json.loads(sanitized)
        return sanitized
    except json.JSONDecodeError:
        text = sanitized
    # Truncated output: trim to the last balanced closer and close the structure.
    open_char = text[0]
    close_char = "}" if open_char == "{" else "]" if open_char == "[" else ""
    if not close_char:
        return text
    last = text.rfind(close_char)
    if last == -1:
        return text
    candidate = text[: last + 1]
    depth = 0
    in_str = False
    escape = False
    for ch in candidate:
        if escape:
            escape = False
            continue
        if ch == "\\":
            escape = True
            continue
        if ch == '"':
            in_str = not in_str
            continue
        if in_str:
            continue
        if ch in "{[":
            depth += 1
        elif ch in "}]":
            depth -= 1
    if depth > 0:
        candidate += ("}" if open_char == "{" else "]") * depth
    return candidate


class LLMService:
    def __init__(self):
        self.temperature = 0.4
        self.active_provider = settings.LLM_PROVIDER if settings.LLM_PROVIDER in PROVIDERS else "groq"
        self.active_model: Optional[str] = None  # None = use the provider's own model list
        order = [p.strip() for p in settings.LLM_PROVIDER_ORDER.split(",") if p.strip() in PROVIDERS]
        self.provider_order = order or ["groq", "gemini", "openrouter", "mistral"]
        # Configure the Gemini SDK once if a key is present.
        if self._key("gemini"):
            try:
                genai.configure(api_key=self._key("gemini"))
            except Exception as e:
                logger.error(f"Failed to configure Gemini SDK: {e}")
        configured = self.configured_providers()
        logger.info(f"LLM engine ready. Configured providers: {configured or 'NONE'}; active: {self.active_provider}")

    # ---- helpers ----
    def _key(self, provider: str) -> str:
        try:
            return (PROVIDERS[provider]["api_key"]() or "").strip()
        except Exception:
            return ""

    def configured_providers(self) -> List[str]:
        return [p for p in PROVIDERS if self._key(p) and not self._key(p).startswith("your-")]

    @property
    def is_configured(self) -> bool:
        return len(self.configured_providers()) > 0

    @property
    def model_name(self) -> str:
        """Back-compat: the currently active model label (provider/model)."""
        model = self.active_model or (PROVIDERS.get(self.active_provider, {}).get("models", ["n/a"])[0])
        return f"{self.active_provider}/{model}"

    @property
    def available_models(self) -> List[str]:
        return [m for p in PROVIDERS for m in PROVIDERS[p]["models"]]

    def _candidates(self) -> List[Tuple[str, str]]:
        """Ordered (provider, model) list: active provider first, then the failover order;
        only configured providers; models on cooldown pushed to the back."""
        ordered_providers: List[str] = []
        for p in [self.active_provider] + self.provider_order:
            if p not in ordered_providers and self._key(p):
                ordered_providers.append(p)

        pairs: List[Tuple[str, str]] = []
        for p in ordered_providers:
            models = PROVIDERS[p]["models"]
            # If the admin pinned a model that belongs to the active provider, try it first.
            if p == self.active_provider and self.active_model and self.active_model in models:
                models = [self.active_model] + [m for m in models if m != self.active_model]
            for m in models:
                pairs.append((p, m))

        now = time.time()
        ready = [pm for pm in pairs if _COOLDOWN.get(f"{pm[0]}:{pm[1]}", 0) <= now]
        cooling = [pm for pm in pairs if _COOLDOWN.get(f"{pm[0]}:{pm[1]}", 0) > now]
        return ready + cooling

    # ---- provider calls ----
    async def _gemini_call(self, model: str, prompt: str, system: Optional[str], json_mode: bool, max_tokens: int) -> str:
        gen_config: Dict[str, Any] = {
            "temperature": self.temperature if json_mode else min(1.0, self.temperature + 0.3),
            "top_p": 0.95,
            "max_output_tokens": max_tokens,
        }
        if json_mode:
            gen_config["response_mime_type"] = "application/json"
        gmodel = genai.GenerativeModel(model_name=model, system_instruction=system, generation_config=gen_config)
        resp = await asyncio.wait_for(gmodel.generate_content_async(prompt), timeout=PER_CALL_TIMEOUT_S)
        return resp.text.strip()

    async def _openai_call(self, provider: str, model: str, prompt: str, system: Optional[str], json_mode: bool, max_tokens: int) -> str:
        cfg = PROVIDERS[provider]
        headers = {"Authorization": f"Bearer {self._key(provider)}", "Content-Type": "application/json"}
        headers.update(cfg.get("extra_headers", {}))
        body: Dict[str, Any] = {
            "model": model,
            "messages": [
                {"role": "system", "content": system or "You are a helpful assistant."},
                {"role": "user", "content": prompt},
            ],
            "temperature": self.temperature if json_mode else min(1.0, self.temperature + 0.3),
            "max_tokens": max_tokens,
        }
        if json_mode:
            body["response_format"] = {"type": "json_object"}
        async with httpx.AsyncClient(timeout=PER_CALL_TIMEOUT_S) as client:
            resp = await client.post(f"{cfg['base_url']}/chat/completions", headers=headers, json=body)
        if resp.status_code == 429 or resp.status_code == 402:
            raise RuntimeError(f"429 rate limit / quota on {provider}:{model} — {resp.text[:160]}")
        resp.raise_for_status()
        data = resp.json()
        return (data["choices"][0]["message"]["content"] or "").strip()

    async def _generate(self, prompt: str, system: Optional[str], want_json: bool) -> Any:
        if not self.is_configured:
            raise ValueError(
                "No LLM provider is configured. Set at least one of GROQ_API_KEY, GEMINI_API_KEY, "
                "OPENROUTER_API_KEY, or MISTRAL_API_KEY."
            )
        candidates = self._candidates()
        last_error: Optional[Exception] = None
        quota_hits = 0

        for provider, model in candidates:
            cfg = PROVIDERS[provider]
            json_mode = want_json and cfg.get("json_mode", False)
            max_tokens = cfg.get("max_tokens", 8192) if want_json else 1024
            key = f"{provider}:{model}"
            try:
                if cfg["kind"] == "gemini":
                    raw = await self._gemini_call(model, prompt, system, json_mode, max_tokens)
                else:
                    raw = await self._openai_call(provider, model, prompt, system, json_mode, max_tokens)

                if want_json:
                    return json.loads(_repair_json(raw))
                return raw

            except asyncio.TimeoutError:
                logger.warning(f"{key} exceeded {PER_CALL_TIMEOUT_S:.0f}s; trying next candidate.")
                last_error = RuntimeError(f"{key} timed out")
            except json.JSONDecodeError as err:
                logger.error(f"{key} returned unparseable JSON: {err}")
                last_error = err
            except Exception as err:
                text = str(err)
                if _is_quota_error_text(text):
                    quota_hits += 1
                    _COOLDOWN[key] = time.time() + _retry_delay_from_error(text)
                    logger.warning(f"{key} rate-limited (429); cooling down and skipping.")
                else:
                    logger.warning(f"{key} failed: {text[:180]}. Trying next candidate.")
                last_error = err

        if quota_hits > 0 and quota_hits >= len(candidates):
            raise QuotaExceededError(
                "All configured LLM providers are rate-limited right now. Please wait a moment "
                "and try again, or select a different provider in the Admin portal."
            )
        raise RuntimeError(f"All LLM candidates failed. Last error: {last_error}")

    # ---- public API (kept identical to the old GeminiService so callers don't change) ----
    async def generate_json(self, prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        return await self._generate(prompt, system_instruction, want_json=True)

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        return await self._generate(prompt, system_instruction, want_json=False)

    def get_config(self) -> Dict[str, Any]:
        configured = self.configured_providers()
        return {
            "active_provider": self.active_provider,
            "active_model": self.active_model or (PROVIDERS[self.active_provider]["models"][0] if self.active_provider in PROVIDERS else None),
            "provider_order": self.provider_order,
            "configured_providers": configured,
            "providers": [
                {"name": p, "configured": p in configured, "models": PROVIDERS[p]["models"]}
                for p in PROVIDERS
            ],
            # Back-compat fields for the existing admin UI:
            "available_models": [m for p in PROVIDERS for m in PROVIDERS[p]["models"]],
            "fallback_models": [m for p in self.provider_order for m in PROVIDERS[p]["models"]],
            "temperature": self.temperature,
            "is_configured": self.is_configured,
        }

    def set_config(self, model_name: Optional[str] = None, temperature: Optional[float] = None, provider: Optional[str] = None) -> Dict[str, Any]:
        if provider and provider in PROVIDERS:
            self.active_provider = provider
            self.active_model = None  # reset to the provider's default list unless a model is also given
            logger.info(f"Active LLM provider switched to: {provider}")
        if model_name:
            # Accept a model and, if it belongs to a known provider, switch to that provider too.
            owner = next((p for p in PROVIDERS if model_name in PROVIDERS[p]["models"]), None)
            if owner:
                self.active_provider = owner
                self.active_model = model_name
                logger.info(f"Active model set to {model_name} (provider {owner}).")
            else:
                logger.warning(f"Model '{model_name}' not in any provider's list; ignoring.")
        if temperature is not None:
            self.temperature = max(0.0, min(1.0, float(temperature)))
        return self.get_config()


llm_client = LLMService()
