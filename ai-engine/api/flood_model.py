"""
SAJAG AI - Flood Risk Prediction Model
Ensemble of Random Forest + XGBoost with calibrated probability output.
"""

import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from typing import Optional

from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    classification_report, roc_auc_score,
    confusion_matrix, average_precision_score,
)
from xgboost import XGBClassifier
from loguru import logger

from config import MODELS_DIR, FLOOD_RF_PARAMS, FLOOD_XGB_PARAMS, RISK_THRESHOLDS


FLOOD_FEATURES = [
    "rainfall_mm_24h", "rainfall_mm_72h", "river_level_m",
    "river_level_change", "soil_moisture_pct", "slope_deg",
    "elevation_m", "dist_to_river_km", "population_density",
    "drainage_capacity", "season", "district_risk_index", "land_use",
]

MODEL_PATH   = MODELS_DIR / "flood_model.pkl"
SCALER_PATH  = MODELS_DIR / "flood_scaler.pkl"


class FloodRiskModel:
    """
    Ensemble flood risk prediction.
    Methods:
        train(df)  – fit on labelled dataframe
        predict(X) – returns dict with risk_score, risk_level, confidence
        save() / load()
    """

    def __init__(self):
        self.rf_clf   = RandomForestClassifier(**FLOOD_RF_PARAMS)
        self.xgb_clf  = XGBClassifier(**FLOOD_XGB_PARAMS)
        self.scaler   = StandardScaler()
        self.is_trained = False
        self.feature_importances_: Optional[pd.Series] = None

    # ── Training ──────────────────────────────────────────────────────────────

    def train(self, df: pd.DataFrame) -> dict:
        X = df[FLOOD_FEATURES].copy()
        y = df["flood_occurred"].values

        # Simple engineered features
        X = self._engineer_features(X)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, stratify=y, random_state=42
        )

        X_tr_scaled = self.scaler.fit_transform(X_train)
        X_te_scaled = self.scaler.transform(X_test)

        # Cross-validation
        skf   = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        rf_cv = cross_val_score(self.rf_clf, X_tr_scaled, y_train,
                                cv=skf, scoring="roc_auc", n_jobs=-1)
        xgb_cv = cross_val_score(self.xgb_clf, X_tr_scaled, y_train,
                                 cv=skf, scoring="roc_auc", n_jobs=-1)
        logger.info(f"RF  CV AUC: {rf_cv.mean():.4f} ± {rf_cv.std():.4f}")
        logger.info(f"XGB CV AUC: {xgb_cv.mean():.4f} ± {xgb_cv.std():.4f}")

        # Final fit
        self.rf_clf.fit(X_tr_scaled, y_train)
        self.xgb_clf.fit(X_tr_scaled, y_train,
                         eval_set=[(X_te_scaled, y_test)], verbose=False)

        # Calibrated ensemble via soft voting
        self.ensemble = VotingClassifier(
            estimators=[("rf", self.rf_clf), ("xgb", self.xgb_clf)],
            voting="soft",
            weights=[0.45, 0.55],
        )
        self.ensemble.estimators_ = [self.rf_clf, self.xgb_clf]
        self.ensemble.le_         = None
        self.ensemble.classes_    = np.array([0, 1])

        # Feature importances (average of both)
        rf_imp  = pd.Series(self.rf_clf.feature_importances_,
                            index=self._get_feature_names(X))
        xgb_imp = pd.Series(self.xgb_clf.feature_importances_,
                            index=self._get_feature_names(X))
        self.feature_importances_ = ((rf_imp + xgb_imp) / 2).sort_values(ascending=False)

        # Evaluation
        y_prob = (
            self.rf_clf.predict_proba(X_te_scaled)[:, 1] * 0.45 +
            self.xgb_clf.predict_proba(X_te_scaled)[:, 1] * 0.55
        )
        y_pred = (y_prob >= 0.50).astype(int)

        metrics = {
            "roc_auc":          round(roc_auc_score(y_test, y_prob), 4),
            "avg_precision":    round(average_precision_score(y_test, y_prob), 4),
            "test_samples":     len(y_test),
            "flood_rate_train": round(y_train.mean(), 4),
            "report":           classification_report(y_test, y_pred, output_dict=True),
            "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
            "feature_importances": self.feature_importances_.to_dict(),
            "rf_cv_auc":        round(rf_cv.mean(), 4),
            "xgb_cv_auc":       round(xgb_cv.mean(), 4),
        }
        self.is_trained = True
        logger.success(f"Flood model trained | ROC-AUC={metrics['roc_auc']:.4f} | AP={metrics['avg_precision']:.4f}")
        return metrics

    # ── Inference ─────────────────────────────────────────────────────────────

    def predict(self, features: dict) -> dict:
        """
        features: dict matching FLOOD_FEATURES keys
        Returns:
            risk_score   float 0-1
            risk_level   str  LOW / MEDIUM / HIGH / CRITICAL
            confidence   float 0-1
            contributing_factors list[str]
        """
        if not self.is_trained:
            raise RuntimeError("Model not trained. Call train() or load() first.")

        row = pd.DataFrame([features])[FLOOD_FEATURES]
        row = self._engineer_features(row)
        row_scaled = self.scaler.transform(row)

        rf_prob  = self.rf_clf.predict_proba(row_scaled)[0, 1]
        xgb_prob = self.xgb_clf.predict_proba(row_scaled)[0, 1]
        score    = 0.45 * rf_prob + 0.55 * xgb_prob

        # Agreement = confidence proxy
        agreement   = 1.0 - abs(rf_prob - xgb_prob)
        confidence  = (agreement + min(score, 1 - score) * 2) / 2

        level = self._score_to_level(score)

        return {
            "risk_score":  round(float(score), 4),
            "risk_level":  level,
            "confidence":  round(float(confidence), 4),
            "rf_score":    round(float(rf_prob), 4),
            "xgb_score":   round(float(xgb_prob), 4),
            "contributing_factors": self._top_factors(row),
        }

    def predict_batch(self, df: pd.DataFrame) -> pd.DataFrame:
        rows = df[FLOOD_FEATURES].copy()
        rows = self._engineer_features(rows)
        rows_scaled = self.scaler.transform(rows)

        rf_prob  = self.rf_clf.predict_proba(rows_scaled)[:, 1]
        xgb_prob = self.xgb_clf.predict_proba(rows_scaled)[:, 1]
        score    = 0.45 * rf_prob + 0.55 * xgb_prob

        result = df[["latitude", "longitude"]].copy() if "latitude" in df.columns else pd.DataFrame()
        result["flood_risk_score"] = score.round(4)
        result["risk_level"]       = [self._score_to_level(s) for s in score]
        return result

    # ── Persistence ───────────────────────────────────────────────────────────

    def save(self):
        joblib.dump({
            "rf_clf": self.rf_clf, "xgb_clf": self.xgb_clf,
            "scaler": self.scaler, "feature_importances": self.feature_importances_,
        }, MODEL_PATH)
        logger.success(f"Flood model saved → {MODEL_PATH}")

    def load(self):
        data = joblib.load(MODEL_PATH)
        self.rf_clf  = data["rf_clf"]
        self.xgb_clf = data["xgb_clf"]
        self.scaler  = data["scaler"]
        self.feature_importances_ = data.get("feature_importances")
        self.is_trained = True
        logger.info("Flood model loaded.")

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _engineer_features(X: pd.DataFrame) -> pd.DataFrame:
        X = X.copy()
        X["rain_ratio"]          = X["rainfall_mm_24h"] / (X["rainfall_mm_72h"] + 1e-6)
        X["river_drainage_idx"]  = X["river_level_m"] * (1 - X["drainage_capacity"])
        X["risk_composite"]      = (
            X["district_risk_index"] * X["soil_moisture_pct"] / 100 *
            (1 - X["drainage_capacity"])
        )
        return X

    @staticmethod
    def _get_feature_names(X: pd.DataFrame) -> list:
        return list(X.columns)

    @staticmethod
    def _score_to_level(score: float) -> str:
        if score >= RISK_THRESHOLDS["CRITICAL"]:  return "CRITICAL"
        if score >= RISK_THRESHOLDS["HIGH"]:       return "HIGH"
        if score >= RISK_THRESHOLDS["MEDIUM"]:     return "MEDIUM"
        return "LOW"

    def _top_factors(self, row: pd.DataFrame) -> list[str]:
        if self.feature_importances_ is None:
            return []
        top = self.feature_importances_.head(5)
        return [
            f"{feat}: {row[feat].values[0]:.2f}"
            for feat in top.index if feat in row.columns
        ]