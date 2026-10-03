from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "Voice Coach AI"
    DEBUG: bool = False
    DATABASE_URL: str = "sqlite:///./voice_coach.db"
    UPLOAD_DIR: str = "./storage/uploads"
    MAX_FILE_SIZE_MB: int = 100
    MAX_DURATION_SEC: int = 600
    ALLOWED_AUDIO_TYPES: List[str] = ["audio/wav", "audio/mpeg", "audio/mp4", "audio/webm", "audio/x-m4a"]
    ALLOWED_EXTENSIONS: List[str] = [".wav", ".mp3", ".m4a", ".webm"]
    LLM_PROVIDER: str = "openai"
    LLM_MODEL: str = "gpt-4o"
    LLM_API_KEY: str = ""
    STT_PROVIDER: str = "openai"
    STT_API_KEY: str = ""
    AUDIO_RETENTION_HOURS: int = 24
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
