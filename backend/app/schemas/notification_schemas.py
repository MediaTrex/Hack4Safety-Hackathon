from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class RegisterTokenRequest(BaseModel):
    user_id: str = Field(..., description="User ID associated with the token")
    expo_push_token: str = Field(..., description="Expo push token, e.g., ExponentPushToken[xxxx]")
    platform: str = Field(..., description="Device platform: 'ios' or 'android'")

class UnregisterTokenRequest(BaseModel):
    expo_push_token: str = Field(..., description="Expo push token to remove")
    user_id: str = Field(..., description="User ID associated with the token")

class AdminBroadcastRequest(BaseModel):
    title: str = Field(..., description="Notification title")
    body: str = Field(..., description="Notification body/message")
    data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Optional payload data for the client")

class SendToUserRequest(BaseModel):
    title: str = Field(..., description="Notification title")
    body: str = Field(..., description="Notification body/message")
    data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Optional payload data for the client")
