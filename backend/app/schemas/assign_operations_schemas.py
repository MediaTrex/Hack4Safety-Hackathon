from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field



class GeoJSONPoint(BaseModel):
    type: Literal["Point"] = "Point"
    # GeoJSON standard: [longitude, latitude]
    coordinates: List[float] = Field(..., min_items=2, max_items=2)


class AssignOperationsRequest(BaseModel):
    teamId: str = Field(..., min_length=1, description="rescue_team user _id as string")
    operationId: str = Field(..., min_length=1)
    rescue_team_location: GeoJSONPoint


class AssignedOperationItem(BaseModel):
    id: str = Field(..., alias="_id", description="SOS _id")
    status: Literal[
        "assigned",
        "pending",
        "completed",
    ]

    class Config:
        populate_by_name = True


class AssignOperationsDoc(BaseModel):
    id: str = Field(..., alias="_id")
    teamId: str
    operationId: str

    class Config:
        populate_by_name = True


