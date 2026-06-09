from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config.settings import get_settings
from app.config.database import connect_to_mongo, close_mongo_connection
from app.routes.auth_routes import router as auth_router
from app.routes.sos_report_operation_routes import router as sos_report_operation_router
from app.routes.assign_operations_routes import router as assign_operations_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="SAJAG AI - Smart Disaster Response & Rescue Coordination Platform",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes


app.include_router(auth_router)
app.include_router(sos_report_operation_router)
app.include_router(assign_operations_router)




@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to SAJAG AI - Smart Disaster Response & Rescue Coordination Platform API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

