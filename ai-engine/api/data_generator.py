"""
SAJAG AI - Synthetic Dataset Generator
Generates realistic Nepal-specific training data for all ML models.
Run once to create training datasets before model training.
"""

import numpy as np
import pandas as pd
from pathlib import Path
from loguru import logger

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config import DATA_DIR, NEPAL_BOUNDS, HIGH_RISK_DISTRICTS

rng = np.random.default_rng(42)


# ─────────────────────────────────────────────────────────────────────────────
# FLOOD DATASET
# ─────────────────────────────────────────────────────────────────────────────

def generate_flood_dataset(n: int = 15_000) -> pd.DataFrame:
    lat = rng.uniform(NEPAL_BOUNDS["lat_min"], NEPAL_BOUNDS["lat_max"], n)
    lon = rng.uniform(NEPAL_BOUNDS["lon_min"], NEPAL_BOUNDS["lon_max"], n)

    season = rng.choice([0, 1, 2, 3], n, p=[0.25, 0.20, 0.40, 0.15])
    rainfall_base = np.where(season == 2, 80, np.where(season == 1, 30, 10))

    rainfall_24h     = np.clip(rng.gamma(2, rainfall_base / 2 + 1), 0, 500)
    rainfall_72h     = rainfall_24h * rng.uniform(2.0, 4.0, n)
    river_level      = rng.uniform(0.5, 12.0, n)
    river_change     = rng.normal(0, 1.5, n)
    soil_moisture    = np.clip(rng.beta(2, 3, n) * 100 + season * 8, 0, 100)
    slope            = rng.exponential(15, n)
    elevation        = rng.uniform(60, 4000, n)
    dist_to_river    = rng.exponential(3, n)
    pop_density      = rng.lognormal(5, 1.5, n)
    drainage         = np.clip(rng.beta(2, 2, n), 0.05, 1.0)
    district_risk    = rng.uniform(0.1, 1.0, n)
    land_use         = rng.choice([0, 1, 2, 3], n, p=[0.30, 0.40, 0.20, 0.10])

    p_flood = (
        0.25 * np.clip(rainfall_24h / 200, 0, 1) +
        0.20 * np.clip(rainfall_72h / 600, 0, 1) +
        0.15 * np.clip(river_level / 12, 0, 1) +
        0.10 * np.clip(soil_moisture / 100, 0, 1) +
        0.10 * (1 - np.clip(elevation / 4000, 0, 1)) +
        0.08 * (1 - np.clip(dist_to_river / 20, 0, 1)) +
        0.07 * district_risk +
        0.05 * (1 - drainage)
    )
    p_flood = np.clip(p_flood + rng.normal(0, 0.05, n), 0, 1)
    flood   = (rng.uniform(size=n) < p_flood).astype(int)

    df = pd.DataFrame({
        "latitude": lat, "longitude": lon,
        "rainfall_mm_24h": rainfall_24h.round(2),
        "rainfall_mm_72h": rainfall_72h.round(2),
        "river_level_m": river_level.round(2),
        "river_level_change": river_change.round(2),
        "soil_moisture_pct": soil_moisture.round(2),
        "slope_deg": slope.round(2),
        "elevation_m": elevation.round(1),
        "dist_to_river_km": dist_to_river.round(2),
        "population_density": pop_density.round(0).astype(int),
        "drainage_capacity": drainage.round(3),
        "season": season,
        "district_risk_index": district_risk.round(3),
        "land_use": land_use,
        "flood_occurred": flood,
    })
    logger.info(f"Flood dataset: {len(df)} rows | flood rate={flood.mean():.2%}")
    return df


# ─────────────────────────────────────────────────────────────────────────────
# LANDSLIDE DATASET
# ─────────────────────────────────────────────────────────────────────────────

def generate_landslide_dataset(n: int = 12_000) -> pd.DataFrame:
    lat = rng.uniform(NEPAL_BOUNDS["lat_min"], NEPAL_BOUNDS["lat_max"], n)
    lon = rng.uniform(NEPAL_BOUNDS["lon_min"], NEPAL_BOUNDS["lon_max"], n)

    slope              = rng.gamma(3, 10, n)
    aspect             = rng.uniform(0, 360, n)
    elevation          = rng.uniform(500, 5000, n)
    soil_type          = rng.choice([0, 1, 2, 3], n, p=[0.15, 0.35, 0.25, 0.25])
    vegetation         = np.clip(rng.beta(3, 2, n) * 100, 0, 100)
    road_proximity     = rng.exponential(2, n)
    fault_proximity    = rng.exponential(10, n)
    seismic            = rng.choice([0, 1, 2, 3], n, p=[0.50, 0.30, 0.15, 0.05])
    prev_landslide     = rng.binomial(1, 0.2, n)
    district_risk      = rng.uniform(0.2, 1.0, n)
    rainfall_24h       = np.clip(rng.gamma(2, 25), 0, 400) * np.ones(n)
    rainfall_24h      += rng.normal(0, 10, n)
    rainfall_24h       = np.clip(rainfall_24h, 0, 400)
    rainfall_72h       = rainfall_24h * rng.uniform(2, 3.5, n)
    antecedent_rain    = rainfall_72h + rng.uniform(0, 100, n)

    slope_norm = np.clip(slope / 60, 0, 1)
    soil_factor = np.where(soil_type == 1, 0.9,
                  np.where(soil_type == 3, 0.7,
                  np.where(soil_type == 2, 0.6, 0.3)))

    p_slide = (
        0.25 * slope_norm +
        0.20 * soil_factor +
        0.15 * np.clip(rainfall_24h / 200, 0, 1) +
        0.10 * np.clip(antecedent_rain / 300, 0, 1) +
        0.10 * (1 - np.clip(vegetation / 100, 0, 1)) +
        0.08 * (seismic / 3) +
        0.07 * prev_landslide +
        0.05 * (1 - np.clip(fault_proximity / 20, 0, 1))
    )
    p_slide  = np.clip(p_slide + rng.normal(0, 0.05, n), 0, 1)
    landslide = (rng.uniform(size=n) < p_slide).astype(int)

    df = pd.DataFrame({
        "latitude": lat, "longitude": lon,
        "rainfall_mm_24h": rainfall_24h.round(2),
        "rainfall_mm_72h": rainfall_72h.round(2),
        "antecedent_rain_7d": antecedent_rain.round(2),
        "slope_deg": slope.round(2),
        "aspect_deg": aspect.round(1),
        "elevation_m": elevation.round(1),
        "soil_type": soil_type,
        "vegetation_cover_pct": vegetation.round(1),
        "road_proximity_km": road_proximity.round(2),
        "fault_proximity_km": fault_proximity.round(2),
        "seismic_activity": seismic,
        "prev_landslide_1km": prev_landslide,
        "district_risk_index": district_risk.round(3),
        "landslide_occurred": landslide,
    })
    logger.info(f"Landslide dataset: {len(df)} rows | rate={landslide.mean():.2%}")
    return df


# ─────────────────────────────────────────────────────────────────────────────
# ACCIDENT HOTSPOT DATASET
# ─────────────────────────────────────────────────────────────────────────────

def generate_accident_dataset(n: int = 20_000) -> pd.DataFrame:
    hour        = rng.integers(0, 24, n)
    dow         = rng.integers(0, 7, n)
    month       = rng.integers(1, 13, n)
    road_type   = rng.choice([0, 1, 2, 3], n, p=[0.20, 0.30, 0.30, 0.20])
    road_cond   = rng.choice([0, 1, 2, 3], n, p=[0.15, 0.30, 0.35, 0.20])
    visibility  = rng.uniform(50, 10000, n)
    traffic     = rng.lognormal(5, 1, n).clip(10, 5000).astype(int)
    speed_limit = rng.choice([30, 40, 50, 60, 80, 100], n,
                             p=[0.15, 0.20, 0.25, 0.20, 0.15, 0.05])
    road_width  = rng.uniform(3.5, 10.0, n)
    intersection= rng.choice([0, 1, 2, 3], n, p=[0.40, 0.25, 0.25, 0.10])
    lighting    = rng.choice([0, 1, 2, 3], n, p=[0.20, 0.25, 0.30, 0.25])
    weather     = rng.choice([0, 1, 2, 3], n, p=[0.55, 0.10, 0.25, 0.10])
    slope_pct   = rng.gamma(1.5, 4, n)
    prev_acc    = rng.poisson(1.5, n)
    dist_hosp   = rng.exponential(15, n)
    lat         = rng.uniform(NEPAL_BOUNDS["lat_min"], NEPAL_BOUNDS["lat_max"], n)
    lon         = rng.uniform(NEPAL_BOUNDS["lon_min"], NEPAL_BOUNDS["lon_max"], n)

    hour_risk = np.where((hour >= 7) & (hour <= 9), 0.7,
                np.where((hour >= 17) & (hour <= 19), 0.8,
                np.where((hour >= 22) | (hour <= 5), 0.9, 0.3)))

    p_acc = (
        0.20 * hour_risk +
        0.15 * (road_cond / 3) +
        0.12 * (1 - np.clip(visibility / 10000, 0, 1)) +
        0.10 * (weather / 3) +
        0.10 * (1 - (lighting / 3)) +
        0.08 * np.clip(slope_pct / 20, 0, 1) +
        0.08 * np.clip(prev_acc / 10, 0, 1) +
        0.07 * np.clip(speed_limit / 100, 0, 1) +
        0.05 * (intersection > 0).astype(float) +
        0.05 * (1 - np.clip(road_width / 10, 0, 1))
    )
    p_acc     = np.clip(p_acc + rng.normal(0, 0.04, n), 0, 1)
    accident  = (rng.uniform(size=n) < p_acc).astype(int)

    df = pd.DataFrame({
        "latitude": lat, "longitude": lon,
        "hour_of_day": hour, "day_of_week": dow, "month": month,
        "road_type": road_type, "road_condition": road_cond,
        "visibility_m": visibility.round(0).astype(int),
        "traffic_volume": traffic,
        "speed_limit_kmh": speed_limit,
        "road_width_m": road_width.round(1),
        "intersection_type": intersection,
        "street_lighting": lighting,
        "weather_condition": weather,
        "slope_pct": slope_pct.round(2),
        "prev_accidents_1km": prev_acc,
        "dist_to_hospital_km": dist_hosp.round(2),
        "accident_occurred": accident,
    })
    logger.info(f"Accident dataset: {len(df)} rows | rate={accident.mean():.2%}")
    return df


# ─────────────────────────────────────────────────────────────────────────────
# CROWD DENSITY DATASET
# ─────────────────────────────────────────────────────────────────────────────

def generate_crowd_dataset(n: int = 8_000) -> pd.DataFrame:
    hour         = rng.integers(0, 24, n)
    dow          = rng.integers(0, 7, n)
    month        = rng.integers(1, 13, n)
    event_type   = rng.choice([0, 1, 2, 3, 4], n, p=[0.40, 0.25, 0.15, 0.10, 0.10])
    capacity     = rng.integers(100, 100_000, n)
    crowd        = (capacity * rng.beta(2, 2, n)).astype(int)
    area         = (capacity * rng.uniform(0.5, 2.5, n)).round(0)
    entries      = rng.integers(1, 20, n)
    temp         = rng.uniform(5, 40, n)
    security     = rng.integers(2, 500, n)
    exits        = rng.integers(2, 30, n)

    occupancy    = crowd / np.maximum(capacity, 1)
    density_m2   = crowd / np.maximum(area, 1)

    levels = np.zeros(n, dtype=int)
    levels[occupancy > 0.50] = 1
    levels[occupancy > 0.75] = 2
    levels[occupancy > 0.90] = 3

    p_stamp = (
        0.30 * np.clip(occupancy, 0, 1) +
        0.20 * (1 - np.clip(entries / 20, 0, 1)) +
        0.20 * (1 - np.clip(exits / 30, 0, 1)) +
        0.15 * (event_type > 0).astype(float) +
        0.15 * (1 - np.clip(security / 500, 0, 1))
    )
    p_stamp = np.clip(p_stamp + rng.normal(0, 0.03, n), 0, 1)

    df = pd.DataFrame({
        "hour_of_day": hour, "day_of_week": dow, "month": month,
        "event_type": event_type,
        "venue_capacity": capacity,
        "estimated_crowd": crowd,
        "area_m2": area.astype(int),
        "entry_points": entries,
        "emergency_exits": exits,
        "security_personnel": security,
        "ambient_temp_c": temp.round(1),
        "occupancy_ratio": occupancy.round(4),
        "density_per_m2": density_m2.round(4),
        "crowd_density_level": levels,
        "stampede_risk": p_stamp.round(4),
    })
    logger.info(f"Crowd dataset: {len(df)} rows | critical rate={(levels==3).mean():.2%}")
    return df


# ─────────────────────────────────────────────────────────────────────────────
# RESCUE PRIORITY DATASET
# ─────────────────────────────────────────────────────────────────────────────

def generate_priority_dataset(n: int = 10_000) -> pd.DataFrame:
    dis_type    = rng.integers(0, 8, n)
    people      = rng.integers(1, 200, n)
    children    = (people * rng.beta(1, 4, n)).astype(int)
    elderly     = (people * rng.beta(1, 5, n)).astype(int)
    injured     = np.minimum((people * rng.beta(2, 3, n)).astype(int), people)
    critical    = np.minimum((injured * rng.beta(1, 4, n)).astype(int), injured)
    elapsed     = rng.exponential(30, n).clip(0, 1440)
    weather     = rng.choice([0, 1, 2, 3], n, p=[0.40, 0.25, 0.25, 0.10])
    access      = rng.choice([0, 1, 2, 3], n, p=[0.30, 0.30, 0.25, 0.15])
    flood_risk  = rng.uniform(0, 1, n)
    slide_risk  = rng.uniform(0, 1, n)
    avail_teams = rng.integers(0, 20, n)
    team_dist   = rng.exponential(10, n)

    disaster_base = np.array([0.85, 0.90, 0.95, 0.80, 0.70, 0.65, 0.55, 0.60])[dis_type]

    score = (
        0.25 * disaster_base +
        0.20 * np.clip(people / 100, 0, 1) +
        0.15 * np.clip((children + elderly * 1.5) / 50, 0, 1) +
        0.15 * np.clip(critical / 20, 0, 1) +
        0.10 * np.clip(elapsed / 120, 0, 1) +
        0.08 * (access / 3) +
        0.07 * (weather / 3)
    )
    score = np.clip(score + rng.normal(0, 0.03, n), 0, 1)

    p_class = np.zeros(n, dtype=int)
    p_class[score >= 0.35] = 1
    p_class[score >= 0.60] = 2
    p_class[score >= 0.80] = 3

    df = pd.DataFrame({
        "disaster_type": dis_type,
        "people_count": people,
        "children_count": children,
        "elderly_count": elderly,
        "injured_count": injured,
        "critical_count": critical,
        "time_elapsed_min": elapsed.round(1),
        "weather_severity": weather,
        "location_accessibility": access,
        "flood_risk_score": flood_risk.round(4),
        "landslide_risk_score": slide_risk.round(4),
        "available_teams": avail_teams,
        "nearest_team_dist_km": team_dist.round(2),
        "priority_score": score.round(4),
        "priority_class": p_class,
    })
    logger.info(f"Priority dataset: {len(df)} rows | critical rate={(p_class==3).mean():.2%}")
    return df


# ─────────────────────────────────────────────────────────────────────────────
# RUNNER
# ─────────────────────────────────────────────────────────────────────────────

def generate_all(save: bool = True) -> dict:
    datasets = {
        "flood":     generate_flood_dataset(),
        "landslide": generate_landslide_dataset(),
        "accident":  generate_accident_dataset(),
        "crowd":     generate_crowd_dataset(),
        "priority":  generate_priority_dataset(),
    }
    if save:
        for name, df in datasets.items():
            path = DATA_DIR / f"{name}_training.csv"
            df.to_csv(path, index=False)
            logger.success(f"Saved {name} dataset → {path}")
    return datasets


if __name__ == "__main__":
    generate_all(save=True)