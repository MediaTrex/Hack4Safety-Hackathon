"""
SAJAG AI - Unified Response Schemas
Single source of truth for all API request/response models.

Import in FastAPI app:
    from schemas import (
        SOSReportRequest, SOSReportResponse,
        FloodRiskResponse, PriorityResponse,
        TeamDispatchResponse, HeatmapResponse,
        WSEvent, ...
    )

These match exactly what the React dashboard and React Native app expect.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class DisasterType(str, Enum):
    flood          = "flood"
    landslide      = "landslide"
    earthquake     = "earthquake"
    fire           = "fire"
    accident       = "accident"
    crowd_incident = "crowd_incident"
    missing_person = "missing_person"
    infrastructure = "infrastructure"
    other          = "other"

class RiskLevel(str, Enum):
    LOW      = "LOW"
    MEDIUM   = "MEDIUM"
    HIGH     = "HIGH"
    CRITICAL = "CRITICAL"

class MissionStatus(str, Enum):
    ASSIGNED   = "ASSIGNED"
    ON_WAY     = "ON_WAY"
    ARRIVED    = "ARRIVED"
    COMPLETED  = "COMPLETED"
    CANCELLED  = "CANCELLED"

class TeamStatus(str, Enum):
    AVAILABLE  = "AVAILABLE"
    BUSY       = "BUSY"
    RETURNING  = "RETURNING"
    OFF_DUTY   = "OFF_DUTY"

class PriorityLabel(str, Enum):
    LOW      = "LOW"
    MEDIUM   = "MEDIUM"
    HIGH     = "HIGH"
    CRITICAL = "CRITICAL"

class DensityLabel(str, Enum):
    NORMAL      = "NORMAL"
    DENSE       = "DENSE"
    OVERCROWDED = "OVERCROWDED"
    CRITICAL    = "CRITICAL"


# ─── Shared sub-models ────────────────────────────────────────────────────────

class LocationPoint(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)

class BoundingBox(BaseModel):
    lat_min: float
    lat_max: float
    lon_min: float
    lon_max: float


# ─── Citizen SOS ──────────────────────────────────────────────────────────────

class SOSReportRequest(BaseModel):
    """Sent by the React Native citizen app when SOS is triggered."""
    disaster_type:  DisasterType
    lat:            float = Field(..., ge=26.0, le=31.0, description="Nepal latitude range")
    lon:            float = Field(..., ge=80.0, le=89.0, description="Nepal longitude range")
    message:        Optional[str] = Field(None, max_length=500)
    people_count:   int  = Field(1, ge=1)
    photo_urls:     Optional[List[str]] = []
    voice_url:      Optional[str] = None
    user_id:        Optional[str] = None

class SOSReportResponse(BaseModel):
    """Returned to citizen app after SOS submission."""
    status:          Literal["success", "error"]
    incident_id:     str
    message:         str
    priority_label:  PriorityLabel
    priority_score:  float
    nearest_team:    Optional[str] = None
    eta_minutes:     Optional[float] = None
    timestamp:       str


# ─── AI Prediction responses ──────────────────────────────────────────────────

class RiskPredictionResponse(BaseModel):
    """Standard response for flood / landslide / accident predictions."""
    status:              Literal["success", "error"]
    risk_score:          float = Field(..., ge=0, le=1)
    risk_level:          RiskLevel
    confidence:          Optional[float] = None
    contributing_factors: Optional[List[str]] = []
    # model-specific sub-scores
    rf_score:            Optional[float] = None
    xgb_score:           Optional[float] = None

class FloodRiskResponse(RiskPredictionResponse):
    pass

class LandslideRiskResponse(RiskPredictionResponse):
    pass

class AccidentRiskResponse(BaseModel):
    status:          Literal["success", "error"]
    risk_score:      float
    risk_level:      RiskLevel
    rf_score:        float
    xgb_score:       float
    patrol_priority: str   # IMMEDIATE | WITHIN_1HR | WITHIN_6HR | ROUTINE


# ─── Priority scoring ─────────────────────────────────────────────────────────

class ClassProbabilities(BaseModel):
    LOW:      float
    MEDIUM:   float
    HIGH:     float
    CRITICAL: float

class PriorityResponse(BaseModel):
    status:               Literal["success", "error"]
    priority_score:       float = Field(..., ge=0, le=1)
    priority_class:       int   = Field(..., ge=0, le=3)
    priority_label:       PriorityLabel
    class_proba:          ClassProbabilities
    recommended_action:   str
    deployment_urgency:   str   # IMMEDIATE | WITHIN_15_MIN | WITHIN_1_HOUR | WITHIN_4_HOURS


# ─── Crowd analysis ───────────────────────────────────────────────────────────

class CrowdPredictionResponse(BaseModel):
    """
    Returned by POST /predict/crowd
    NOTE: crowd_model.py predict() must return these exact keys.
    """
    status:                Literal["success", "error"]
    density_level:         int            # 0-3
    density_label:         DensityLabel
    stampede_risk:         float          # 0-1
    stampede_risk_level:   RiskLevel
    class_probabilities:   Dict[str, float]  # {"NORMAL": 0.1, "DENSE": ...}
    recommended_action:    str
    alerts:                List[str]

class CrowdImageAnalysisResponse(BaseModel):
    """Returned by POST /predict/crowd/image (YOLOv8)"""
    status:              Literal["success", "error"]
    people_count:        int
    overall_density:     float
    risk_level:          RiskLevel
    stampede_risk_score: float
    hotspots:            List[Dict[str, Any]]
    frame_size:          Dict[str, int]
    density_grid:        List[List[int]]
    annotated_image:     Optional[str] = None   # base64 JPEG


# ─── Heatmap ──────────────────────────────────────────────────────────────────

class HeatmapSummary(BaseModel):
    total_points: int
    critical:     int
    high:         int
    medium:       int
    low:          int
    avg_risk:     float
    max_risk:     float

class HeatmapResponse(BaseModel):
    status:         Literal["success", "error"]
    heatmap_points: List[List[float]]  # [[lat, lon, weight], ...]
    geojson:        Dict[str, Any]     # GeoJSON FeatureCollection
    summary:        HeatmapSummary


# ─── Safe routes ──────────────────────────────────────────────────────────────

class RouteWaypoint(BaseModel):
    lat: float
    lon: float

class SafeRouteItem(BaseModel):
    rank:         int
    waypoints:    List[RouteWaypoint]
    distance_km:  float
    max_risk:     float
    avg_risk:     float
    risk_level:   RiskLevel
    warnings:     List[str]

class SafeRoutesResponse(BaseModel):
    status: Literal["success", "error"]
    routes: List[SafeRouteItem]


# ─── Team dispatch ────────────────────────────────────────────────────────────

class TeamRecommendationItem(BaseModel):
    rank:        int
    team_id:     str
    team_name:   str
    score:       float
    distance_km: float
    eta_minutes: float
    breakdown:   Dict[str, float]   # proximity, specialization, capability, availability
    notes:       List[str]

class TeamRecommendResponse(BaseModel):
    status:          Literal["success", "error"]
    recommendations: List[TeamRecommendationItem]

class ResourceOptimisationResponse(BaseModel):
    status:           Literal["success", "error"]
    assignment_plan:  Dict[str, Any]
    # assignment_plan contains: assignments{}, unassigned_count, unassigned[], utilisation


# ─── Full incident analysis ───────────────────────────────────────────────────

class IncidentAnalysisResponse(BaseModel):
    status:         Literal["success", "error"]
    analysis:       Dict[str, Any]
    # analysis contains: incident_id, disaster_type, location,
    #                    flood_risk{}, landslide_risk{}, priority{}


# ─── Accident hotspot grid ────────────────────────────────────────────────────

class HotspotGridPoint(BaseModel):
    lat:        float
    lon:        float
    risk_score: float
    risk_level: RiskLevel

class AccidentHotspotGridResponse(BaseModel):
    status: Literal["success", "error"]
    grid:   List[HotspotGridPoint]
    count:  int


# ─── WebSocket event payloads (what frontend receives) ────────────────────────

class WSEventType(str, Enum):
    connected       = "connected"
    sos_alert       = "sos_alert"
    heatmap_update  = "heatmap_update"
    team_dispatched = "team_dispatched"
    risk_alert      = "risk_alert"
    mission_status  = "mission_status"
    citizen_alert   = "citizen_alert"
    pong            = "pong"

class WSBaseEvent(BaseModel):
    event:     WSEventType
    timestamp: str

class WSSOSAlert(WSBaseEvent):
    event:        Literal[WSEventType.sos_alert]
    incident_id:  str
    disaster_type: DisasterType
    location:     LocationPoint
    priority:     PriorityLabel
    message:      Optional[str]

class WSHeatmapUpdate(WSBaseEvent):
    event:        Literal[WSEventType.heatmap_update]
    heatmap_type: str       # "flood" | "landslide" | "accident" | "crowd"
    summary:      HeatmapSummary

class WSTeamDispatched(WSBaseEvent):
    event:       Literal[WSEventType.team_dispatched]
    incident_id: str
    team_id:     str
    team_name:   str
    eta_minutes: float

class WSRiskAlert(WSBaseEvent):
    event:      Literal[WSEventType.risk_alert]
    risk_type:  str
    location:   LocationPoint
    risk_level: RiskLevel
    risk_score: float

class WSMissionStatus(WSBaseEvent):
    event:      Literal[WSEventType.mission_status]
    mission_id: str
    status:     MissionStatus
    team_id:    str

class WSCitizenAlert(WSBaseEvent):
    event:   Literal[WSEventType.citizen_alert]
    message: str
    area:    Optional[str]


# ─── Generic API wrapper ──────────────────────────────────────────────────────

class APIResponse(BaseModel):
    """Generic wrapper - use typed responses above where possible."""
    status:  Literal["success", "error"]
    data:    Optional[Any] = None
    message: Optional[str] = None
    error:   Optional[str] = None
