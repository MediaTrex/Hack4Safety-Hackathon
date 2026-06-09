from fastapi import APIRouter, HTTPException

from app.schemas.assign_operations_schemas import (
    AssignOperationsDoc,
    AssignOperationsRequest,
)
from app.services.assign_operations_service import assign_operations


router = APIRouter(tags=["assignment"])


@router.post("/assign-operations", response_model=AssignOperationsDoc)
async def assign_operations_endpoint(payload: AssignOperationsRequest):
    try:
        doc = await assign_operations(payload)
        return doc
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

