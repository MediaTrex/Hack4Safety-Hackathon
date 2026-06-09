"""
SAJAG AI - Weather-Disaster Forecasting Module
Combines weather forecast data with risk models to generate
24/48/72-hour disaster probability forecasts for Nepal districts.
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from loguru import logger


# ─────────────────────────────────────────────────────────────────────────────
# DATA CLASSES
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class WeatherForecast:
    """Hourly weather forecast for a location."""
    timestamp:         datetime
    lat:               float
    lon:               float
    district:          str
    temp_c:            float
    rainfall_mm_1h:    float
    rainfall_acc_24h:  float
    rainfall_acc_72h:  float
    wind_speed_kmh:    float
    humidity_pct:      float
    pressure_hpa:      float
    visibility_km:     float
    condition:         str     # CLEAR / RAIN / HEAVY_RAIN / FOG / STORM / SNOW


@dataclass
class DisasterAlert:
    """Forecast disaster alert for a district."""
    district:          str
    lat:               float
    lon:               float
    disaster_type:     str
    probability:       float
    risk_level:        str
    forecast_horizon:  str     # "6H" / "24H" / "48H" / "72H"
    valid_from:        datetime
    valid_until:       datetime
    triggers:          List[str] = field(default_factory=list)
    recommended_actions: List[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        d = asdict(self)
        d["valid_from"]  = self.valid_from.isoformat()
        d["valid_until"] = self.valid_until.isoformat()
        return d


# ─────────────────────────────────────────────────────────────────────────────
# NEPAL DISTRICT METADATA
# ─────────────────────────────────────────────────────────────────────────────

NEPAL_DISTRICTS = {
    "Rupandehi":     {"lat": 27.55, "lon": 83.45, "flood_base": 0.70, "slide_base": 0.25},
    "Chitwan":       {"lat": 27.53, "lon": 84.35, "flood_base": 0.65, "slide_base": 0.20},
    "Kaski":         {"lat": 28.21, "lon": 83.98, "flood_base": 0.50, "slide_base": 0.75},
    "Sindhupalchok": {"lat": 27.93, "lon": 85.69, "flood_base": 0.60, "slide_base": 0.85},
    "Palpa":         {"lat": 27.87, "lon": 83.55, "flood_base": 0.60, "slide_base": 0.65},
    "Dhading":       {"lat": 27.87, "lon": 84.87, "flood_base": 0.55, "slide_base": 0.70},
    "Nuwakot":       {"lat": 28.07, "lon": 85.17, "flood_base": 0.55, "slide_base": 0.72},
    "Rasuwa":        {"lat": 28.55, "lon": 85.37, "flood_base": 0.40, "slide_base": 0.80},
    "Makwanpur":     {"lat": 27.43, "lon": 85.00, "flood_base": 0.60, "slide_base": 0.68},
    "Myagdi":        {"lat": 28.48, "lon": 83.57, "flood_base": 0.45, "slide_base": 0.82},
    "Kathmandu":     {"lat": 27.71, "lon": 85.32, "flood_base": 0.35, "slide_base": 0.30},
    "Nawalparasi":   {"lat": 27.57, "lon": 83.92, "flood_base": 0.68, "slide_base": 0.40},
    "Taplejung":     {"lat": 27.36, "lon": 87.67, "flood_base": 0.55, "slide_base": 0.78},
    "Solukhumbu":    {"lat": 27.79, "lon": 86.66, "flood_base": 0.42, "slide_base": 0.75},
    "Dolakha":       {"lat": 27.63, "lon": 86.10, "flood_base": 0.50, "slide_base": 0.73},
}

# Rainfall thresholds (mm) for alert triggers
FLOOD_THRESHOLDS   = {"WATCH": 50,  "WARNING": 100, "EMERGENCY": 200}
LANDSLIDE_THRESHOLDS = {"WATCH": 40, "WARNING": 80, "EMERGENCY": 150}


# ─────────────────────────────────────────────────────────────────────────────
# FORECASTING ENGINE
# ─────────────────────────────────────────────────────────────────────────────

class DisasterForecastEngine:
    """
    Combines weather forecasts with ML risk models to produce
    district-level disaster probability forecasts.
    """

    def __init__(
        self,
        flood_model=None,
        landslide_model=None,
    ):
        self.flood_model     = flood_model
        self.landslide_model = landslide_model

    # ── Main Forecast Method ──────────────────────────────────────────────────

    def forecast_district(
        self,
        district: str,
        weather_forecasts: List[WeatherForecast],
        horizon_hours: int = 72,
    ) -> List[DisasterAlert]:
        """
        Generate disaster alerts for a district given weather forecasts.
        Returns list of DisasterAlert (sorted by probability descending).
        """
        if district not in NEPAL_DISTRICTS:
            logger.warning(f"Unknown district: {district}")
            return []

        meta   = NEPAL_DISTRICTS[district]
        alerts = []
        now    = datetime.now()

        for horizon_label, hours in [("6H", 6), ("24H", 24), ("48H", 48), ("72H", 72)]:
            if hours > horizon_hours:
                continue

            window = [
                f for f in weather_forecasts
                if 0 <= (f.timestamp - now).total_seconds() / 3600 <= hours
            ]
            if not window:
                continue

            # Aggregate weather window
            max_rain_24h = max((w.rainfall_acc_24h for w in window), default=0)
            max_rain_72h = max((w.rainfall_acc_72h for w in window), default=0)
            avg_wind     = np.mean([w.wind_speed_kmh for w in window])
            has_storm    = any(w.condition == "STORM" for w in window)

            # ── Flood Forecast ────────────────────────────────────────────────
            flood_prob = self._forecast_flood(
                district, meta, max_rain_24h, max_rain_72h, has_storm
            )
            if flood_prob > 0.15:
                triggers = self._flood_triggers(max_rain_24h, max_rain_72h)
                alerts.append(DisasterAlert(
                    district=district,
                    lat=meta["lat"], lon=meta["lon"],
                    disaster_type="FLOOD",
                    probability=round(flood_prob, 4),
                    risk_level=self._prob_to_level(flood_prob),
                    forecast_horizon=horizon_label,
                    valid_from=now,
                    valid_until=now + timedelta(hours=hours),
                    triggers=triggers,
                    recommended_actions=self._flood_actions(flood_prob),
                ))

            # ── Landslide Forecast ────────────────────────────────────────────
            slide_prob = self._forecast_landslide(
                district, meta, max_rain_24h, max_rain_72h
            )
            if slide_prob > 0.15:
                triggers = self._landslide_triggers(max_rain_24h, max_rain_72h)
                alerts.append(DisasterAlert(
                    district=district,
                    lat=meta["lat"], lon=meta["lon"],
                    disaster_type="LANDSLIDE",
                    probability=round(slide_prob, 4),
                    risk_level=self._prob_to_level(slide_prob),
                    forecast_horizon=horizon_label,
                    valid_from=now,
                    valid_until=now + timedelta(hours=hours),
                    triggers=triggers,
                    recommended_actions=self._landslide_actions(slide_prob),
                ))

            # ── Flash Flood Forecast ──────────────────────────────────────────
            if has_storm or max_rain_24h > 80:
                ff_prob = min(flood_prob * 1.3, 1.0)
                if ff_prob > 0.30:
                    alerts.append(DisasterAlert(
                        district=district,
                        lat=meta["lat"], lon=meta["lon"],
                        disaster_type="FLASH_FLOOD",
                        probability=round(ff_prob, 4),
                        risk_level=self._prob_to_level(ff_prob),
                        forecast_horizon=horizon_label,
                        valid_from=now,
                        valid_until=now + timedelta(hours=min(hours, 12)),
                        triggers=[f"Storm detected", f"Rain: {max_rain_24h:.0f}mm/24h"],
                        recommended_actions=["EVACUATE low-lying areas immediately",
                                             "Close river crossings"],
                    ))

        alerts.sort(key=lambda a: a.probability, reverse=True)
        return alerts

    def forecast_all_districts(
        self,
        weather_data: Dict[str, List[WeatherForecast]],
        horizon_hours: int = 72,
    ) -> Dict[str, List[DisasterAlert]]:
        """Forecast all districts. weather_data: {district: [WeatherForecast...]}"""
        all_alerts = {}
        for district, forecasts in weather_data.items():
            all_alerts[district] = self.forecast_district(
                district, forecasts, horizon_hours
            )
        return all_alerts

    def generate_mock_forecast(
        self,
        district: str,
        rainfall_scenario: str = "HEAVY",  # DRY / MODERATE / HEAVY / EXTREME
        hours: int = 72,
    ) -> List[WeatherForecast]:
        """
        Generate synthetic weather forecast for testing/demo.
        """
        scenarios = {
            "DRY":      {"rain_1h": 0.0, "acc_24h": 2.0,   "acc_72h": 5.0},
            "MODERATE": {"rain_1h": 3.0, "acc_24h": 40.0,  "acc_72h": 90.0},
            "HEAVY":    {"rain_1h": 8.0, "acc_24h": 110.0, "acc_72h": 270.0},
            "EXTREME":  {"rain_1h": 20.0, "acc_24h": 250.0, "acc_72h": 500.0},
        }
        params = scenarios.get(rainfall_scenario, scenarios["HEAVY"])
        meta   = NEPAL_DISTRICTS.get(district, {"lat": 27.7, "lon": 84.0})
        now    = datetime.now()
        rng    = np.random.default_rng(42)
        forecasts = []

        for h in range(hours):
            noise = rng.normal(1.0, 0.15)
            cond  = "HEAVY_RAIN" if params["rain_1h"] > 5 else (
                    "RAIN" if params["rain_1h"] > 1 else "CLEAR")
            forecasts.append(WeatherForecast(
                timestamp=now + timedelta(hours=h),
                lat=meta["lat"], lon=meta["lon"],
                district=district,
                temp_c=round(22 + rng.normal(0, 3), 1),
                rainfall_mm_1h=round(max(0, params["rain_1h"] * noise), 2),
                rainfall_acc_24h=round(params["acc_24h"] * noise, 1),
                rainfall_acc_72h=round(params["acc_72h"] * noise, 1),
                wind_speed_kmh=round(rng.uniform(5, 40), 1),
                humidity_pct=round(min(100, 60 + params["rain_1h"] * 3), 1),
                pressure_hpa=round(1013 - params["rain_1h"] * 0.5, 1),
                visibility_km=round(max(0.5, 20 - params["rain_1h"] * 0.8), 1),
                condition=cond,
            ))
        return forecasts

    # ── Internal Forecasting Logic ────────────────────────────────────────────

    def _forecast_flood(
        self, district: str, meta: dict,
        rain_24h: float, rain_72h: float, storm: bool,
    ) -> float:
        """Forecast flood probability using ML model if available, else heuristic."""
        if self.flood_model and self.flood_model.is_trained:
            feat = {
                "rainfall_mm_24h": rain_24h,
                "rainfall_mm_72h": rain_72h,
                "river_level_m": 4.0 + rain_24h / 50,
                "river_level_change": rain_24h / 100,
                "soil_moisture_pct": min(95, 50 + rain_72h / 10),
                "slope_deg": 5.0,
                "elevation_m": 300.0,
                "dist_to_river_km": 1.0,
                "population_density": 400,
                "drainage_capacity": 0.4,
                "season": 2,
                "district_risk_index": meta["flood_base"],
                "land_use": 2,
            }
            result = self.flood_model.predict(feat)
            return result["risk_score"]

        # Heuristic fallback
        base  = meta["flood_base"]
        rain_factor = np.clip(rain_24h / FLOOD_THRESHOLDS["EMERGENCY"], 0, 1)
        storm_bonus = 0.15 if storm else 0.0
        return min(1.0, base * 0.4 + rain_factor * 0.5 + storm_bonus)

    def _forecast_landslide(
        self, district: str, meta: dict,
        rain_24h: float, rain_72h: float,
    ) -> float:
        if self.landslide_model and self.landslide_model.is_trained:
            feat = {
                "rainfall_mm_24h": rain_24h,
                "rainfall_mm_72h": rain_72h,
                "antecedent_rain_7d": rain_72h * 2,
                "slope_deg": 35.0,
                "aspect_deg": 180.0,
                "elevation_m": 1500.0,
                "soil_type": 1,
                "vegetation_cover_pct": 40.0,
                "road_proximity_km": 1.0,
                "fault_proximity_km": 8.0,
                "seismic_activity": 0,
                "prev_landslide_1km": 0,
                "district_risk_index": meta["slide_base"],
            }
            result = self.landslide_model.predict(feat)
            return result["risk_score"]

        base  = meta["slide_base"]
        rain_factor = np.clip(rain_24h / LANDSLIDE_THRESHOLDS["EMERGENCY"], 0, 1)
        return min(1.0, base * 0.35 + rain_factor * 0.55 + rain_72h / 1000)

    # ── Trigger & Action Builders ─────────────────────────────────────────────

    @staticmethod
    def _flood_triggers(rain_24h: float, rain_72h: float) -> List[str]:
        triggers = []
        if rain_24h >= FLOOD_THRESHOLDS["EMERGENCY"]:
            triggers.append(f"CRITICAL: {rain_24h:.0f}mm rain in 24h (>{FLOOD_THRESHOLDS['EMERGENCY']}mm threshold)")
        elif rain_24h >= FLOOD_THRESHOLDS["WARNING"]:
            triggers.append(f"WARNING: {rain_24h:.0f}mm rain in 24h")
        elif rain_24h >= FLOOD_THRESHOLDS["WATCH"]:
            triggers.append(f"WATCH: {rain_24h:.0f}mm rain in 24h")
        if rain_72h >= 300:
            triggers.append(f"Sustained heavy rainfall: {rain_72h:.0f}mm over 72h")
        return triggers or [f"Elevated rainfall: {rain_24h:.0f}mm/24h"]

    @staticmethod
    def _landslide_triggers(rain_24h: float, rain_72h: float) -> List[str]:
        triggers = []
        if rain_24h >= LANDSLIDE_THRESHOLDS["EMERGENCY"]:
            triggers.append(f"CRITICAL: {rain_24h:.0f}mm/24h on steep terrain")
        elif rain_24h >= LANDSLIDE_THRESHOLDS["WARNING"]:
            triggers.append(f"High rainfall on susceptible slopes: {rain_24h:.0f}mm")
        if rain_72h >= 200:
            triggers.append(f"Soil saturation risk: {rain_72h:.0f}mm/72h")
        return triggers or [f"Moderate slope instability risk"]

    @staticmethod
    def _flood_actions(prob: float) -> List[str]:
        if prob >= 0.80:
            return [
                "MANDATORY EVACUATION of flood-prone areas",
                "Open emergency shelters immediately",
                "Deploy rescue boats and water rescue teams",
                "Close all river crossings and low-lying roads",
                "Activate Emergency Operations Center",
            ]
        if prob >= 0.60:
            return [
                "Pre-position rescue teams near rivers",
                "Issue public flood warning",
                "Open evacuation shelters",
                "Alert hospitals for surge capacity",
            ]
        if prob >= 0.35:
            return [
                "Issue flood watch advisory",
                "Monitor river gauge levels hourly",
                "Review evacuation plans",
            ]
        return ["Continue monitoring – no immediate action required"]

    @staticmethod
    def _landslide_actions(prob: float) -> List[str]:
        if prob >= 0.80:
            return [
                "EVACUATE communities on steep slopes immediately",
                "Close mountain highways and hill roads",
                "Deploy search and rescue teams",
                "Activate early warning sirens",
            ]
        if prob >= 0.60:
            return [
                "Issue landslide warning for vulnerable communities",
                "Restrict road traffic on mountain routes",
                "Pre-position equipment for debris clearance",
            ]
        if prob >= 0.35:
            return [
                "Issue landslide watch advisory",
                "Inspect vulnerable slopes and roads",
                "Brief local response teams",
            ]
        return ["Continue monitoring"]

    @staticmethod
    def _prob_to_level(prob: float) -> str:
        if prob >= 0.80: return "CRITICAL"
        if prob >= 0.60: return "HIGH"
        if prob >= 0.35: return "MEDIUM"
        return "LOW"


# ─────────────────────────────────────────────────────────────────────────────
# ALERT AGGREGATOR
# ─────────────────────────────────────────────────────────────────────────────

class AlertAggregator:
    """
    Deduplicates and aggregates alerts across districts/time windows.
    Produces a clean national-level alert summary.
    """

    @staticmethod
    def summarise(
        all_alerts: Dict[str, List[DisasterAlert]],
    ) -> Dict:
        total, critical, high, medium, low = 0, 0, 0, 0, 0
        by_type: Dict[str, List] = {}
        district_summary = []

        for district, alerts in all_alerts.items():
            if not alerts:
                continue
            top = alerts[0]
            total += len(alerts)
            cnt = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
            for a in alerts:
                cnt[a.risk_level] = cnt.get(a.risk_level, 0) + 1
                by_type.setdefault(a.disaster_type, []).append(a)
            critical += cnt["CRITICAL"]; high += cnt["HIGH"]
            medium   += cnt["MEDIUM"];   low  += cnt["LOW"]
            district_summary.append({
                "district":    district,
                "top_alert":   top.disaster_type,
                "top_prob":    top.probability,
                "risk_level":  top.risk_level,
                "alert_count": len(alerts),
            })

        district_summary.sort(key=lambda d: d["top_prob"], reverse=True)

        return {
            "total_alerts":     total,
            "critical":         critical,
            "high":             high,
            "medium":           medium,
            "low":              low,
            "districts_at_risk": len(district_summary),
            "top_districts":    district_summary[:10],
            "by_disaster_type": {
                dtype: len(alerts)
                for dtype, alerts in by_type.items()
            },
        }