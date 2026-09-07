"""
Back-compat shim.

The LLM engine is now multi-provider (Groq / Gemini / OpenRouter / Mistral) and lives in
`app.services.llm_service`. This module re-exports the same names the rest of the codebase
already imports (`gemini_client`, `QuotaExceededError`) so no agent/route needs to change.
"""
from app.services.llm_service import (  # noqa: F401
    llm_client as gemini_client,
    LLMService,
    QuotaExceededError,
    PROVIDERS,
)
