from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import HTTPException

from app.config.database import get_collection
from app.schemas.assign_operations_schemas import AssignOperationsRequest


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


async def assign_operations(payload: AssignOperationsRequest) -> Dict[str, Any]:
    users_col = await get_collection("users")
    operations_col = await get_collection("operations")
    sos_col = await get_collection("sos")
    assigns_col = await get_collection("assign_operations")

    # Validate team exists
    team = await users_col.find_one({"_id": ObjectId(payload.teamId)})

    if not team:
        raise HTTPException(status_code=404, detail="rescue_team user not found")

    # Validate operation exists
    op_doc = await operations_col.find_one({"_id": ObjectId(payload.operationId)})

    if not op_doc:
        raise HTTPException(status_code=404, detail="operation not found")

 


    # Build rescue_team_location for storage
    rescue_team_location = payload.rescue_team_location.model_dump()


    # Update Operations collection: assignId, rescue_team_location, status, taskStatus
    await operations_col.update_one(
        {"_id": op_doc["_id"]},
        {
            "$set": {
                "assignId": payload.teamId,
                "rescue_team_location": rescue_team_location,
                "status": "assigned",
                "taskStatus": "assigned",
                "updated_at": _utcnow(),
            }
        },
    )


    # Update SOS collection: set status to assigned for docs tied to this operation
    # (If your SOS schema links SOS to operations via an `operationId` field, this will work.)
    await sos_col.update_many(
        {"operationId": payload.operationId},
        {"$set": {"status": "assigned", "updated_at": _utcnow()}},
    )

    # Create assign_operations document (only metadata + generated id)
    # Keep response compatible with AssignOperationsDoc schema
    doc = {
        "teamId": payload.teamId,
        "operationId": payload.operationId,
        "rescue_team_location": rescue_team_location,
        "status": "assigned",
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }



    res = await assigns_col.insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    return doc

