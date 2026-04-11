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

    # GitHub Models for AI and OCR
    github_token: str = ""
    github_models_base_url: str = "https://models.github.ai/inference"
    github_chat_model: str = "openai/gpt-4o"
    github_vision_model: str = "openai/gpt-4o"

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
