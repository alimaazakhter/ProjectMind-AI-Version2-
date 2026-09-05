import os
import re
import json
import time
import asyncio
import logging
from typing import Dict, Any, Optional, List
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger("gemini-service")

# NOTE: gemini-3.5-flash-lite is intentionally NOT in the automatic fallback chain.
# It is ~8x slower (~138s vs ~17s) at producing the large structured-JSON blueprint
# schema; when a faster model returned a 429 (quota) or truncated JSON, the pipeline
# used to fall through to flash-lite and hang ~140s per agent, tripping the gateway
# timeout and surfacing as "AI unavailable". The auto-fallback now uses only fast
# models. flash-lite stays selectable by an admin (AVAILABLE_MODELS) but is never an
# automatic fallback.
# The automatic fallback chain must contain ONLY models this account can actually call
# (gemini-2.5-pro returns 404 "no longer available to new users" and was removed) and
# must span several models so that when one model's free-tier daily quota (20 req/day
# per model) is exhausted, generation continues on another model's fresh quota instead
# of failing. Each model here has its own independent daily bucket. All are fast
# flash-tier models (~10-40s); the slow flash-lite is not auto-used.
FALLBACK_MODELS = [
    "gemini-3.5-flash",        # primary quality default (fast when quota available)
    "gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-3-flash-preview",  # separate daily quota
    "gemini-3.1-flash-lite",   # fast lite, separate daily quota
    "gemini-3.6-flash",        # LAST: has quota but is slow (~70s) — only if all else fails
]
AVAILABLE_MODELS = [
    "gemini-3.5-flash", "gemini-3.6-flash", "gemini-flash-latest", "gemini-2.5-flash",
    "gemini-3-flash-preview", "gemini-3.1-flash-lite", "gemini-3.5-flash-lite",
]

# A single Gemini call must never hang the multi-agent pipeline. The full blueprint
# runs 3 sequential waves of agents, so each individual call is hard-capped well below
# the backend's 180s gateway timeout.
PER_CALL_TIMEOUT_S = 70.0

# Process-level cooldown for models that returned HTTP 429 (daily/rate quota exhausted).
# Free-tier limits are per-model, so once a model 429s we skip it for the cooldown window
# instead of paying the round-trip (and the SDK's backoff) on every subsequent agent call.
_MODEL_COOLDOWN: Dict[str, float] = {}
_DEFAULT_COOLDOWN_S = 60.0


class QuotaExceededError(RuntimeError):
    """Raised when every candidate model is rate-limited (HTTP 429)."""


def _is_quota_error(err: Exception) -> bool:
    text = str(err).lower()
    return "429" in text or "resourceexhausted" in text or "quota" in text or "rate limit" in text


def _retry_delay_from_error(err: Exception) -> float:
    """Extract the server-suggested retry delay (seconds) from a 429 payload, if present."""
    match = re.search(r"retry in (\d+(?:\.\d+)?)s", str(err))
    if match:
        try:
            return min(float(match.group(1)), 300.0)
        except ValueError:
            pass
    return _DEFAULT_COOLDOWN_S


def _sanitize_json_escapes(text: str) -> str:
    """Escape stray backslashes that are NOT part of a valid JSON escape sequence.
    Models frequently emit raw '\\' inside strings (LaTeX, regexes, Windows paths),
    e.g. '\\d' or '\\ ', which makes json.loads raise 'Invalid \\escape'. Doubling those
    lone backslashes lets the JSON parse instead of forcing a fall-through to a slower
    (or quota-exhausted) model."""
    return re.sub(r'\\(?!["\\/bfnrtu])', r'\\\\', text)


def _repair_json(raw_text: str) -> str:
    """Strip markdown fences and best-effort repair a malformed JSON object/array
    (invalid escape sequences and/or truncation) so a single bad response does not
    force a fall-through to a slower model."""
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
    # Repair invalid escape sequences first (most common model JSON defect).
    sanitized = _sanitize_json_escapes(text)
    try:
        json.loads(sanitized)
        return sanitized
    except json.JSONDecodeError:
        text = sanitized
    # Truncated output: cut back to the last complete brace/bracket and close the structure.
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
        candidate += "}" * depth if open_char == "{" else "]" * depth
    return candidate

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self.temperature = 0.4
        self.available_models = AVAILABLE_MODELS
        self.is_configured = bool(self.api_key and not self.api_key.startswith("your-"))

        if self.is_configured:
            try:
                genai.configure(api_key=self.api_key)
                logger.info(f"Google Gemini SDK initialized with model: {self.model_name}")
            except Exception as e:
                logger.error(f"Failed to configure Gemini SDK: {e}")
                self.is_configured = False
        else:
            logger.warning("Gemini API key is not configured or using placeholder. Running in fallback mode.")

    def get_config(self) -> Dict[str, Any]:
        return {
            "active_model": self.model_name,
            "fallback_models": FALLBACK_MODELS,
            "available_models": self.available_models,
            "temperature": self.temperature,
            "is_configured": self.is_configured,
        }

    def set_config(self, model_name: Optional[str] = None, temperature: Optional[float] = None) -> Dict[str, Any]:
        if model_name:
            if model_name in self.available_models:
                self.model_name = model_name
                logger.info(f"Active Gemini model switched to: {self.model_name}")
            else:
                logger.warning(f"Requested model '{model_name}' not in supported list. Keeping '{self.model_name}'.")
        if temperature is not None:
            self.temperature = max(0.0, min(1.0, float(temperature)))
            logger.info(f"Generation temperature set to: {self.temperature}")
        return self.get_config()

    def _ordered_candidates(self) -> List[str]:
        """Candidate models to try, in order, with currently rate-limited (cooling-down)
        models pushed to the back so we spend time on models that can actually answer."""
        base = [self.model_name] + [m for m in FALLBACK_MODELS if m != self.model_name]
        now = time.time()
        ready = [m for m in base if _MODEL_COOLDOWN.get(m, 0) <= now]
        cooling = [m for m in base if _MODEL_COOLDOWN.get(m, 0) > now]
        return ready + cooling

    async def generate_json(self, prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes a prompt against Google Gemini with JSON enforcement and multi-model fallback.
        """
        if not self.is_configured:
            raise ValueError("GEMINI_API_KEY is not configured in ai-service/.env")

        candidate_models = self._ordered_candidates()
        last_error = None
        quota_hits = 0

        for model_candidate in candidate_models:
            try:
                model = genai.GenerativeModel(
                    model_name=model_candidate,
                    system_instruction=system_instruction,
                    generation_config={
                        "response_mime_type": "application/json",
                        "temperature": self.temperature,
                        "top_p": 0.95,
                        # Roomy cap so a rich blueprint section (methodology + algorithms
                        # + roadmap + tech stack) is never truncated mid-JSON, which used
                        # to force an expensive fall-through to a slower model.
                        "max_output_tokens": 16384,
                    },
                )

                response = await asyncio.wait_for(
                    model.generate_content_async(prompt), timeout=PER_CALL_TIMEOUT_S
                )
                raw_text = response.text.strip()
                return json.loads(_repair_json(raw_text))

            except asyncio.TimeoutError:
                logger.warning(
                    f"Gemini call with {model_candidate} exceeded {PER_CALL_TIMEOUT_S:.0f}s; trying next candidate."
                )
                last_error = RuntimeError(f"{model_candidate} timed out after {PER_CALL_TIMEOUT_S:.0f}s")
            except json.JSONDecodeError as err:
                logger.error(
                    f"Failed to parse Gemini JSON output with {model_candidate}: {err}. Raw text: {raw_text[:200]}"
                )
                last_error = err
            except Exception as err:
                if _is_quota_error(err):
                    quota_hits += 1
                    _MODEL_COOLDOWN[model_candidate] = time.time() + _retry_delay_from_error(err)
                    logger.warning(f"Gemini model {model_candidate} is rate-limited (429); cooling down and skipping.")
                else:
                    logger.warning(f"Gemini API attempt with {model_candidate} failed: {err}. Trying next candidate model...")
                last_error = err

        if quota_hits > 0 and quota_hits >= len(candidate_models):
            raise QuotaExceededError(
                "Gemini API rate limit reached for all available models (free-tier quota exhausted). "
                "Please wait for the quota to reset or configure a billing-enabled GEMINI_API_KEY, then retry."
            )
        raise RuntimeError(f"All Gemini model candidates failed. Last error: {last_error}")

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """
        Executes a conversational prompt against Google Gemini with fallback.
        """
        if not self.is_configured:
            raise ValueError("GEMINI_API_KEY is not configured in ai-service/.env")

        candidate_models = self._ordered_candidates()
        last_error = None
        quota_hits = 0

        for model_candidate in candidate_models:
            try:
                model = genai.GenerativeModel(
                    model_name=model_candidate,
                    system_instruction=system_instruction,
                    generation_config={
                        "temperature": min(1.0, self.temperature + 0.3),
                        "top_p": 0.95,
                        "max_output_tokens": 1024,
                    },
                )
                response = await asyncio.wait_for(
                    model.generate_content_async(prompt), timeout=PER_CALL_TIMEOUT_S
                )
                return response.text.strip()
            except asyncio.TimeoutError:
                logger.warning(f"Gemini text call with {model_candidate} exceeded {PER_CALL_TIMEOUT_S:.0f}s; trying next.")
                last_error = RuntimeError(f"{model_candidate} timed out")
            except Exception as err:
                if _is_quota_error(err):
                    quota_hits += 1
                    _MODEL_COOLDOWN[model_candidate] = time.time() + _retry_delay_from_error(err)
                    logger.warning(f"Gemini text model {model_candidate} is rate-limited (429); cooling down and skipping.")
                else:
                    logger.warning(f"Gemini text attempt with {model_candidate} failed: {err}. Trying next candidate...")
                last_error = err

        if quota_hits > 0 and quota_hits >= len(candidate_models):
            raise QuotaExceededError(
                "Gemini API rate limit reached for all available models (free-tier quota exhausted). "
                "Please wait for the quota to reset or configure a billing-enabled GEMINI_API_KEY, then retry."
            )
        raise RuntimeError(f"All Gemini text model candidates failed. Last error: {last_error}")

gemini_client = GeminiService()
