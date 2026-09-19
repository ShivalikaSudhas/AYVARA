from pathlib import Path
try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    _PYDANTIC_V2 = True
except ImportError:
    from pydantic import BaseSettings

    _PYDANTIC_V2 = False

BASE_DIR = Path(__file__).resolve().parents[2]
class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    FRONTEND_URL: str = "http://localhost:5173"
    SOCKET_CORS_ORIGIN: str = "http://localhost:5173"

    if _PYDANTIC_V2:
        model_config = SettingsConfigDict(
            env_file=BASE_DIR / ".env",
            env_file_encoding="utf-8",
            extra="ignore",
        )
    else:
        class Config:
            env_file = BASE_DIR / ".env"
            env_file_encoding = "utf-8"
            extra = "ignore"
settings = Settings()