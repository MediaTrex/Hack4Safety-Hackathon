from typing import Dict, Set
from fastapi import WebSocket

class CitizenManager:
    """Manages WebSocket connections for citizen (mobile app) users."""

    def __init__(self):
        self.connections: Dict[str, Set[WebSocket]] = {}
        self.pending_notifications: Dict[str, list] = {}

    async def connect(self, citizen_id: str, websocket: WebSocket):
        await websocket.accept()
        if citizen_id not in self.connections:
            self.connections[citizen_id] = set()
        self.connections[citizen_id].add(websocket)
        # Send any pending notifications
        if citizen_id in self.pending_notifications:
            for notification in self.pending_notifications[citizen_id]:
                try:
                    await websocket.send_json(notification)
                except Exception:
                    pass
            self.pending_notifications[citizen_id] = []

    def disconnect(self, citizen_id: str, websocket: WebSocket):
        if citizen_id in self.connections:
            self.connections[citizen_id].discard(websocket)
            if not self.connections[citizen_id]:
                del self.connections[citizen_id]

    async def broadcast_message(self, notification: dict):
        """Broadcast a generic notification to all connected citizens."""
        for citizen_id, conns in list(self.connections.items()):
            dead = []
            for ws in conns:
                try:
                    await ws.send_json(notification)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.disconnect(citizen_id, ws)

# Global instance
citizen_manager = CitizenManager()
