from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config.settings import get_settings
from app.config.database import connect_to_mongo, close_mongo_connection
from app.routes.auth_routes import router as auth_router
from app.routes.sos_report_operation_routes import router as sos_report_operation_router
from app.routes.assign_operations_routes import router as assign_operations_router
from app.routes.rescue_team_location_ws_routes import router as rescue_team_location_ws_router
from app.routes.geospatial_routes import router as geospatial_router
from app.routes.notifications_ws_routes import router as notifications_ws_router
from app.routes.admin_dashboard_ws_routes import router as admin_dashboard_ws_router
from app.routes.dashboard_routes import router as dashboard_router
from app.routes.mission_routes import router as mission_router
from app.routes.admin_broadcast_ws_routes import router as admin_broadcast_ws_router
from app.routes.citizen_routes import router as citizen_router
from app.routes.expo_notification_routes import router as expo_notification_router


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    # Ensure Expo tokens collection has unique index on (user_id, expo_push_token)
    from app.config.database import get_collection
    from motor.motor_asyncio import AsyncIOMotorClient
    col = await get_collection("expo_push_tokens")
    # Create compound unique index if it doesn't exist
    await col.create_index([("user_id", 1), ("expo_push_token", 1)], unique=True)
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
app.include_router(rescue_team_location_ws_router)
app.include_router(geospatial_router)
app.include_router(notifications_ws_router)
app.include_router(admin_broadcast_ws_router)
app.include_router(dashboard_router)
app.include_router(mission_router)
app.include_router(expo_notification_router)
app.include_router(citizen_router)


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

