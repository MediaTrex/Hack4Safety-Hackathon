from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.middleware.auth import verify_access_token, require_role
from app.services.notification_service import notification_manager
from app.services.expo_notification_service import expo_notification_service

router = APIRouter(tags=["admin-broadcast"])

@router.websocket("/ws/admin-broadcast")
async def admin_broadcast_ws(websocket: WebSocket):
    """WebSocket endpoint for admin to broadcast notifications to all citizens and rescue teams.
    Expected query params:
    - token: JWT token for admin authentication
    """
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008, reason="No token provided")
        return
    try:
        payload = verify_access_token(token)
    except Exception:
        await websocket.close(code=1008, reason="Invalid token")
        return
    if payload.get("role") != "admin":
        await websocket.close(code=1008, reason="Admin access required")
        return
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            # Expect a broadcast message payload, forward it to all connections
            # Forward message to WebSocket clients
            await notification_manager.broadcast_message(data)
            # Also send as Expo push notification to all registered devices
            title = data.get("title", "Alert")
            body = data.get("body", "Broadcast message")
            extra = data.get("data", {})
            await expo_notification_service.broadcast_notification(title=title, body=body, data=extra)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Admin broadcast WebSocket error: {e}")
        await websocket.close()
