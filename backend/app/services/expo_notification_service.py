import os
import json
from typing import List, Dict, Any
import logging
import httpx
from datetime import datetime
from bson import ObjectId

from app.config.database import get_collection
from app.config.settings import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

# Expo endpoint (can be overridden via env var)
EXPO_PUSH_URL = os.getenv("EXPO_PUSH_URL", "https://exp.host/--/api/v2/push/send")
# Batch size as per Expo docs (max 100)
BATCH_SIZE = int(os.getenv("EXPO_BATCH_SIZE", "100"))

class ExpoNotificationService:
    """Handles registration of Expo push tokens and sending push notifications.

    All operations are async and use the shared MongoDB collection ``expo_push_tokens``.
    """

    def __init__(self):
        # Lazy collection reference – resolved per call to avoid circular imports.
        self.collection_name = "expo_push_tokens"

    async def _collection(self):
        return await get_collection(self.collection_name)

    async def register_token(self, user_id: str, expo_push_token: str, platform: str) -> dict:
        """Create or update a push token document.

        *Ensures a user can have multiple devices* – a unique compound index on
        ``(user_id, expo_push_token)`` prevents duplicate entries.
        """
        col = await self._collection()
        now = datetime.utcnow()
        result = await col.update_one(
            {"user_id": user_id, "expo_push_token": expo_push_token},
            {"$set": {"platform": platform, "updated_at": now}, "$setOnInsert": {"created_at": now}},
            upsert=True,
        )
        logger.info("Registered Expo token for user %s (upserted=%s)", user_id, result.upserted_id)
        return {"matched_count": result.matched_count, "upserted_id": str(result.upserted_id)}

    async def unregister_token(self, user_id: str, expo_push_token: str) -> dict:
        """Remove a token for a user. Returns count of deleted documents."""
        col = await self._collection()
        result = await col.delete_many({"user_id": user_id, "expo_push_token": expo_push_token})
        logger.info("Unregistered Expo token for user %s (deleted=%s)", user_id, result.deleted_count)
        return {"deleted_count": result.deleted_count}

    async def _fetch_tokens_for_user(self, user_id: str) -> List[Dict[str, Any]]:
        col = await self._collection()
        # Try to match both string and ObjectId forms of the ID
        try:
            obj_id = ObjectId(user_id)
        except Exception:
            obj_id = None
        query = {"$or": [{"user_id": user_id}]}
        if obj_id:
            query["$or"].append({"user_id": obj_id})
        return await col.find(query).to_list(length=None)

    async def _fetch_all_tokens(self) -> List[Dict[str, Any]]:
        col = await self._collection()
        cursor = col.find({})
        return await cursor.to_list(length=None)

    async def _send_batch(self, messages: List[Dict[str, Any]]) -> List[dict]:
        async with httpx.AsyncClient() as client:
            response = await client.post(EXPO_PUSH_URL, json=messages, timeout=10)
            response.raise_for_status()
            return response.json().get("data", [])

    async def _prepare_message(self, token: str, title: str, body: str, data: Dict[str, Any] | None) -> Dict[str, Any]:
        msg: Dict[str, Any] = {
            "to": token,
            "title": title,
            "body": body,
            "sound": "default",
        }
        if data:
            msg["data"] = data
        return msg

    async def send_push_to_user(self, user_id: str, title: str, body: str, data: Dict[str, Any] | None = None) -> List[dict]:
        # Fetch tokens for the given user/citizen ID
        tokens = await self._fetch_tokens_for_user(user_id)
        if not tokens:
            logger.warning("No Expo tokens found for user %s", user_id)
            return []
        msgs = [await self._prepare_message(t["expo_push_token"], title, body, data) for t in tokens]
        results = []
        for i in range(0, len(msgs), BATCH_SIZE):
            batch = msgs[i : i + BATCH_SIZE]
            results.extend(await self._send_batch(batch))
        return results

    async def send_push_to_users(self, user_ids: List[str], title: str, body: str, data: Dict[str, Any] | None = None) -> List[dict]:
        col = await self._collection()
        cursor = col.find({"user_id": {"$in": user_ids}})
        docs = await cursor.to_list(length=None)
        msgs = [await self._prepare_message(d["expo_push_token"], title, body, data) for d in docs]
        results = []
        for i in range(0, len(msgs), BATCH_SIZE):
            batch = msgs[i : i + BATCH_SIZE]
            results.extend(await self._send_batch(batch))
        return results

    async def broadcast_notification(self, title: str, body: str, data: Dict[str, Any] | None = None) -> List[dict]:
        col = await self._collection()
        cursor = col.find({})
        docs = await cursor.to_list(length=None)
        msgs = [await self._prepare_message(d["expo_push_token"], title, body, data) for d in docs]
        results = []
        for i in range(0, len(msgs), BATCH_SIZE):
            batch = msgs[i : i + BATCH_SIZE]
            results.extend(await self._send_batch(batch))
        return results

    async def cleanup_invalid_tokens(self, receipt_results: List[dict]):
        """Remove tokens that Expo reports as DeviceNotRegistered.

        The Expo response includes a ``status`` field; if it is ``error`` and the
        ``message`` contains ``DeviceNotRegistered`` we delete that token.
        """
        col = await self._collection()
        for receipt in receipt_results:
            if receipt.get("status") == "error" and "DeviceNotRegistered" in receipt.get("message", ""):
                token = receipt.get("details", {}).get("expoPushToken")
                if token:
                    result = await col.delete_many({"expo_push_token": token})
                    logger.info("Cleaned up invalid Expo token %s (deleted=%s)", token, result.deleted_count)

# Global singleton used by routes and other services
expo_notification_service = ExpoNotificationService()
