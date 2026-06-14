from __future__ import annotations

from app.utils.generate_operation_id import generate_operation_id
from bson import ObjectId

from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple

from fastapi import HTTPException

from app.config.database import get_collection
from app.schemas.sos_report_operation_schemas import (
    OperationCreateInternal,
    ReportCreateRequest,
    SOSCreateRequest,
)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


async def create_sos(payload: SOSCreateRequest) -> str:
    sos_col = await get_collection("sos")
    operations_col = await get_collection("operations")

    sos_doc: Dict[str, Any] = {
        "location": payload.location.model_dump(),
        "address": payload.address,
        "emergency_type": payload.emergency_type,
        "mobile_no": payload.mobile_no,
        "additional_details": payload.additional_details,
        # priority is placeholder (later filled by AI model)
        "priority": "high",
        # status is driven by operation.taskStatus
        "status": "not_assign",
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }



    res = await sos_col.insert_one(sos_doc)
    sos_id = str(res.inserted_id)
    
    operation_id = await generate_operation_id()

    op: OperationCreateInternal = OperationCreateInternal(
        operation_id=operation_id,
        sos_id=sos_id,
        assignId=None,
        sos_location=payload.location.model_dump(),
        rescue_team_location=None,
        status="not_assign",
        taskStatus="not_assign",
    )

    # Ensure indexes exist for faster retrieval at scale.
    # (safe to call; Mongo will ignore if already created)
    await operations_col.create_index([("created_at", -1)])
    await operations_col.create_index([("taskStatus", 1), ("created_at", -1)])
    await sos_col.create_index([("created_at", -1)])


    await operations_col.insert_one(
        {
            "operation_id": op.operation_id,
            "sos_id": op.sos_id,
            "assignId": op.assignId,
            "sos_location": op.sos_location,
            "rescue_team_location": op.rescue_team_location,
            "status": op.status,
            "taskStatus": op.taskStatus,
            "created_at": _utcnow(),
            "updated_at": _utcnow(),
        }
    )

    return sos_id


async def create_report(payload: ReportCreateRequest) -> str:
    reports_col = await get_collection("reports")

    # Ensure indexes exist for faster retrieval at scale.
    await reports_col.create_index([("created_at", -1)])
    await reports_col.create_index([("mobile_no", 1), ("created_at", -1)])

    report_doc: Dict[str, Any] = {

        "incident_type": payload.incident_type,
        "description": payload.description,
        "media": payload.media,
        "voice_messages": payload.voice_messages,
        "mobile_no": payload.mobile_no,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }

    res = await reports_col.insert_one(report_doc)
    return str(res.inserted_id)


async def list_operations(limit: int = 50) -> list[dict]:
    operations_col = await get_collection("operations")

    cursor = (
        operations_col.find({})
        .sort("created_at", -1)
        .limit(limit)
    )

    out: list[dict] = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        out.append(doc)
    return out


async def list_sos(limit: int = 50) -> list[dict]:
    sos_col = await get_collection("sos")

    cursor = (
        sos_col.find({})
        .sort("created_at", -1)
        .limit(limit)
    )

    out: list[dict] = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        out.append(doc)

    return out

async def update_operation_task_status(operation_id: str, payload) -> bool:
    """
    Rules:
    - SOS.status mirrors Operation.taskStatus
    - If taskStatus == 'completed':
        * Operation.status = 'completed'
        * Delete SOS document
    - Otherwise:
        * Operation.status remains 'assigned'
        * Update SOS.status to match taskStatus
    """

    operations_col = await get_collection("operations")
    sos_col = await get_collection("sos")

    now = _utcnow()

    # Find operation
    op_doc = await operations_col.find_one({"_id": operation_id})

    if not op_doc:
        try:
            op_doc = await operations_col.find_one(
                {"_id": ObjectId(operation_id)}
            )
        except Exception:
            op_doc = None

    if not op_doc:
        return False

    new_task_status = payload.taskStatus
    old_task_status = op_doc.get("taskStatus", "not_assign")

    # Overall operation status
    if new_task_status == "completed":
        new_operation_status = "completed"
    elif new_task_status == "not_assign":
        new_operation_status = "not_assign"
    else:
        new_operation_status = "assigned"

    # Update operation
    await operations_col.update_one(
        {"_id": op_doc["_id"]},
        {
            "$set": {
                "taskStatus": new_task_status,
                "status": new_operation_status,
                "updated_at": now,
            }
        },
    )

    # Sync SOS
    sos_id = op_doc.get("sos_id")

    if sos_id:
        try:
            sos_object_id = ObjectId(sos_id)

            if new_task_status == "completed":
                # Delete SOS when operation is completed
                await sos_col.delete_one(
                    {"_id": sos_object_id}
                )
                
                # Send completion notification to team
                from app.services.notification_service import notification_manager
                assign_id = op_doc.get("assignId")
                if assign_id:
                    await notification_manager.notify_operation_completed(
                        team_id=str(assign_id),
                        operation_id=str(op_doc["_id"]),
                        sos_id=sos_id,
                    )
            else:
                # Keep SOS status synced with taskStatus
                await sos_col.update_one(
                    {"_id": sos_object_id},
                    {
                        "$set": {
                            "status": new_task_status,
                            "updated_at": now,
                        }
                    },
                )
                
                # Send status update notification
                from app.services.notification_service import notification_manager
                assign_id = op_doc.get("assignId")
                if assign_id:
                    await notification_manager.notify_status_update(
                        team_id=str(assign_id),
                        operation_id=str(op_doc["_id"]),
                        old_status=old_task_status,
                        new_status=new_task_status,
                    )

        except Exception:
            pass

    return True


async def get_operation(operation_id: str) -> Optional[dict]:
    operations_col = await get_collection("operations")

    # Mongo stores _id as ObjectId; this codebase converts to string in responses,
    # but for querying we need to try both patterns.
    # If _id is ObjectId in DB, passing string may not match; so do a safe lookup.
    doc = await operations_col.find_one({"_id": operation_id})
    if doc:
        doc["_id"] = str(doc["_id"])
        return doc

    # fallback: try ObjectId conversion
    try:
        from bson import ObjectId

        doc = await operations_col.find_one({"_id": ObjectId(operation_id)})
        if not doc:
            return None
        doc["_id"] = str(doc["_id"])
        return doc
    except Exception:
        return None

