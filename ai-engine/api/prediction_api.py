"""
SAJAG AI - FastAPI Prediction API
All AI inference endpoints for the platform.
Mount this on port 8001 alongside the main FastAPI app.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
import numpy as np
import cv2
import io
from PIL import Image
from loguru import logger

from train_pipeline import registry
from utils.gis_utils import RiskHeatmapGenerator, SafeRouteGenerator
from utils.team_recommender import TeamRecommendationEngine, RescueTeam, ResourceOptimiser


# ─────────────────────────────────────────────────────────────────────────────
# App Setup
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="SAJAG AI – Prediction Engine",
    description="AI inference API for Nepal Police disaster response platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

heatmap_gen    = RiskHeatmapGenerator()
route_gen      = SafeRouteGenerator()
team_engine    = TeamRecommendationEngine()
resource_opt   = ResourceOptimiser()


@app.on_event("startup")
async def startup():
    logger.info("Loading AI models...")
    try:
        registry.load_all()
        logger.success(f"Models loaded: {registry.available_models}")
    except Exception as e:
        logger.error(f"Model load error: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# REQUEST / RESPONSE SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────

class FloodRiskRequest(BaseModel):
    rainfall_mm_24h:    float = Field(..., ge=0, le=600)
    rainfall_mm_72h:    float = Field(..., ge=0, le=1500)
    river_level_m:      float = Field(..., ge=0, le=20)
    river_level_change: float = Field(0.0)
    soil_moisture_pct:  float = Field(50.0, ge=0, le=100)
    slope_deg:          float = Field(10.0, ge=0, le=90)
    elevation_m:        float = Field(500.0, ge=0, le=8848)
    dist_to_river_km:   float = Field(2.0, ge=0)
    population_density: int   = Field(200, ge=0)
    drainage_capacity:  float = Field(0.5, ge=0, le=1)
    season:             int   = Field(2, ge=0, le=3)
    district_risk_index: float = Field(0.5, ge=0, le=1)
    land_use:           int   = Field(1, ge=0, le=3)


class LandslideRiskRequest(BaseModel):
    rainfall_mm_24h:     float = Field(..., ge=0)
    rainfall_mm_72h:     float = Field(..., ge=0)
    antecedent_rain_7d:  float = Field(0.0, ge=0)
    slope_deg:           float = Field(30.0, ge=0, le=90)
    aspect_deg:          float = Field(180.0, ge=0, le=360)
    elevation_m:         float = Field(1500.0, ge=0)
    soil_type:           int   = Field(1, ge=0, le=3)
    vegetation_cover_pct: float = Field(60.0, ge=0, le=100)
    road_proximity_km:   float = Field(2.0, ge=0)
    fault_proximity_km:  float = Field(10.0, ge=0)
    seismic_activity:    int   = Field(0, ge=0, le=3)
    prev_landslide_1km:  int   = Field(0, ge=0, le=1)
    district_risk_index: float = Field(0.5, ge=0, le=1)


class AccidentRiskRequest(BaseModel):
    hour_of_day:       int   = Field(..., ge=0, le=23)
    day_of_week:       int   = Field(1, ge=0, le=6)
    month:             int   = Field(6, ge=1, le=12)
    road_type:         int   = Field(0, ge=0, le=3)
    road_condition:    int   = Field(1, ge=0, le=3)
    visibility_m:      int   = Field(5000, ge=0)
    traffic_volume:    int   = Field(500, ge=0)
    speed_limit_kmh:   int   = Field(60, ge=0)
    road_width_m:      float = Field(7.0, ge=1)
    intersection_type: int   = Field(0, ge=0, le=3)
    street_lighting:   int   = Field(2, ge=0, le=3)
    weather_condition: int   = Field(0, ge=0, le=3)
    slope_pct:         float = Field(3.0, ge=0)
    prev_accidents_1km: int  = Field(0, ge=0)
    dist_to_hospital_km: float = Field(10.0, ge=0)


class PriorityRequest(BaseModel):
    disaster_type:         int   = Field(..., ge=0, le=7)
    people_count:          int   = Field(..., ge=1)
    children_count:        int   = Field(0, ge=0)
    elderly_count:         int   = Field(0, ge=0)
    injured_count:         int   = Field(0, ge=0)
    critical_count:        int   = Field(0, ge=0)
    time_elapsed_min:      float = Field(0.0, ge=0)
    weather_severity:      int   = Field(0, ge=0, le=3)
    location_accessibility: int  = Field(0, ge=0, le=3)
    flood_risk_score:      float = Field(0.0, ge=0, le=1)
    landslide_risk_score:  float = Field(0.0, ge=0, le=1)
    available_teams:       int   = Field(5, ge=0)
    nearest_team_dist_km:  float = Field(5.0, ge=0)


class CrowdAnalysisRequest(BaseModel):
    hour_of_day:       int   = Field(..., ge=0, le=23)
    day_of_week:       int   = Field(1, ge=0, le=6)
    month:             int   = Field(6, ge=1, le=12)
    event_type:        int   = Field(0, ge=0, le=4)
    venue_capacity:    int   = Field(1000, ge=1)
    estimated_crowd:   int   = Field(500, ge=0)
    area_m2:           int   = Field(2000, ge=1)
    entry_points:      int   = Field(4, ge=1)
    emergency_exits:   int   = Field(4, ge=1)
    security_personnel: int  = Field(20, ge=0)
    ambient_temp_c:    float = Field(25.0)
    occupancy_ratio:   float = Field(0.5, ge=0, le=1)
    density_per_m2:    float = Field(0.25, ge=0)


class HeatmapRequest(BaseModel):
    points: List[Dict[str, float]]    # [{lat, lon, risk_score}, ...]
    smooth: bool = True
    score_col: str = "risk_score"


class RouteRequest(BaseModel):
    origin:      List[float]           # [lat, lon]
    destination: List[float]           # [lat, lon]
    risk_points: Optional[List[Dict]]  # [{lat, lon, risk_score}, ...]
    n_routes:    int = Field(3, ge=1, le=5)


class TeamRecommendRequest(BaseModel):
    incident: Dict[str, Any]          # lat, lon, disaster_type, terrain_type...
    teams:    List[Dict[str, Any]]
    top_n:    int = Field(5, ge=1, le=20)


class BulkIncidentRequest(BaseModel):
    incidents: List[Dict[str, Any]]
    teams:     List[Dict[str, Any]]


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "models_loaded": registry.available_models,
    }


# ── Flood ─────────────────────────────────────────────────────────────────────

@app.post("/predict/flood")
async def predict_flood(req: FloodRiskRequest):
    """Predict flood risk for a given location and weather conditions."""
    if not registry.is_loaded("flood"):
        raise HTTPException(503, "Flood model not loaded")
    try:
        result = registry.get("flood").predict(req.dict())
        return {"status": "success", "prediction": result}
    except Exception as e:
        logger.error(f"Flood predict error: {e}")
        raise HTTPException(500, str(e))


# ── Landslide ─────────────────────────────────────────────────────────────────

@app.post("/predict/landslide")
async def predict_landslide(req: LandslideRiskRequest):
    """Predict landslide risk for a given terrain and rainfall conditions."""
    if not registry.is_loaded("landslide"):
        raise HTTPException(503, "Landslide model not loaded")
    try:
        result = registry.get("landslide").predict(req.dict())
        return {"status": "success", "prediction": result}
    except Exception as e:
        raise HTTPException(500, str(e))


# ── Accident ──────────────────────────────────────────────────────────────────

@app.post("/predict/accident")
async def predict_accident(req: AccidentRiskRequest):
    """Predict road accident risk for a given time/road configuration."""
    if not registry.is_loaded("accident"):
        raise HTTPException(503, "Accident model not loaded")
    try:
        result = registry.get("accident").predict(req.dict())
        return {"status": "success", "prediction": result}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/predict/accident/hotspot-grid")
async def accident_hotspot_grid(
    lat_min: float = 27.6, lat_max: float = 27.8,
    lon_min: float = 83.3, lon_max: float = 83.7,
    hour: int = 8, weather: int = 0, grid_n: int = 20,
):
    """Generate a spatial grid of accident risk scores for heatmap rendering."""
    if not registry.is_loaded("accident"):
        raise HTTPException(503, "Accident model not loaded")
    try:
        grid = registry.get("accident").generate_hotspot_grid(
            (lat_min, lat_max), (lon_min, lon_max), hour, weather, grid_n
        )
        return {"status": "success", "grid": grid, "count": len(grid)}
    except Exception as e:
        raise HTTPException(500, str(e))


# ── Priority ──────────────────────────────────────────────────────────────────

@app.post("/predict/priority")
async def predict_priority(req: PriorityRequest):
    """Score a rescue incident by priority (0-1 + class label)."""
    if not registry.is_loaded("priority"):
        # Fallback to rule-based
        from models.priority_model import RescuePriorityModel
        result = RescuePriorityModel.rule_based_score(req.dict())
        return {"status": "success", "prediction": result, "note": "rule_based_fallback"}
    try:
        result = registry.get("priority").predict(req.dict())
        return {"status": "success", "prediction": result}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/predict/priority/bulk")
async def predict_priority_bulk(incidents: List[PriorityRequest]):
    """Rank multiple incidents by priority. Returns sorted list."""
    if not registry.is_loaded("priority"):
        raise HTTPException(503, "Priority model not loaded")
    try:
        ranked = registry.get("priority").rank_incidents([i.dict() for i in incidents])
        return {"status": "success", "ranked_incidents": ranked}
    except Exception as e:
        raise HTTPException(500, str(e))


# ── Crowd ─────────────────────────────────────────────────────────────────────

@app.post("/predict/crowd")
async def predict_crowd(req: CrowdAnalysisRequest):
    """Predict crowd density level and stampede risk."""
    if not registry.is_loaded("crowd"):
        raise HTTPException(503, "Crowd model not loaded")
    try:
        result = registry.get("crowd").predict(req.dict())
        return {"status": "success", "prediction": result}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/predict/crowd/image")
async def predict_crowd_image(file: UploadFile = File(...)):
    """
    Analyze crowd density from an uploaded image using YOLOv8.
    Returns people count, density map, hotspots, and risk level.
    """
    try:
        from models.crowd_model import CrowdVisionAnalyzer
        analyzer = CrowdVisionAnalyzer()
        analyzer.load_model()

        contents = await file.read()
        nparr    = np.frombuffer(contents, np.uint8)
        image    = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(400, "Invalid image file")

        result = analyzer.analyze_image(image, return_annotated=False)
        return {"status": "success", "analysis": result}
    except Exception as e:
        logger.error(f"Crowd image predict error: {e}")
        raise HTTPException(500, str(e))


# ── Heatmap ───────────────────────────────────────────────────────────────────

@app.post("/heatmap/generate")
async def generate_heatmap(req: HeatmapRequest):
    """
    Convert a list of {lat, lon, risk_score} points into
    a Leaflet-ready heatmap payload + GeoJSON.
    """
    try:
        import pandas as pd
        df = pd.DataFrame(req.points)
        if "latitude" not in df.columns:
            df = df.rename(columns={"lat": "latitude", "lon": "longitude"})
        result = heatmap_gen.generate(df, score_col=req.score_col, smooth=req.smooth)
        return {"status": "success", "heatmap": result}
    except Exception as e:
        raise HTTPException(500, str(e))


# ── Safe Routes ───────────────────────────────────────────────────────────────

@app.post("/routes/safe")
async def get_safe_routes(req: RouteRequest):
    """
    Generate safe evacuation routes avoiding high-risk zones.
    Returns up to 3 route options sorted by safety.
    """
    try:
        if req.risk_points:
            route_gen.load_risk_grid(req.risk_points)

        origin      = tuple(req.origin)
        destination = tuple(req.destination)
        routes      = route_gen.suggest_routes(origin, destination, req.n_routes)

        return {
            "status": "success",
            "routes": [
                {
                    "rank":           i + 1,
                    "waypoints":      r.waypoints,
                    "distance_km":    r.total_distance_km,
                    "max_risk":       r.max_risk_score,
                    "avg_risk":       r.avg_risk_score,
                    "risk_level":     r.risk_level,
                    "warnings":       r.warnings,
                }
                for i, r in enumerate(routes)
            ],
        }
    except Exception as e:
        raise HTTPException(500, str(e))


# ── Team Recommendation ───────────────────────────────────────────────────────

@app.post("/dispatch/recommend")
async def recommend_teams(req: TeamRecommendRequest):
    """
    AI-powered rescue team recommendation for a specific incident.
    Returns ranked list of best-matching teams.
    """
    try:
        teams = [RescueTeam(**t) for t in req.teams]
        recs  = team_engine.recommend(req.incident, teams, top_n=req.top_n)
        return {
            "status": "success",
            "recommendations": [
                {
                    "rank":          r.rank,
                    "team_id":       r.team.team_id,
                    "team_name":     r.team.name,
                    "score":         r.score,
                    "distance_km":   r.distance_km,
                    "eta_minutes":   r.eta_minutes,
                    "breakdown":     r.suitability_breakdown,
                    "notes":         r.notes,
                }
                for r in recs
            ],
        }
    except Exception as e:
        logger.error(f"Recommend error: {e}")
        raise HTTPException(500, str(e))


@app.post("/dispatch/optimise")
async def optimise_resources(req: BulkIncidentRequest):
    """
    Optimally assign available teams across multiple incidents.
    Uses greedy priority-first assignment.
    """
    try:
        teams  = [RescueTeam(**t) for t in req.teams]
        result = resource_opt.optimise(req.incidents, teams)
        return {"status": "success", "assignment_plan": result}
    except Exception as e:
        raise HTTPException(500, str(e))


# ─────────────────────────────────────────────────────────────────────────────
# COMBINED INCIDENT ANALYSIS  (one-call full AI pipeline)
# ─────────────────────────────────────────────────────────────────────────────

class IncidentAnalysisRequest(BaseModel):
    incident_id:      str
    disaster_type:    str
    lat:              float
    lon:              float
    people_count:     int   = 1
    critical_count:   int   = 0
    time_elapsed_min: float = 0.0
    rainfall_mm_24h:  float = 0.0
    river_level_m:    float = 2.0
    slope_deg:        float = 15.0
    elevation_m:      float = 500.0
    season:           int   = 2
    hour_of_day:      int   = 12
    weather_severity: int   = 0
    available_teams:  int   = 5


@app.post("/incident/analyse")
async def analyse_incident(req: IncidentAnalysisRequest):
    """
    Full AI pipeline for an incident.
    Returns: priority score, flood risk, landslide risk, recommended actions.
    """
    response: Dict[str, Any] = {
        "incident_id": req.incident_id,
        "disaster_type": req.disaster_type,
        "location": {"lat": req.lat, "lon": req.lon},
    }

    # Disaster type → int mapping
    dis_map = {"flood": 0, "landslide": 1, "earthquake": 2,
               "fire": 3, "accident": 4, "crowd_incident": 5,
               "missing_person": 6, "infrastructure": 7}
    dis_int = dis_map.get(req.disaster_type.lower(), 4)

    # Flood risk
    if registry.is_loaded("flood"):
        flood_feats = {
            "rainfall_mm_24h": req.rainfall_mm_24h,
            "rainfall_mm_72h": req.rainfall_mm_24h * 2.5,
            "river_level_m": req.river_level_m,
            "river_level_change": 0.5,
            "soil_moisture_pct": 60.0,
            "slope_deg": req.slope_deg,
            "elevation_m": req.elevation_m,
            "dist_to_river_km": 1.5,
            "population_density": 200,
            "drainage_capacity": 0.4,
            "season": req.season,
            "district_risk_index": 0.6,
            "land_use": 2,
        }
        response["flood_risk"] = registry.get("flood").predict(flood_feats)

    # Landslide risk
    if registry.is_loaded("landslide"):
        slide_feats = {
            "rainfall_mm_24h": req.rainfall_mm_24h,
            "rainfall_mm_72h": req.rainfall_mm_24h * 2.5,
            "antecedent_rain_7d": req.rainfall_mm_24h * 4,
            "slope_deg": req.slope_deg,
            "aspect_deg": 180.0,
            "elevation_m": req.elevation_m,
            "soil_type": 1,
            "vegetation_cover_pct": 50.0,
            "road_proximity_km": 1.0,
            "fault_proximity_km": 8.0,
            "seismic_activity": 0,
            "prev_landslide_1km": 0,
            "district_risk_index": 0.6,
        }
        response["landslide_risk"] = registry.get("landslide").predict(slide_feats)

    # Priority
    prio_feats = {
        "disaster_type": dis_int,
        "people_count": req.people_count,
        "children_count": max(0, int(req.people_count * 0.15)),
        "elderly_count": max(0, int(req.people_count * 0.10)),
        "injured_count": max(0, int(req.people_count * 0.30)),
        "critical_count": req.critical_count,
        "time_elapsed_min": req.time_elapsed_min,
        "weather_severity": req.weather_severity,
        "location_accessibility": 1,
        "flood_risk_score": response.get("flood_risk", {}).get("risk_score", 0.3),
        "landslide_risk_score": response.get("landslide_risk", {}).get("risk_score", 0.2),
        "available_teams": req.available_teams,
        "nearest_team_dist_km": 5.0,
    }

    if registry.is_loaded("priority"):
        response["priority"] = registry.get("priority").predict(prio_feats)
    else:
        from models.priority_model import RescuePriorityModel
        response["priority"] = RescuePriorityModel.rule_based_score(prio_feats)

    return {"status": "success", "analysis": response}


if __name__ == "__main__":
    import uvicorn
    from config import API_HOST, API_PORT, API_WORKERS
    uvicorn.run("api.prediction_api:app", host=API_HOST, port=API_PORT,
                workers=API_WORKERS, reload=False)
