from fastapi import APIRouter, Depends, HTTPException, status
from app.middleware.auth import require_role
from app.schemas.notification_schemas import RegisterTokenRequest, UnregisterTokenRequest, AdminBroadcastRequest, SendToUserRequest
from app.services.expo_notification_service import expo_notification_service

router = APIRouter(prefix="/notifications", tags=["Expo Notifications"])

@router.post("/register-token", response_model=dict)
async def register_token(request: RegisterTokenRequest):
    """Register or update an Expo push token for the specified user (no auth)."""
    result = await expo_notification_service.register_token(user_id=request.user_id, expo_push_token=request.expo_push_token, platform=request.platform)
    return {"detail": "Token registered", "result": result}

@router.delete("/unregister-token", response_model=dict)
async def unregister_token(request: UnregisterTokenRequest):
    """Remove an Expo push token for the specified user (no auth)."""
    result = await expo_notification_service.unregister_token(user_id=request.user_id, expo_push_token=request.expo_push_token)
    if result["deleted_count"] == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token not found")
    return {"detail": "Token unregistered", "result": result}

@router.post("/admin/broadcast", response_model=dict, dependencies=[Depends(require_role("admin"))])
async def admin_broadcast(request: AdminBroadcastRequest):
    """Admin endpoint to broadcast a push notification to all users."""
    results = await expo_notification_service.broadcast_notification(title=request.title, body=request.body, data=request.data)
    return {"detail": "Broadcast sent", "results": results}

@router.post("/admin/send-to-user/{user_id}", response_model=dict, dependencies=[Depends(require_role("admin"))])
async def send_to_user(user_id: str, request: SendToUserRequest):
    """Admin endpoint to send a push notification to a specific user."""
    results = await expo_notification_service.send_push_to_user(user_id=user_id, title=request.title, body=request.body, data=request.data)
    if not results:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No tokens found for user")
    return {"detail": f"Notification sent to user {user_id}", "results": results}
