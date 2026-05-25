from functools import lru_cache
import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Personal Finance Manager"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    MONGODB_URI: str = ""
    MONGODB_DB_NAME: str = "finance_manager"
    MONGODB_SERVER_SELECTION_TIMEOUT_MS: int = 10000
    # For quick prototype debugging only: allow invalid TLS certs when connecting to MongoDB.
    # DO NOT enable in production. Prefer rotating credentials and using a proper runtime.
    MONGODB_TLS_ALLOW_INVALID_CERTS: bool = False

    JWT_SECRET_KEY: str = Field(default="replace-with-a-long-random-secret", min_length=16)
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    CORS_ORIGINS: str = (
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:5174,http://127.0.0.1:5174,"
        "http://localhost:5175,http://127.0.0.1:5175"
    )
    CORS_ORIGIN_REGEX: str = r"^https://.*\.netlify\.app$"

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def mongodb_configured(self) -> bool:
        return bool(self.MONGODB_URI.strip())

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in {"production", "prod"} or os.getenv("RENDER", "").lower() == "true"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def cors_origin_regex(self) -> str | None:
        return self.CORS_ORIGIN_REGEX.strip() or None


@lru_cache
def get_settings() -> Settings:
    return Settings()
