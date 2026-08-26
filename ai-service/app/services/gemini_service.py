import json
import logging
from typing import Optional, Dict, Any
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger("gemini_service")

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self.is_configured = bool(
            self.api_key
            and self.api_key != "your-gemini-api-key-here"
            and not self.api_key.startswith("your-")
        )

        if self.is_configured:
            try:
                genai.configure(api_key=self.api_key)
                logger.info(f"Google Gemini SDK initialized with model: {self.model_name}")
            except Exception as e:
                logger.error(f"Failed to configure Gemini SDK: {e}")
                self.is_configured = False
        else:
            logger.warning("Gemini API key is not configured or using placeholder. Running in fallback mode.")

    async def generate_json(self, prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes a prompt against Google Gemini with JSON enforcement.
        """
        if not self.is_configured:
            raise ValueError("GEMINI_API_KEY is not configured in ai-service/.env")

        try:
            model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=system_instruction,
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.4,
                    "top_p": 0.95,
                },
            )

            response = model.generate_content(prompt)
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
            logger.error(f"Failed to parse Gemini JSON output: {err}. Raw text: {raw_text[:200]}")
            raise RuntimeError(f"Gemini output parsing error: {err}")
        except Exception as err:
            logger.error(f"Gemini API request failed: {err}")
            raise RuntimeError(f"Gemini generation error: {err}")

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """
        Executes a conversational prompt against Google Gemini.
        """
        if not self.is_configured:
            raise ValueError("GEMINI_API_KEY is not configured in ai-service/.env")

        try:
            model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=system_instruction,
                generation_config={
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "max_output_tokens": 1024,
                },
            )
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as err:
            logger.error(f"Gemini text generation failed: {err}")
            raise RuntimeError(f"Gemini API error: {err}")

gemini_client = GeminiService()
