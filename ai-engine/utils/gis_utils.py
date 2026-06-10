"""
SAJAG AI - GIS Heatmap & Safe Route Module
Converts model risk scores into Leaflet-compatible GeoJSON heatmaps.
Also provides safe route filtering logic.
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, asdict
from scipy.ndimage import gaussian_filter
from loguru import logger


# ─────────────────────────────────────────────────────────────────────────────
# DATA CLASSES
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class HeatmapPoint:
    lat:        float
    lon:        float
    risk_score: float
    risk_level: str
    weight:     float          # normalised 0-1 for Leaflet heatmap plugin

    def to_leaflet(self) -> List[float]:
        """[lat, lon, intensity] format for Leaflet.heat plugin."""
        return [self.lat, self.lon, self.weight]

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class SafeRoute:
    waypoints:     List[Dict]   # [{lat, lon}, ...]
    total_distance_km: float
    max_risk_score:    float
    avg_risk_score:    float
    risk_level:        str
    warnings:          List[str]


# ─────────────────────────────────────────────────────────────────────────────
# HEATMAP GENERATOR
# ─────────────────────────────────────────────────────────────────────────────

class RiskHeatmapGenerator:
    """
    Converts risk score DataFrames into Leaflet-compatible heatmap payloads.
    """

    RISK_COLOR_MAP = {
        "LOW":      "#00C851",
        "MEDIUM":   "#FF8800",
        "HIGH":     "#FF4444",
        "CRITICAL": "#CC0000",
    }

    @staticmethod
    def generate(
        risk_df: pd.DataFrame,
        score_col: str = "risk_score",
        smooth: bool   = True,
    ) -> Dict:
        """
        Args:
            risk_df: DataFrame with [latitude, longitude, <score_col>]
            score_col: name of the risk score column (0-1)
            smooth: apply gaussian smoothing
        Returns:
            {
                "heatmap_points": [[lat, lon, weight], ...],   # for Leaflet.heat
                "geojson": FeatureCollection,                   # for advanced rendering
                "summary": {...},
            }
        """
        df = risk_df[["latitude", "longitude", score_col]].dropna().copy()
        df = df.rename(columns={score_col: "risk_score"})
        df["risk_score"] = df["risk_score"].clip(0, 1)

        if smooth and len(df) >= 9:
            df = RiskHeatmapGenerator._smooth_scores(df)

        # Normalise to 0-1 for Leaflet weight
        mn, mx = df["risk_score"].min(), df["risk_score"].max()
        if mx > mn:
            df["weight"] = ((df["risk_score"] - mn) / (mx - mn)).round(4)
        else:
            df["weight"] = df["risk_score"]

        df["risk_level"] = df["risk_score"].apply(RiskHeatmapGenerator._level)

        heatmap_points = df[["latitude", "longitude", "weight"]].values.tolist()
        geojson        = RiskHeatmapGenerator._to_geojson(df)
        summary        = {
            "total_points": len(df),
            "critical": int((df["risk_level"] == "CRITICAL").sum()),
            "high":     int((df["risk_level"] == "HIGH").sum()),
            "medium":   int((df["risk_level"] == "MEDIUM").sum()),
            "low":      int((df["risk_level"] == "LOW").sum()),
            "avg_risk": round(df["risk_score"].mean(), 4),
            "max_risk": round(df["risk_score"].max(), 4),
        }

        return {
            "heatmap_points": heatmap_points,
            "geojson": geojson,
            "summary": summary,
        }

    @staticmethod
    def _smooth_scores(df: pd.DataFrame) -> pd.DataFrame:
        """Rasterise → gaussian smooth → sample back to original points."""
        lats  = df["latitude"].values
        lons  = df["longitude"].values
        scores = df["risk_score"].values

        # Determine grid size
        n = max(20, int(np.sqrt(len(df))))
        lat_bins = np.linspace(lats.min(), lats.max(), n)
        lon_bins = np.linspace(lons.min(), lons.max(), n)

        grid = np.zeros((n, n))
        cnt  = np.zeros((n, n))
        for lat, lon, s in zip(lats, lons, scores):
            gi = np.searchsorted(lat_bins, lat, side="right") - 1
            gj = np.searchsorted(lon_bins, lon, side="right") - 1
            gi = max(0, min(gi, n-1))
            gj = max(0, min(gj, n-1))
            grid[gi, gj] += s
            cnt[gi, gj]  += 1

        cnt[cnt == 0] = 1
        grid = grid / cnt
        grid = gaussian_filter(grid, sigma=1.5)

        # Sample smoothed values back
        smoothed = []
        for lat, lon in zip(lats, lons):
            gi = np.searchsorted(lat_bins, lat, side="right") - 1
            gj = np.searchsorted(lon_bins, lon, side="right") - 1
            gi = max(0, min(gi, n-1))
            gj = max(0, min(gj, n-1))
            smoothed.append(grid[gi, gj])

        df = df.copy()
        df["risk_score"] = np.clip(smoothed, 0, 1)
        return df

    @staticmethod
    def _to_geojson(df: pd.DataFrame) -> dict:
        features = []
        for _, row in df.iterrows():
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [row["longitude"], row["latitude"]],
                },
                "properties": {
                    "risk_score": round(float(row["risk_score"]), 4),
                    "risk_level": row["risk_level"],
                    "weight":     round(float(row["weight"]), 4),
                    "color":      RiskHeatmapGenerator.RISK_COLOR_MAP[row["risk_level"]],
                },
            })
        return {"type": "FeatureCollection", "features": features}

    @staticmethod
    def _level(score: float) -> str:
        if score >= 0.80: return "CRITICAL"
        if score >= 0.60: return "HIGH"
        if score >= 0.35: return "MEDIUM"
        return "LOW"


# ─────────────────────────────────────────────────────────────────────────────
# SAFE ROUTE GENERATOR
# ─────────────────────────────────────────────────────────────────────────────

class SafeRouteGenerator:
    """
    Generates safe evacuation routes avoiding high-risk zones.
    Uses a simple grid-based cost map approach (no external routing API needed).
    For production, integrate with OpenRouteService or OSRM.
    """

    def __init__(self, risk_grid: Optional[np.ndarray] = None,
                 bounds: Optional[dict] = None):
        self.risk_grid = risk_grid
        self.bounds    = bounds

    def load_risk_grid(
        self,
        risk_points: List[Dict],
        grid_n: int = 50,
    ):
        """
        Build internal risk grid from a list of {lat, lon, risk_score} dicts.
        """
        if not risk_points:
            self.risk_grid = np.zeros((grid_n, grid_n))
            return

        lats   = [p["lat"] for p in risk_points]
        lons   = [p["lon"] for p in risk_points]
        scores = [p["risk_score"] for p in risk_points]

        self.bounds = {
            "lat_min": min(lats), "lat_max": max(lats),
            "lon_min": min(lons), "lon_max": max(lons),
        }
        grid = np.zeros((grid_n, grid_n))
        cnt  = np.zeros((grid_n, grid_n))

        lat_step = (self.bounds["lat_max"] - self.bounds["lat_min"]) / grid_n
        lon_step = (self.bounds["lon_max"] - self.bounds["lon_min"]) / grid_n

        for lat, lon, s in zip(lats, lons, scores):
            if lat_step > 0 and lon_step > 0:
                gi = int((lat - self.bounds["lat_min"]) / lat_step)
                gj = int((lon - self.bounds["lon_min"]) / lon_step)
                gi = max(0, min(gi, grid_n - 1))
                gj = max(0, min(gj, grid_n - 1))
                grid[gi, gj] += s
                cnt[gi, gj]  += 1

        cnt[cnt == 0] = 1
        self.risk_grid = (grid / cnt).clip(0, 1)
        self.risk_grid = gaussian_filter(self.risk_grid, sigma=1.0)
        logger.info(f"Risk grid built: {grid_n}×{grid_n} | mean risk={self.risk_grid.mean():.3f}")

    def suggest_routes(
        self,
        origin: Tuple[float, float],
        destination: Tuple[float, float],
        n_routes: int = 3,
    ) -> List[SafeRoute]:
        """
        Suggest n_routes between origin and destination with varying risk profiles.
        Args:
            origin: (lat, lon)
            destination: (lat, lon)
        Returns:
            list of SafeRoute sorted by risk (safest first)
        """
        routes = []

        # Route 1: Direct (baseline)
        direct = self._linear_route(origin, destination, n_waypoints=20)
        routes.append(self._evaluate_route(direct, "direct"))

        # Route 2: Avoid high-risk zones
        safe = self._risk_avoiding_route(origin, destination, n_waypoints=25)
        routes.append(self._evaluate_route(safe, "risk_avoiding"))

        # Route 3: Maximum detour (extreme caution)
        if n_routes >= 3:
            detour = self._detour_route(origin, destination, n_waypoints=30)
            routes.append(self._evaluate_route(detour, "maximum_detour"))

        routes.sort(key=lambda r: r.avg_risk_score)
        return routes[:n_routes]

    def _linear_route(
        self,
        origin: Tuple, dest: Tuple, n_waypoints: int
    ) -> List[Tuple]:
        lats = np.linspace(origin[0], dest[0], n_waypoints)
        lons = np.linspace(origin[1], dest[1], n_waypoints)
        return list(zip(lats, lons))

    def _risk_avoiding_route(
        self,
        origin: Tuple, dest: Tuple, n_waypoints: int
    ) -> List[Tuple]:
        """Perturb the direct route away from high-risk cells."""
        direct = self._linear_route(origin, dest, n_waypoints)
        if self.risk_grid is None or self.bounds is None:
            return direct

        optimised = [origin]
        for wp in direct[1:-1]:
            risk = self._point_risk(wp)
            if risk > 0.60:
                # Lateral perturbation away from risk
                perturb = 0.02 * (1 - risk)
                candidates = [
                    (wp[0] + perturb, wp[1]),
                    (wp[0] - perturb, wp[1]),
                    (wp[0], wp[1] + perturb),
                    (wp[0], wp[1] - perturb),
                ]
                best = min(candidates, key=self._point_risk)
                optimised.append(best)
            else:
                optimised.append(wp)
        optimised.append(dest)
        return optimised

    def _detour_route(
        self,
        origin: Tuple, dest: Tuple, n_waypoints: int
    ) -> List[Tuple]:
        """Route via a waypoint offset perpendicular to the direct path."""
        mid_lat = (origin[0] + dest[0]) / 2 + 0.03
        mid_lon = (origin[1] + dest[1]) / 2 + 0.03
        via     = (mid_lat, mid_lon)
        seg1    = self._linear_route(origin, via, n_waypoints // 2)
        seg2    = self._linear_route(via, dest, n_waypoints // 2)
        return seg1 + seg2[1:]

    def _point_risk(self, point: Tuple) -> float:
        if self.risk_grid is None or self.bounds is None:
            return 0.0
        n = self.risk_grid.shape[0]
        lat_range = self.bounds["lat_max"] - self.bounds["lat_min"]
        lon_range = self.bounds["lon_max"] - self.bounds["lon_min"]
        if lat_range == 0 or lon_range == 0:
            return 0.0
        gi = int((point[0] - self.bounds["lat_min"]) / lat_range * n)
        gj = int((point[1] - self.bounds["lon_min"]) / lon_range * n)
        gi = max(0, min(gi, n-1))
        gj = max(0, min(gj, n-1))
        return float(self.risk_grid[gi, gj])

    def _evaluate_route(self, waypoints: List[Tuple], route_type: str) -> SafeRoute:
        risks = [self._point_risk(wp) for wp in waypoints]
        dist  = sum(
            self._haversine(waypoints[i], waypoints[i+1])
            for i in range(len(waypoints)-1)
        )
        avg_r = float(np.mean(risks))
        max_r = float(np.max(risks))

        warnings = []
        if max_r >= 0.80:
            warnings.append("Route passes through CRITICAL risk zone")
        elif max_r >= 0.60:
            warnings.append("Route passes through HIGH risk zone")

        if route_type == "direct":
            warnings.append("Direct route – may not avoid all hazards")

        level = "LOW"
        if avg_r >= 0.60:   level = "HIGH"
        elif avg_r >= 0.35: level = "MEDIUM"

        return SafeRoute(
            waypoints=[{"lat": round(wp[0], 5), "lon": round(wp[1], 5)} for wp in waypoints],
            total_distance_km=round(dist, 2),
            max_risk_score=round(max_r, 4),
            avg_risk_score=round(avg_r, 4),
            risk_level=level,
            warnings=warnings,
        )

    @staticmethod
    def _haversine(p1: Tuple, p2: Tuple) -> float:
        """Haversine distance in km."""
        R = 6371.0
        lat1, lon1 = np.radians(p1)
        lat2, lon2 = np.radians(p2)
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
        return R * 2 * np.arcsin(np.sqrt(a))
