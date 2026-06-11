from typing import Any, List, Literal, Optional

from pydantic import BaseModel, Field


class GeoJSONPoint(BaseModel):
    type: Literal["Point"] = "Point"
    # GeoJSON standard: [longitude, latitude]
    coordinates: List[float] = Field(..., min_items=2, max_items=2)


class SOSCreateRequest(BaseModel):
    location: GeoJSONPoint
    address: str = Field(..., min_lenght=1, max_length=120)
    emergency_type: str = Field(..., min_length=1, max_length=120)
    mobile_no: str = Field(..., min_length=6, max_length=30)
    additional_details: Optional[str] = Field(None, max_length=2000)


# Overall operation state
OperationStatus = Literal[
    "not_assign",
    "assigned",
    "completed",
]

# Workflow/progress state
TaskStatus = Literal[
    "not_assign",
    "accepted",
    "assigned",
    "on_the_way",
    "reached",
    "rescue_started",
    "victim_safe",
    "returning",
    "completed",
]


class OperationUpdateTaskStatusRequest(BaseModel):
    taskStatus: TaskStatus


class ReportCreateRequest(BaseModel):
    incident_type: str = Field(..., min_length=1, max_length=120)

    description: str = Field(..., min_length=1, max_length=4000)

    # From APK: base64-encoded blobs (as strings)
    media: List[str] = Field(
        ...,
        min_length=1,
        description="List of base64 blobs (photos/videos)",
    )

    # Optional base64-encoded voice blobs
    voice_messages: Optional[List[str]] = None

    mobile_no: str = Field(..., min_length=6, max_length=30)  # keep original mobile number
    citizen_id: str = Field(..., description="Reference to citizen document ID")


class OperationReadResponse(BaseModel):
    id: str = Field(..., alias="_id")
    
    operation_id: str

    sos_id: str
    assignId: Optional[str]

    sos_location: Any
    rescue_team_location: Optional[Any]

    # Overall state
    status: OperationStatus

    # Progress state
    taskStatus: TaskStatus


class OperationCreateInternal(BaseModel):
    operation_id: str
     
    sos_id: str
    assignId: Optional[str] = None

    sos_location: Any
    rescue_team_location: Optional[Any] = None

    # Overall state
    status: OperationStatus = "not_assign"

    # Progress state
    taskStatus: TaskStatus = "not_assign"