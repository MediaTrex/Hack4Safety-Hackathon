import uvicorn
from app.config.settings import get_settings

if __name__ == "__main__":
    settings = get_settings()
    
    uvicorn.run(
        "app.main:app",
        host=settings.ALLOWED_ORIGINS[0].split("://")[1].split(":")[0] if "localhost" in settings.ALLOWED_ORIGINS[0] else "0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
