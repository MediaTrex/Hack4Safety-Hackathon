"""
SAJAG AI - WebSocket Connection Manager
Handles real-time alert broadcasting to React dashboard and rescue team apps.

Usage in FastAPI:
    from utils.websocket_manager import ws_manager

    @app.websocket("/ws/{client_id}")
    async def websocket_endpoint(websocket: WebSocket, client_id: str):
        await ws_manager.connect(websocket, client_id)
        try:
            while True:
                data = await websocket.receive_text()
                await ws_manager.handle_message(client_id, data)
        except WebSocketDisconnect:
            ws_manager.disconnect(client_id)

Broadcast from anywhere:
    await ws_manager.broadcast_alert(alert_payload)
    await ws_manager.send_to_room("rescue_teams", payload)
"""

import json
import asyncio
from typing import Dict, List, Optional, Set
from fastapi import WebSocket, WebSocketDisconnect
from loguru import logger
from datetime import datetime


# ─── Room definitions (match frontend subscription keys) ──────────────────────
ROOMS = {
    "command_center":   "Police dashboard command center",
    "rescue_teams":     "Rescue team mobile apps",
    "citizens":         "Citizen app broadcast channel",
    "admin":            "Admin / supervisor channel",
}


class ConnectionManager:
    """
    Manages WebSocket connections grouped by room/channel.
    Supports:
        - Per-client connection tracking
        - Room-based broadcasting (command_center, rescue_teams, citizens)
        - Direct messaging to a specific client_id
        - Typed event broadcasting (sos_alert, heatmap_update, team_dispatch, etc.)
    """

    def __init__(self):
        # client_id → WebSocket
        self._connections: Dict[str, WebSocket] = {}
        # room_name → set of client_ids
        self._rooms: Dict[str, Set[str]] = {room: set() for room in ROOMS}

    # ── Connection lifecycle ───────────────────────────────────────────────────

    async def connect(
        self,
        websocket: WebSocket,
        client_id: str,
        rooms: Optional[List[str]] = None,
    ):
        """
        Accept a new WebSocket connection and subscribe to rooms.
        Args:
            websocket:  FastAPI WebSocket instance
            client_id:  unique client identifier (e.g. "dashboard-1", "team-T001")
            rooms:      list of room names to join (default: ["command_center"])
        """
        await websocket.accept()
        self._connections[client_id] = websocket

        join_rooms = rooms or ["command_center"]
        for room in join_rooms:
            if room in self._rooms:
                self._rooms[room].add(client_id)

        logger.info(f"WS connected: {client_id} → rooms={join_rooms} | total={len(self._connections)}")

        # Send welcome confirmation
        await self._send(client_id, {
            "event":     "connected",
            "client_id": client_id,
            "rooms":     join_rooms,
            "timestamp": _now(),
        })

    def disconnect(self, client_id: str):
        """Remove client from all rooms and connection pool."""
        self._connections.pop(client_id, None)
        for members in self._rooms.values():
            members.discard(client_id)
        logger.info(f"WS disconnected: {client_id} | remaining={len(self._connections)}")

    async def handle_message(self, client_id: str, raw: str):
        """
        Handle incoming message from a client (ping/ack/join-room).
        Frontend should send: {"action": "join_room", "room": "rescue_teams"}
        """
        try:
            msg = json.loads(raw)
            action = msg.get("action")

            if action == "ping":
                await self._send(client_id, {"event": "pong", "timestamp": _now()})

            elif action == "join_room":
                room = msg.get("room")
                if room in self._rooms:
                    self._rooms[room].add(client_id)
                    await self._send(client_id, {"event": "joined_room", "room": room})

            elif action == "leave_room":
                room = msg.get("room")
                if room in self._rooms:
                    self._rooms[room].discard(client_id)

            elif action == "ack":
                pass  # acknowledgement, no response needed

            else:
                logger.debug(f"Unknown WS action from {client_id}: {action}")

        except json.JSONDecodeError:
            logger.warning(f"Invalid JSON from {client_id}: {raw[:100]}")

    # ── Broadcasting helpers ───────────────────────────────────────────────────

    async def broadcast_alert(self, payload: dict):
        """
        Broadcast a typed alert to ALL connected clients.
        payload should include {"event": "<type>", ...data}
        """
        payload.setdefault("timestamp", _now())
        await self._broadcast_all(payload)

    async def send_to_room(self, room: str, payload: dict):
        """
        Send payload to all clients in a specific room.
        rooms: "command_center" | "rescue_teams" | "citizens" | "admin"
        """
        payload.setdefault("timestamp", _now())
        if room not in self._rooms:
            logger.warning(f"Unknown room: {room}")
            return
        client_ids = list(self._rooms[room])
        await asyncio.gather(*[self._send(cid, payload) for cid in client_ids], return_exceptions=True)

    async def send_to_client(self, client_id: str, payload: dict):
        """Direct message to a specific client."""
        payload.setdefault("timestamp", _now())
        await self._send(client_id, payload)

    # ── Typed event emitters (called from API endpoints) ──────────────────────

    async def emit_sos_alert(self, incident: dict):
        """
        Fired when a citizen submits an SOS.
        Sent to: command_center + rescue_teams
        """
        payload = {
            "event":       "sos_alert",
            "incident_id": incident.get("incident_id"),
            "disaster_type": incident.get("disaster_type"),
            "location":    incident.get("location"),
            "priority":    incident.get("priority"),
            "message":     incident.get("message"),
            "timestamp":   _now(),
        }
        await self.send_to_room("command_center", payload)
        await self.send_to_room("rescue_teams", payload)
        logger.info(f"SOS broadcast: {incident.get('incident_id')}")

    async def emit_heatmap_update(self, heatmap_type: str, summary: dict):
        """
        Fired after heatmap regeneration (flood/landslide/accident/crowd).
        Sent to: command_center
        """
        payload = {
            "event":        "heatmap_update",
            "heatmap_type": heatmap_type,   # "flood" | "landslide" | "accident" | "crowd"
            "summary":      summary,
            "timestamp":    _now(),
        }
        await self.send_to_room("command_center", payload)

    async def emit_team_dispatched(self, assignment: dict):
        """
        Fired when a rescue team is assigned to an incident.
        Sent to: command_center + rescue_teams
        """
        payload = {
            "event":       "team_dispatched",
            "incident_id": assignment.get("incident_id"),
            "team_id":     assignment.get("team_id"),
            "team_name":   assignment.get("team_name"),
            "eta_minutes": assignment.get("eta_minutes"),
            "timestamp":   _now(),
        }
        await self.send_to_room("command_center", payload)
        await self.send_to_room("rescue_teams", payload)

    async def emit_risk_alert(self, risk_type: str, location: dict, risk_level: str, score: float):
        """
        Fired when AI predicts HIGH/CRITICAL risk in an area.
        Sent to: command_center + citizens (if critical)
        """
        payload = {
            "event":      "risk_alert",
            "risk_type":  risk_type,     # "flood" | "landslide" | "accident"
            "location":   location,
            "risk_level": risk_level,
            "risk_score": score,
            "timestamp":  _now(),
        }
        await self.send_to_room("command_center", payload)
        if risk_level == "CRITICAL":
            await self.send_to_room("citizens", payload)

    async def emit_mission_status(self, mission_id: str, status: str, team_id: str):
        """
        Update mission status (ASSIGNED → ON_WAY → ARRIVED → COMPLETED).
        Sent to: command_center + rescue_teams
        """
        payload = {
            "event":      "mission_status",
            "mission_id": mission_id,
            "status":     status,
            "team_id":    team_id,
            "timestamp":  _now(),
        }
        await self.send_to_room("command_center", payload)
        await self.send_to_room("rescue_teams", payload)

    async def emit_citizen_alert(self, message: str, area: Optional[str] = None):
        """
        Push notification to citizen app (evacuation orders, safe routes, etc.)
        Sent to: citizens
        """
        payload = {
            "event":     "citizen_alert",
            "message":   message,
            "area":      area,
            "timestamp": _now(),
        }
        await self.send_to_room("citizens", payload)

    # ── Internal ──────────────────────────────────────────────────────────────

    async def _send(self, client_id: str, payload: dict):
        ws = self._connections.get(client_id)
        if ws:
            try:
                await ws.send_text(json.dumps(payload))
            except Exception as e:
                logger.warning(f"Failed to send to {client_id}: {e}")
                self.disconnect(client_id)

    async def _broadcast_all(self, payload: dict):
        client_ids = list(self._connections.keys())
        await asyncio.gather(*[self._send(cid, payload) for cid in client_ids], return_exceptions=True)

    @property
    def connected_count(self) -> int:
        return len(self._connections)

    @property
    def room_stats(self) -> dict:
        return {room: len(members) for room, members in self._rooms.items()}


# ── Singleton (import this everywhere) ────────────────────────────────────────
ws_manager = ConnectionManager()


def _now() -> str:
    return datetime.utcnow().isoformat() + "Z"
