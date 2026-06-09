"""
SAJAG AI - Earthquake Damage Estimation Model
Estimates structural damage probability and affected population
from seismic parameters. Nepal-specific (Himalayan seismic zone).
"""

import numpy as np
import pandas as pd
import joblib
from typing import Dict, List, Optional

from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, mean_absolute_error, r2_score
from xgboost import XGBClassifier, XGBRegressor
from loguru import logger

from config import MODELS_DIR, NEPAL_BOUNDS


EQ_FEATURES = [
    "magnitude",                 # Richter / Moment magnitude
    "depth_km",                  # Focal depth
    "dist_to_epicenter_km",      # Distance from assessment point to epicenter
    "pga_gal",                   # Peak Ground Acceleration (cm/s²)
    "pgv_cms",                   # Peak Ground Velocity (cm/s)
    "soil_class",                # 0=rock,1=stiff_soil,2=soft_soil,3=liquefiable
    "building_type",             # 0=RCC,1=stone,2=brick,3=timber,4=mud
    "building_age_years",
    "floors",
    "population_density",
    "slope_deg",
    "dist_to_fault_km",
    "prev_earthquake_5yr",       # 0/1 prior earthquake in area
    "elevation_m",
]

DAMAGE_LABELS = {
    0: "NONE",
    1: "MINOR",
    2: "MODERATE",
    3: "MAJOR",
    4: "COLLAPSE",
}

MODEL_PATH = MODELS_DIR / "earthquake_model.pkl"


def generate_earthquake_dataset(n: int = 10_000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    mag         = rng.uniform(3.0, 8.5, n)
    depth       = rng.exponential(20, n).clip(2, 100)
    dist_epi    = rng.exponential(30, n).clip(0.5, 300)
    soil        = rng.choice([0, 1, 2, 3], n, p=[0.15, 0.35, 0.35, 0.15])
    bld_type    = rng.choice([0, 1, 2, 3, 4], n, p=[0.20, 0.30, 0.25, 0.15, 0.10])
    bld_age     = rng.integers(1, 80, n)
    floors      = rng.choice([1, 2, 3, 4, 5, 6], n, p=[0.30, 0.30, 0.20, 0.10, 0.07, 0.03])
    pop_density = rng.lognormal(5, 1.5, n)
    slope       = rng.exponential(10, n)
    fault_dist  = rng.exponential(15, n)
    prev_eq     = rng.binomial(1, 0.25, n)
    elevation   = rng.uniform(200, 3000, n)
    lat         = rng.uniform(NEPAL_BOUNDS["lat_min"], NEPAL_BOUNDS["lat_max"], n)
    lon         = rng.uniform(NEPAL_BOUNDS["lon_min"], NEPAL_BOUNDS["lon_max"], n)

    # Attenuation: PGA decreases with distance and depth
    pga = (10 ** (0.5 * mag - 0.8)) * (1 / (dist_epi + depth * 0.5 + 1))
    pga = np.clip(pga * 1000, 0.1, 2000) * rng.uniform(0.8, 1.2, n)
    pgv = pga * 0.025 * rng.uniform(0.8, 1.2, n)

    # Site amplification
    amp = np.where(soil == 3, 2.5, np.where(soil == 2, 1.8,
          np.where(soil == 1, 1.2, 1.0)))
    pga = pga * amp
    pgv = pgv * amp

    # Vulnerability: older stone/mud buildings on soft soil → more damage
    vuln = (
        0.30 * np.clip(pga / 1000, 0, 1) +
        0.20 * (bld_type / 4) +
        0.15 * (soil / 3) +
        0.12 * np.clip(bld_age / 80, 0, 1) +
        0.10 * (1 - np.clip(fault_dist / 50, 0, 1)) +
        0.08 * np.clip(floors / 6, 0, 1) +
        0.05 * prev_eq
    )
    vuln = np.clip(vuln + rng.normal(0, 0.04, n), 0, 1)

    damage = np.zeros(n, dtype=int)
    damage[vuln >= 0.20] = 1
    damage[vuln >= 0.40] = 2
    damage[vuln >= 0.62] = 3
    damage[vuln >= 0.80] = 4

    # Affected population estimate
    affected_pct = np.clip(vuln * 1.2, 0, 1)

    df = pd.DataFrame({
        "latitude": lat.round(5), "longitude": lon.round(5),
        "magnitude": mag.round(2), "depth_km": depth.round(1),
        "dist_to_epicenter_km": dist_epi.round(1),
        "pga_gal": pga.round(2), "pgv_cms": pgv.round(3),
        "soil_class": soil, "building_type": bld_type,
        "building_age_years": bld_age, "floors": floors,
        "population_density": pop_density.round(0).astype(int),
        "slope_deg": slope.round(1), "dist_to_fault_km": fault_dist.round(1),
        "prev_earthquake_5yr": prev_eq, "elevation_m": elevation.round(0).astype(int),
        "damage_level": damage, "affected_pct": affected_pct.round(4),
    })
    logger.info(f"Earthquake dataset: {len(df)} rows | collapse={( damage==4).mean():.2%}")
    return df


class EarthquakeDamageModel:
    """
    Dual output:
        damage_level (0-4 classification)
        affected_pct (regression 0-1)
    """

    def __init__(self):
        self.clf = XGBClassifier(
            n_estimators=300, max_depth=8, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8,
            use_label_encoder=False, eval_metric="mlogloss",
            random_state=42,
        )
        self.reg = XGBRegressor(
            n_estimators=250, max_depth=7, learning_rate=0.06,
            subsample=0.8, random_state=42,
        )
        self.scaler     = StandardScaler()
        self.is_trained = False

    def train(self, df: pd.DataFrame) -> dict:
        X  = df[EQ_FEATURES].copy()
        yc = df["damage_level"].values
        yr = df["affected_pct"].values
        X  = self._engineer(X)

        X_tr, X_te, yc_tr, yc_te, yr_tr, yr_te = train_test_split(
            X, yc, yr, test_size=0.20, stratify=yc, random_state=42
        )
        X_tr_sc = self.scaler.fit_transform(X_tr)
        X_te_sc = self.scaler.transform(X_te)

        self.clf.fit(X_tr_sc, yc_tr, eval_set=[(X_te_sc, yc_te)], verbose=False)
        self.reg.fit(X_tr_sc, yr_tr, eval_set=[(X_te_sc, yr_te)], verbose=False)

        metrics = {
            "damage_report":  classification_report(yc_te, self.clf.predict(X_te_sc), output_dict=True),
            "affected_mae":   round(mean_absolute_error(yr_te, self.reg.predict(X_te_sc)), 4),
            "affected_r2":    round(r2_score(yr_te, self.reg.predict(X_te_sc)), 4),
        }
        self.is_trained = True
        logger.success(f"Earthquake model | MAE={metrics['affected_mae']:.4f} | R²={metrics['affected_r2']:.4f}")
        return metrics

    def predict(self, features: dict) -> dict:
        if not self.is_trained:
            raise RuntimeError("Earthquake model not trained.")
        row    = pd.DataFrame([features])[EQ_FEATURES]
        row    = self._engineer(row)
        row_sc = self.scaler.transform(row)

        dmg_cls  = int(self.clf.predict(row_sc)[0])
        dmg_prob = self.clf.predict_proba(row_sc)[0]
        aff_pct  = float(self.reg.predict(row_sc)[0])
        aff_pct  = max(0.0, min(1.0, aff_pct))

        pop     = features.get("population_density", 500)
        est_aff = int(aff_pct * pop)

        return {
            "damage_level":    dmg_cls,
            "damage_label":    DAMAGE_LABELS[dmg_cls],
            "affected_pct":    round(aff_pct, 4),
            "estimated_affected_per_km2": est_aff,
            "class_proba":     {DAMAGE_LABELS[i]: round(float(p), 4) for i, p in enumerate(dmg_prob)},
            "immediate_response_needed": dmg_cls >= 3,
            "response_tier":   self._response_tier(dmg_cls),
        }

    def predict_impact_zone(
        self,
        epicenter_lat: float,
        epicenter_lon: float,
        magnitude: float,
        depth_km: float,
        grid_n: int = 20,
    ) -> List[Dict]:
        """
        Estimate damage across a spatial grid around an epicenter.
        Returns list of {lat, lon, damage_level, damage_label, affected_pct}.
        """
        radius_deg = magnitude * 0.3
        lats = np.linspace(epicenter_lat - radius_deg, epicenter_lat + radius_deg, grid_n)
        lons = np.linspace(epicenter_lon - radius_deg, epicenter_lon + radius_deg, grid_n)
        results = []

        for lat in lats:
            for lon in lons:
                dist = np.sqrt((lat - epicenter_lat)**2 + (lon - epicenter_lon)**2) * 111
                feat = {
                    "magnitude": magnitude, "depth_km": depth_km,
                    "dist_to_epicenter_km": max(dist, 0.5),
                    "pga_gal": max(0, (10 ** (0.5 * magnitude - 0.8)) / (dist + 1) * 1000),
                    "pgv_cms": max(0, (10 ** (0.5 * magnitude - 0.8)) / (dist + 1) * 25),
                    "soil_class": 1, "building_type": 1,
                    "building_age_years": 30, "floors": 2,
                    "population_density": 300, "slope_deg": 10.0,
                    "dist_to_fault_km": 5.0, "prev_earthquake_5yr": 0,
                    "elevation_m": 800.0,
                }
                pred = self.predict(feat)
                results.append({
                    "lat": round(float(lat), 5), "lon": round(float(lon), 5),
                    "damage_level": pred["damage_level"],
                    "damage_label": pred["damage_label"],
                    "affected_pct": pred["affected_pct"],
                })
        return results

    def save(self):
        joblib.dump({"clf": self.clf, "reg": self.reg, "scaler": self.scaler}, MODEL_PATH)
        logger.success(f"Earthquake model saved → {MODEL_PATH}")

    def load(self):
        data = joblib.load(MODEL_PATH)
        self.clf = data["clf"]; self.reg = data["reg"]
        self.scaler = data["scaler"]; self.is_trained = True
        logger.info("Earthquake model loaded.")

    @staticmethod
    def _engineer(X: pd.DataFrame) -> pd.DataFrame:
        X = X.copy()
        X["pga_mag_ratio"]   = X["pga_gal"] / (X["magnitude"] ** 2 + 1e-6)
        X["depth_dist"]      = X["depth_km"] * X["dist_to_epicenter_km"]
        X["vuln_composite"]  = (X["building_type"] / 4) * (X["building_age_years"] / 80) * (X["soil_class"] / 3 + 0.5)
        X["shallow_close"]   = ((X["depth_km"] < 20) & (X["dist_to_epicenter_km"] < 30)).astype(int)
        return X

    @staticmethod
    def _response_tier(level: int) -> str:
        return {
            0: "MONITORING",
            1: "LOCAL_RESPONSE",
            2: "DISTRICT_RESPONSE",
            3: "NATIONAL_RESPONSE",
            4: "INTERNATIONAL_RESPONSE",
        }[level]