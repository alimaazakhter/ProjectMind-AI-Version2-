import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # --- LLM provider API keys (any subset may be set; the engine uses whatever is present) ---
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")

    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
    # Active provider the engine tries FIRST (falls back to the others automatically).
    # Groq is default because it is by far the fastest free option.
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq")
    # Priority order for automatic failover across providers. Ordered fastest-first
    # (measured): Groq & Mistral respond in ~2-3s; Gemini is fast when its quota isn't
    # exhausted; OpenRouter's free models are queued and slow (~30s) so they are last.
    LLM_PROVIDER_ORDER: str = os.getenv("LLM_PROVIDER_ORDER", "groq,mistral,gemini,openrouter")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5000")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
