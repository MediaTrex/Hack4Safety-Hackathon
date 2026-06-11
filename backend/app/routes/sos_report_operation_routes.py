from fastapi import APIRouter, HTTPException

from app.schemas.sos_report_operation_schemas import (
    OperationReadResponse,
    ReportCreateRequest,
    SOSCreateRequest,
    OperationUpdateTaskStatusRequest,
)




from app.services.sos_report_operation_service import (

    create_report,
    create_sos,
    get_operation,
    list_operations,
    list_sos,
    update_operation_task_status,
)



router = APIRouter(tags=["sos / report / operation"])


@router.post("/sos")
async def create_sos_endpoint(payload: SOSCreateRequest):
    result = await create_sos(payload)
    return {"message": "SOS created", "operation": result["operation"]}


@router.get("/get-sos")
async def get_sos(limit: int = 50):
    sos_list = await list_sos(limit=limit)
    return [s for s in sos_list]



@router.post("/reports")
async def create_report_endpoint(payload: ReportCreateRequest):
    report_id = await create_report(payload)
    return {"message": "Report created", "report_id": report_id}


@router.get("/operations")
async def operations_list(limit: int = 50):
    ops = await list_operations(limit=limit)
    # Convert to response models
    return [OperationReadResponse(**op).model_dump(by_alias=True) for op in ops]


@router.get("/operations/{operation_id}")
async def operation_get(operation_id: str):
    op = await get_operation(operation_id)
    if not op:
        raise HTTPException(status_code=404, detail="Operation not found")
    return OperationReadResponse(**op).model_dump(by_alias=True)


@router.patch("/operations/{operation_id}/task-status")
async def operation_update_task_status(operation_id: str, payload: OperationUpdateTaskStatusRequest):
    ok = await update_operation_task_status(operation_id=operation_id, payload=payload)

    if not ok:
        raise HTTPException(status_code=404, detail="Operation not found")
    return {"message": "Operation and SOS status updated"}


