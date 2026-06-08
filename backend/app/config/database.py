import motor.motor_asyncio
from app.config.settings import get_settings

settings = get_settings()

class MongoDB:
    client: motor.motor_asyncio.AsyncIOMotorClient = None
    db = None

async def connect_to_mongo():
    """Connect to MongoDB"""
    MongoDB.client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
    MongoDB.db = MongoDB.client[settings.DATABASE_NAME]
    print(f"[OK] Connected to MongoDB: {settings.DATABASE_NAME}")

async def close_mongo_connection():
    """Close MongoDB connection"""
    if MongoDB.client:
        MongoDB.client.close()
        print("[X] Disconnected from MongoDB")

def get_database():
    """Get MongoDB database instance"""
    return MongoDB.db

async def get_collection(collection_name: str):
    """Get specific collection from MongoDB"""
    db = get_database()
    return db[collection_name]
