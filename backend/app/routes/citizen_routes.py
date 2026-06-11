from fastapi import APIRouter
from app.config.database import get_collection
from app.config.security import JWTHandler

router = APIRouter(tags=["citizen"])

@router.post("/citizen", response_model=dict)
async def create_citizen():
    """Create a citizen document, return ID, role, and JWT token."""
    col = await get_collection("citizens")
    result = await col.insert_one({"role": "citizen"})
    citizen_id = str(result.inserted_id)
    token = JWTHandler.create_access_token({"user_id": citizen_id, "role": "citizen"})
    return {"_id": citizen_id, "role": "citizen", "access_token": token}