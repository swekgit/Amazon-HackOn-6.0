from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = Field(default="HackOn Personalization API", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    app_version: str = Field(default="0.1.0", alias="APP_VERSION")
    api_v1_prefix: str = Field(default="/api/v1", alias="API_V1_PREFIX")

    database_url: str = Field(
        default="postgresql+psycopg://hackon:hackon@localhost:5432/hackon_db",
        alias="DATABASE_URL",
    )

    rainforest_api_key: str | None = Field(default=None, alias="RAINFOREST_API_KEY")
    gemini_api_key: str | None = Field(default=None, alias="GEMINI_API_KEY")

    twilio_account_sid: str | None = Field(default=None, alias="TWILIO_ACCOUNT_SID")
    twilio_auth_token: str | None = Field(default=None, alias="TWILIO_AUTH_TOKEN")
    twilio_whatsapp_from: str | None = Field(default=None, alias="TWILIO_WHATSAPP_FROM")
    twilio_whatsapp_template_sid: str | None = Field(
        default=None,
        alias="TWILIO_WHATSAPP_TEMPLATE_SID",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
