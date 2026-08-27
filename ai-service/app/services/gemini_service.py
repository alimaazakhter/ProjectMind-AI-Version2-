import os
import json
import logging
from typing import Dict, Any, Optional, List
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger("gemini-service")

FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-flash-latest", "gemini-2.5-flash"]
AVAILABLE_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-flash-latest", "gemini-2.5-flash", "gemini-2.5-pro"]

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

    async def generate_json(self, prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes a prompt against Google Gemini with JSON enforcement and multi-model fallback.
        """
        if not self.is_configured:
            raise ValueError("GEMINI_API_KEY is not configured in ai-service/.env")

        candidate_models = [self.model_name] + [m for m in FALLBACK_MODELS if m != self.model_name]
        last_error = None

        for model_candidate in candidate_models:
            try:
                model = genai.GenerativeModel(
                    model_name=model_candidate,
                    system_instruction=system_instruction,
                    generation_config={
                        "response_mime_type": "application/json",
                        "temperature": self.temperature,
                        "top_p": 0.95,
                    },
                )

                response = await model.generate_content_async(prompt)
                raw_text = response.text.strip()
                
                # Clean possible markdown wrapping
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                if raw_text.startswith("```"):
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]

                return json.loads(raw_text.strip())

            except json.JSONDecodeError as err:
                logger.error(f"Failed to parse Gemini JSON output with {model_candidate}: {err}. Raw text: {raw_text[:200]}")
                last_error = err
            except Exception as err:
                logger.warning(f"Gemini API attempt with {model_candidate} failed: {err}. Trying next candidate model...")
                last_error = err

        raise RuntimeError(f"All Gemini model candidates failed. Last error: {last_error}")

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """
        Executes a conversational prompt against Google Gemini with fallback.
        """
        if not self.is_configured:
            raise ValueError("GEMINI_API_KEY is not configured in ai-service/.env")

        candidate_models = [self.model_name] + [m for m in FALLBACK_MODELS if m != self.model_name]
        last_error = None

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
                response = await model.generate_content_async(prompt)
                return response.text.strip()
            except Exception as err:
                logger.warning(f"Gemini text attempt with {model_candidate} failed: {err}. Trying next candidate...")
                last_error = err

        raise RuntimeError(f"All Gemini text model candidates failed. Last error: {last_error}")

gemini_client = GeminiService()
