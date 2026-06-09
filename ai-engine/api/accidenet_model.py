"""
SAJAG AI - Accident Hotspot Prediction Model
Random Forest classifier for road accident risk prediction.
Supports per-point prediction and spatial hotspot grid generation.
"""

import numpy as np
import pandas as pd
import joblib
from typing import Optional, List, Dict

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    classification_report, roc_auc_score,
    confusion_matrix, average_precision_score,
    f1_score,
)
from xgboost import XGBClassifier
from loguru import logger

from config import MODELS_DIR, ACCIDENT_RF_PARAMS, RISK_THRESHOLDS


ACCIDENT_FEATURES = [
    "hour_of_day", "day_of_week", "month",
    "road_type", "road_condition", "visibility_m",
    "traffic_volume", "speed_limit_kmh", "road_width_m",
    "intersection_type", "street_lighting", "weather_condition",
    "slope_pct", "prev_accidents_1km", "dist_to_hospital_km",
]

MODEL_PATH = MODELS_DIR / "accident_model.pkl"


class AccidentHotspotModel:
    """Random Forest + XGBoost ensemble for road accident hotspot prediction."""

    def __init__(self):
        self.rf_clf  = RandomForestClassifier(**ACCIDENT_RF_PARAMS)
        self.xgb_clf = XGBClassifier(
            n_estimators=250, max_depth=7, learning_rate=0.06,
            subsample=0.8, colsample_bytree=0.8, scale_pos_weight=2,
            use_label_encoder=False, eval_metric="logloss", random_state=42,
        )
        self.scaler     = StandardScaler()
        self.is_trained = False
        self.feature_importances_: Optional[pd.Series] = None

    # ── Training ──────────────────────────────────────────────────────────────

    def train(self, df: pd.DataFrame) -> dict:
        X = df[ACCIDENT_FEATURES].copy()
        y = df["accident_occurred"].values
        X = self._engineer_features(X)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, stratify=y, random_state=42
        )
        X_tr_sc = self.scaler.fit_transform(X_train)
        X_te_sc = self.scaler.transform(X_test)

        skf = StratifiedKFold(5, shuffle=True, random_state=42)
        rf_cv  = cross_val_score(self.rf_clf,  X_tr_sc, y_train,
                                 cv=skf, scoring="roc_auc", n_jobs=-1)
        xgb_cv = cross_val_score(self.xgb_clf, X_tr_sc, y_train,
                                 cv=skf, scoring="roc_auc", n_jobs=-1)
        logger.info(f"RF  CV AUC: {rf_cv.mean():.4f} ± {rf_cv.std():.4f}")
        logger.info(f"XGB CV AUC: {xgb_cv.mean():.4f} ± {xgb_cv.std():.4f}")

        self.rf_clf.fit(X_tr_sc, y_train)
        self.xgb_clf.fit(X_tr_sc, y_train,
                         eval_set=[(X_te_sc, y_test)], verbose=False)

        rf_imp  = pd.Series(self.rf_clf.feature_importances_, index=list(X.columns))
        xgb_imp = pd.Series(self.xgb_clf.feature_importances_, index=list(X.columns))
        self.feature_importances_ = ((rf_imp + xgb_imp) / 2).sort_values(ascending=False)

        y_prob = (
            self.rf_clf.predict_proba(X_te_sc)[:, 1]  * 0.50 +
            self.xgb_clf.predict_proba(X_te_sc)[:, 1] * 0.50
        )
        y_pred = (y_prob >= 0.50).astype(int)

        metrics = {
            "roc_auc":       round(roc_auc_score(y_test, y_prob), 4),
            "avg_precision": round(average_precision_score(y_test, y_prob), 4),
            "f1_score":      round(f1_score(y_test, y_pred), 4),
            "rf_cv_auc":    round(rf_cv.mean(), 4),
            "xgb_cv_auc":   round(xgb_cv.mean(), 4),
            "report":       classification_report(y_test, y_pred, output_dict=True),
            "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
            "feature_importances": self.feature_importances_.to_dict(),
        }
        self.is_trained = True
        logger.success(f"Accident model | ROC-AUC={metrics['roc_auc']:.4f} | F1={metrics['f1_score']:.4f}")
        return metrics

    # ── Inference ─────────────────────────────────────────────────────────────

    def predict(self, features: dict) -> dict:
        if not self.is_trained:
            raise RuntimeError("Model not trained.")
        row = pd.DataFrame([features])[ACCIDENT_FEATURES]
        row = self._engineer_features(row)
        row_sc = self.scaler.transform(row)

        rf_p  = self.rf_clf.predict_proba(row_sc)[0, 1]
        xgb_p = self.xgb_clf.predict_proba(row_sc)[0, 1]
        score = 0.50 * rf_p + 0.50 * xgb_p

        return {
            "risk_score":     round(float(score), 4),
            "risk_level":     self._score_to_level(score),
            "rf_score":       round(float(rf_p), 4),
            "xgb_score":      round(float(xgb_p), 4),
            "patrol_priority": self._patrol_priority(score),
        }

    def generate_hotspot_grid(
        self,
        lat_bounds: tuple,
        lon_bounds: tuple,
        hour: int,
        weather: int = 0,
        grid_n: int = 30,
    ) -> List[Dict]:
        """
        Generate a lat/lon grid of accident risk scores.
        Returns list of {lat, lon, risk_score, risk_level} dicts.
        Useful for heatmap generation.
        """
        lats = np.linspace(lat_bounds[0], lat_bounds[1], grid_n)
        lons = np.linspace(lon_bounds[0], lon_bounds[1], grid_n)
        grid = []

        for lat in lats:
            for lon in lons:
                feat = {
                    "hour_of_day": hour,
                    "day_of_week": 1,
                    "month": 6,
                    "road_type": 0,
                    "road_condition": 2,
                    "visibility_m": 5000 if weather == 0 else 1000,
                    "traffic_volume": 500,
                    "speed_limit_kmh": 60,
                    "road_width_m": 6.0,
                    "intersection_type": 0,
                    "street_lighting": 2,
                    "weather_condition": weather,
                    "slope_pct": 5.0,
                    "prev_accidents_1km": 1,
                    "dist_to_hospital_km": 10.0,
                }
                result = self.predict(feat)
                grid.append({
                    "lat": round(float(lat), 5),
                    "lon": round(float(lon), 5),
                    "risk_score": result["risk_score"],
                    "risk_level": result["risk_level"],
                })
        return grid

    # ── Persistence ───────────────────────────────────────────────────────────

    def save(self):
        joblib.dump({
            "rf_clf": self.rf_clf, "xgb_clf": self.xgb_clf,
            "scaler": self.scaler, "feature_importances": self.feature_importances_,
        }, MODEL_PATH)
        logger.success(f"Accident model saved → {MODEL_PATH}")

    def load(self):
        data = joblib.load(MODEL_PATH)
        self.rf_clf  = data["rf_clf"]
        self.xgb_clf = data["xgb_clf"]
        self.scaler  = data["scaler"]
        self.feature_importances_ = data.get("feature_importances")
        self.is_trained = True
        logger.info("Accident model loaded.")

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _engineer_features(X: pd.DataFrame) -> pd.DataFrame:
        X = X.copy()
        # Time cyclical encoding
        X["hour_sin"] = np.sin(2 * np.pi * X["hour_of_day"] / 24)
        X["hour_cos"] = np.cos(2 * np.pi * X["hour_of_day"] / 24)
        X["dow_sin"]  = np.sin(2 * np.pi * X["day_of_week"] / 7)
        X["dow_cos"]  = np.cos(2 * np.pi * X["day_of_week"] / 7)
        # Rush hour flag
        X["is_rush_hour"] = (
            ((X["hour_of_day"] >= 7) & (X["hour_of_day"] <= 9)) |
            ((X["hour_of_day"] >= 17) & (X["hour_of_day"] <= 19))
        ).astype(int)
        # Night driving flag
        X["is_night"] = (
            (X["hour_of_day"] >= 21) | (X["hour_of_day"] <= 5)
        ).astype(int)
        # Speed × road condition risk index
        X["speed_road_risk"] = X["speed_limit_kmh"] * (X["road_condition"] + 1) / 4
        # Visibility risk
        X["visibility_risk"] = 1 - np.clip(X["visibility_m"] / 10000, 0, 1)
        return X

    @staticmethod
    def _score_to_level(score: float) -> str:
        if score >= RISK_THRESHOLDS["CRITICAL"]:  return "CRITICAL"
        if score >= RISK_THRESHOLDS["HIGH"]:       return "HIGH"
        if score >= RISK_THRESHOLDS["MEDIUM"]:     return "MEDIUM"
        return "LOW"

    @staticmethod
    def _patrol_priority(score: float) -> str:
        if score >= 0.80: return "IMMEDIATE"
        if score >= 0.60: return "WITHIN_1HR"
        if score >= 0.35: return "WITHIN_6HR"
        return "ROUTINE"