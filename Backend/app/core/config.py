from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    log_level: str = "INFO"

    # CORS
    frontend_url: str = "http://localhost:3000"

    # Database
    database_url: str

    # Groq AI
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # Ollama OCR
    ollama_base_url: str = "http://localhost:11434"
    ollama_primary_model: str = "gemma4"
    ollama_fallback_model: str = "llama3.2-vision"

    # Google Cloud Vision (optional OCR fallback)
    google_cloud_vision_api_key: str = ""

    # Vapi webhook
    vapi_webhook_secret: str = ""

    @property
    def is_dev(self) -> bool:
        return self.app_env == "development"

    @property
    def is_prod(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
