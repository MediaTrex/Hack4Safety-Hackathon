"""
Notification service for real-time updates on SOS assignments and status changes.
Manages WebSocket connections per rescue team and broadcasts notifications.
"""
from typing import Dict, Set
from fastapi import WebSocket
import json
from datetime import datetime, timezone


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class NotificationManager:
    """Manages WebSocket connections and broadcasts for real-time notifications."""
    
    def __init__(self):
        # Map of rescue_team_id -> set of WebSocket connections
        self.team_connections: Dict[str, Set[WebSocket]] = {}
        # Map of rescue_team_id -> list of pending notifications (if offline)
        self.pending_notifications: Dict[str, list] = {}
    
    async def connect(self, team_id: str, websocket: WebSocket):
        """Register a rescue team's WebSocket connection."""
        await websocket.accept()
        if team_id not in self.team_connections:
            self.team_connections[team_id] = set()
        self.team_connections[team_id].add(websocket)
        
        # Send any pending notifications
        if team_id in self.pending_notifications:
            for notification in self.pending_notifications[team_id]:
                try:
                    await websocket.send_json(notification)
                except Exception:
                    pass
            self.pending_notifications[team_id] = []
    
    def disconnect(self, team_id: str, websocket: WebSocket):
        """Unregister a WebSocket connection."""
        if team_id in self.team_connections:
            self.team_connections[team_id].discard(websocket)
            if not self.team_connections[team_id]:
                del self.team_connections[team_id]
    
    async def notify_assignment(
        self,
        team_id: str,
        operation_id: str,
        sos_id: str,
        sos_location: dict,
        address: str,
        emergency_type: str,
        priority: str,
        mobile_no: str,
        additional_details: str = "",
    ):
        """Notify a rescue team about a new SOS assignment."""
        notification = {
            "type": "sos_assignment",
            "timestamp": _utcnow().isoformat(),
            "operation_id": operation_id,
            "sos_id": sos_id,
            "sos_location": sos_location,
            "address": address,
            "emergency_type": emergency_type,
            "priority": priority,
            "victim_mobile": mobile_no,
            "additional_details": additional_details,
            "action_required": "accept_or_reject",  # Team must respond
        }
        
        await self._send_notification(team_id, notification)
    
    async def notify_status_update(
        self,
        team_id: str,
        operation_id: str,
        old_status: str,
        new_status: str,
        timestamp: str = None,
    ):
        """Notify about operation status changes."""
        notification = {
            "type": "status_update",
            "timestamp": timestamp or _utcnow().isoformat(),
            "operation_id": operation_id,
            "old_status": old_status,
            "new_status": new_status,
        }
        
        await self._send_notification(team_id, notification)
    
    async def notify_operation_completed(
        self,
        team_id: str,
        operation_id: str,
        sos_id: str,
    ):
        """Notify that an operation has been completed."""
        notification = {
            "type": "operation_completed",
            "timestamp": _utcnow().isoformat(),
            "operation_id": operation_id,
            "sos_id": sos_id,
        }
        
        await self._send_notification(team_id, notification)
    
    async def notify_emergency_alert(
        self,
        team_ids: list,
        alert_type: str,
        message: str,
        location: dict = None,
    ):
        """Send emergency alert to multiple teams."""
        notification = {
            "type": "emergency_alert",
            "timestamp": _utcnow().isoformat(),
            "alert_type": alert_type,
            "message": message,
            "location": location,
        }
        
        for team_id in team_ids:
            await self._send_notification(team_id, notification)
    
    async def broadcast_message(self, notification: dict):
        """Broadcast a generic notification to all connected teams and citizens."""
        # Broadcast to team connections
        for team_id, connections in list(self.team_connections.items()):
            dead_connections = []
            for ws in connections:
                try:
                    await ws.send_json(notification)
                except Exception:
                    dead_connections.append(ws)
            for ws in dead_connections:
                self.disconnect(team_id, ws)
        # Broadcast to citizens via citizen_manager
        from app.services.citizen_manager import citizen_manager
        await citizen_manager.broadcast_message(notification)

        """Broadcast a generic notification to all connected teams and citizens."""
        # Iterate over all connections across all team IDs
        for team_id, connections in list(self.team_connections.items()):
            dead_connections = []
            for ws in connections:
                try:
                    await ws.send_json(notification)
                except Exception:
                    dead_connections.append(ws)
            # Clean up dead connections
            for ws in dead_connections:
                self.disconnect(team_id, ws)
    
    async def broadcast_to_admin(self, notification: dict):
        """
        Broadcast notification to all admin dashboard connections.
        This requires a separate admin connection manager.
        """
        # This will be handled by a separate admin WebSocket router
        pass


# Global notification manager instance
notification_manager = NotificationManager()
