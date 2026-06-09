"""
SAJAG AI - WebSocket Routes
============================
Add these routes to prediction_api.py (or your main FastAPI app).

These are the MISSING WebSocket endpoints — the rest of the API is HTTP REST.
The React dashboard and React Native app connect to these for real-time updates.

HOW TO INTEGRATE
-----------------
In prediction_api.py, add at the top:
    from utils.websocket_manager import ws_manager

Then paste the routes below into your FastAPI app.

FRONTEND CONNECTION (React dashboard):
    const ws = new WebSocket("ws://localhost:8001/ws/dashboard-1?rooms=command_center");

REACT NATIVE (Rescue team app):
    const ws = new WebSocket("ws://localhost:8001/ws/team-T001?rooms=rescue_teams");

CITIZEN APP:
    const ws = new WebSocket("ws://localhost:8001/ws/citizen-XYZ?rooms=citizens");
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional, List
from loguru import logger

# Import singleton from utils
from utils.websocket_manager import ws_manager

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    client_id: str,
    rooms: Optional[str] = Query(
        default="command_center",
        description="Comma-separated room names: command_center,rescue_teams,citizens,admin"
    ),
):
    """
    Main WebSocket endpoint for real-time updates.

    Query params:
        rooms: comma-separated list of rooms to subscribe
               e.g. ?rooms=command_center,rescue_teams

    Events the client receives (JSON):
        { "event": "connected",       "client_id": "...", "rooms": [...] }
        { "event": "sos_alert",       "incident_id": "...", "disaster_type": "...", ... }
        { "event": "heatmap_update",  "heatmap_type": "flood", "summary": {...} }
        { "event": "team_dispatched", "incident_id": "...", "team_id": "...", ... }
        { "event": "risk_alert",      "risk_type": "...", "risk_level": "CRITICAL", ... }
        { "event": "mission_status",  "mission_id": "...", "status": "ON_WAY", ... }
        { "event": "citizen_alert",   "message": "...", "area": "..." }
        { "event": "pong" }

    Messages the client can send:
        { "action": "ping" }
        { "action": "join_room",  "room": "rescue_teams" }
        { "action": "leave_room", "room": "rescue_teams" }
        { "action": "ack" }
    """
    room_list = [r.strip() for r in rooms.split(",") if r.strip()]

    await ws_manager.connect(websocket, client_id, room_list)
    logger.info(f"WS client connected: {client_id} | rooms={room_list}")

    try:
        while True:
            data = await websocket.receive_text()
            await ws_manager.handle_message(client_id, data)
    except WebSocketDisconnect:
        ws_manager.disconnect(client_id)
        logger.info(f"WS client disconnected: {client_id}")


@router.get("/ws/stats")
async def websocket_stats():
    """Returns current WebSocket connection stats. Useful for monitoring."""
    return {
        "connected_clients": ws_manager.connected_count,
        "rooms":             ws_manager.room_stats,
    }


# ── How to wire this into prediction_api.py ────────────────────────────────────
#
# At the bottom of prediction_api.py, add:
#
#   from api.websocket_routes import router as ws_router
#   app.include_router(ws_router)
#
# Then call ws_manager from any endpoint to push real-time updates:
#
#   from utils.websocket_manager import ws_manager
#
#   @app.post("/sos/report")
#   async def report_sos(req: SOSReportRequest, background_tasks: BackgroundTasks):
#       incident = process_sos(req)
#       background_tasks.add_task(ws_manager.emit_sos_alert, incident)
#       return SOSReportResponse(...)
#
#   @app.post("/heatmap/generate")
#   async def generate_heatmap(req: HeatmapRequest, background_tasks: BackgroundTasks):
#       result = heatmap_gen.generate(...)
#       background_tasks.add_task(ws_manager.emit_heatmap_update, "flood", result["summary"])
#       return {"status": "success", "heatmap": result}
