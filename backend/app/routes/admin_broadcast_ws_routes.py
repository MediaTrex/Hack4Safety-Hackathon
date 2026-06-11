from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.middleware.auth import verify_access_token, require_role
from app.services.notification_service import notification_manager

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
            await notification_manager.broadcast_message(data)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Admin broadcast WebSocket error: {e}")
        await websocket.close()
