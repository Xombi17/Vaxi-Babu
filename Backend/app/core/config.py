from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "Backend/.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    # Render uses PORT, local dev uses APP_PORT or defaults to 8080
    app_port: int = Field(default=8080, alias="PORT", validation_alias="APP_PORT")
    log_level: str = "INFO"

    # CORS
    frontend_url: str = "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://127.0.0.1:3000,http://127.0.0.1:3001,https://well-sync-nine.vercel.app"

    # Database
    database_url: str

    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    # GitHub Models for AI and OCR
    github_token: str = ""
    github_models_base_url: str = "https://models.github.ai/inference"
    github_chat_model: str = "openai/gpt-4o"
    github_vision_model: str = "openai/gpt-4o"

    # Vapi webhook
    vapi_webhook_secret: str = ""

    # Sarvam AI (Indian languages - STT, TTS, Translation)
    sarvam_api_key: str = ""

    # Auth
    secret_key: str = "very-secret-dev-key-wellsync-ai"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    @property
    def is_dev(self) -> bool:
        return self.app_env == "development"

    @property
    def is_prod(self) -> bool:
        return self.app_env == "production"

    # Twilio for WhatsApp/SMS notifications
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    notification_phone: str = ""

    # Vapi for IVR calls
    vapi_api_key: str = ""
    vapi_assistant_id: str = ""
    vapi_phone_number_id: str = ""

    # Google Gemini Live API (for Hindi/Marathi voice)
    google_ai_api_key: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
