from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "SAJAG AI - Smart Disaster Response & Rescue Coordination Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Server
    HOST: str
    PORT: int
    
    # Allowed CORS origins
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "*"
    ]

    # MongoDB
    MONGODB_URL: str
    DATABASE_NAME: str

    # JWT & Cookie Settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Cookie Settings
    COOKIE_NAME: str = "access_token"
    COOKIE_SECURE: bool = False  # Set to True in production (requires HTTPS)
    COOKIE_HTTPONLY: bool = True
    COOKIE_SAMESITE: str = "lax"

    # AI/ML
    YOLO_MODEL: str = "yolov8n.pt"
    CONFIDENCE_THRESHOLD: float = 0.5
    
    DENSITY_LOW: int = 30
    DENSITY_MEDIUM: int = 60
    DENSITY_HIGH: int = 85

    API_KEY: str = "hack4safety_ai_engine_secret_2026"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()