"""
SAJAG AI - Landslide Risk Prediction Model
XGBoost-primary model for Nepal mountain terrain analysis.
"""

import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from typing import Optional

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report, roc_auc_score,
    confusion_matrix, average_precision_score,
)
from xgboost import XGBClassifier
from loguru import logger

from config import MODELS_DIR, LANDSLIDE_XGB_PARAMS, RISK_THRESHOLDS


LANDSLIDE_FEATURES = [
    "rainfall_mm_24h", "rainfall_mm_72h", "antecedent_rain_7d",
    "slope_deg", "aspect_deg", "elevation_m", "soil_type",
    "vegetation_cover_pct", "road_proximity_km", "fault_proximity_km",
    "seismic_activity", "prev_landslide_1km", "district_risk_index",
]

MODEL_PATH  = MODELS_DIR / "landslide_model.pkl"


class LandslideRiskModel:
    """XGBoost + RF ensemble for landslide risk prediction."""

    def __init__(self):
        self.xgb_clf = XGBClassifier(**LANDSLIDE_XGB_PARAMS)
        self.rf_clf  = RandomForestClassifier(
            n_estimators=250, max_depth=11, random_state=42,
            class_weight="balanced", n_jobs=-1,
        )
        self.scaler      = StandardScaler()
        self.is_trained  = False
        self.feature_importances_: Optional[pd.Series] = None

    # ── Training ──────────────────────────────────────────────────────────────

    def train(self, df: pd.DataFrame) -> dict:
        X = df[LANDSLIDE_FEATURES].copy()
        y = df["landslide_occurred"].values

        X = self._engineer_features(X)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, stratify=y, random_state=42
        )
        X_tr_sc = self.scaler.fit_transform(X_train)
        X_te_sc = self.scaler.transform(X_test)

        # CV
        skf = StratifiedKFold(5, shuffle=True, random_state=42)
        xgb_cv = cross_val_score(self.xgb_clf, X_tr_sc, y_train,
                                 cv=skf, scoring="roc_auc", n_jobs=-1)
        rf_cv  = cross_val_score(self.rf_clf,  X_tr_sc, y_train,
                                 cv=skf, scoring="roc_auc", n_jobs=-1)
        logger.info(f"XGB CV AUC: {xgb_cv.mean():.4f} ± {xgb_cv.std():.4f}")
        logger.info(f"RF  CV AUC: {rf_cv.mean():.4f} ± {rf_cv.std():.4f}")

        self.xgb_clf.fit(X_tr_sc, y_train,
                         eval_set=[(X_te_sc, y_test)], verbose=False)
        self.rf_clf.fit(X_tr_sc, y_train)

        # Feature importance
        xgb_imp = pd.Series(self.xgb_clf.feature_importances_,
                            index=list(X.columns))
        rf_imp  = pd.Series(self.rf_clf.feature_importances_,
                            index=list(X.columns))
        self.feature_importances_ = ((xgb_imp * 0.60 + rf_imp * 0.40)
                                     .sort_values(ascending=False))

        y_prob = (
            self.xgb_clf.predict_proba(X_te_sc)[:, 1] * 0.60 +
            self.rf_clf.predict_proba(X_te_sc)[:, 1] * 0.40
        )
        y_pred = (y_prob >= 0.50).astype(int)

        metrics = {
            "roc_auc":       round(roc_auc_score(y_test, y_prob), 4),
            "avg_precision": round(average_precision_score(y_test, y_prob), 4),
            "xgb_cv_auc":   round(xgb_cv.mean(), 4),
            "rf_cv_auc":    round(rf_cv.mean(), 4),
            "report":       classification_report(y_test, y_pred, output_dict=True),
            "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
            "feature_importances": self.feature_importances_.to_dict(),
        }
        self.is_trained = True
        logger.success(f"Landslide model | ROC-AUC={metrics['roc_auc']:.4f}")
        return metrics

    # ── Inference ─────────────────────────────────────────────────────────────

    def predict(self, features: dict) -> dict:
        if not self.is_trained:
            raise RuntimeError("Model not trained. Call train() or load().")
        row = pd.DataFrame([features])[LANDSLIDE_FEATURES]
        row = self._engineer_features(row)
        row_sc = self.scaler.transform(row)

        xgb_p = self.xgb_clf.predict_proba(row_sc)[0, 1]
        rf_p  = self.rf_clf.predict_proba(row_sc)[0, 1]
        score = 0.60 * xgb_p + 0.40 * rf_p

        agreement  = 1.0 - abs(xgb_p - rf_p)
        confidence = (agreement + min(score, 1 - score) * 2) / 2

        return {
            "risk_score":  round(float(score), 4),
            "risk_level":  self._score_to_level(score),
            "confidence":  round(float(confidence), 4),
            "xgb_score":   round(float(xgb_p), 4),
            "rf_score":    round(float(rf_p), 4),
        }

    def predict_batch(self, df: pd.DataFrame) -> pd.DataFrame:
        rows   = self._engineer_features(df[LANDSLIDE_FEATURES].copy())
        rows_sc = self.scaler.transform(rows)
        score  = (
            self.xgb_clf.predict_proba(rows_sc)[:, 1] * 0.60 +
            self.rf_clf.predict_proba(rows_sc)[:, 1]  * 0.40
        )
        result = df[["latitude", "longitude"]].copy() if "latitude" in df.columns else pd.DataFrame()
        result["landslide_risk_score"] = score.round(4)
        result["risk_level"] = [self._score_to_level(s) for s in score]
        return result

    # ── Persistence ───────────────────────────────────────────────────────────

    def save(self):
        joblib.dump({
            "xgb_clf": self.xgb_clf, "rf_clf": self.rf_clf,
            "scaler": self.scaler, "feature_importances": self.feature_importances_,
        }, MODEL_PATH)
        logger.success(f"Landslide model saved → {MODEL_PATH}")

    def load(self):
        data = joblib.load(MODEL_PATH)
        self.xgb_clf = data["xgb_clf"]
        self.rf_clf  = data["rf_clf"]
        self.scaler  = data["scaler"]
        self.feature_importances_ = data.get("feature_importances")
        self.is_trained = True
        logger.info("Landslide model loaded.")

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _engineer_features(X: pd.DataFrame) -> pd.DataFrame:
        X = X.copy()
        X["cumulative_rain"]    = X["rainfall_mm_24h"] + X["rainfall_mm_72h"] * 0.5 + X["antecedent_rain_7d"] * 0.25
        X["slope_soil_risk"]    = X["slope_deg"] * (X["soil_type"] + 1) / 4
        X["veg_slope_protect"]  = X["vegetation_cover_pct"] / (X["slope_deg"] + 1)
        X["fault_seismic_risk"] = X["seismic_activity"] / (X["fault_proximity_km"] + 1)
        return X

    @staticmethod
    def _score_to_level(score: float) -> str:
        if score >= RISK_THRESHOLDS["CRITICAL"]:  return "CRITICAL"
        if score >= RISK_THRESHOLDS["HIGH"]:       return "HIGH"
        if score >= RISK_THRESHOLDS["MEDIUM"]:     return "MEDIUM"
        return "LOW"