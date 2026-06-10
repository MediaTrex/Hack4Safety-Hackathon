"""
SAJAG AI - Rescue Priority Scoring Model
Multi-class classifier + regression for incident triage.
Outputs a 0-1 priority score and class (Low/Medium/High/Critical).
"""

import numpy as np
import pandas as pd
import joblib
from typing import Optional, List, Dict

from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report, mean_squared_error, r2_score,
    confusion_matrix, mean_absolute_error,
)
from xgboost import XGBClassifier, XGBRegressor
from loguru import logger

from config import MODELS_DIR, DISASTER_BASE_SCORES, PRIORITY_WEIGHTS


PRIORITY_FEATURES = [
    "disaster_type", "people_count", "children_count",
    "elderly_count", "injured_count", "critical_count",
    "time_elapsed_min", "weather_severity", "location_accessibility",
    "flood_risk_score", "landslide_risk_score",
    "available_teams", "nearest_team_dist_km",
]

CLASS_LABELS = {0: "LOW", 1: "MEDIUM", 2: "HIGH", 3: "CRITICAL"}
MODEL_PATH   = MODELS_DIR / "priority_model.pkl"


class RescuePriorityModel:
    """
    Dual output:
        priority_score (0-1) – regression
        priority_class        – multiclass (0=Low … 3=Critical)
    """

    def __init__(self):
        self.clf = XGBClassifier(
            n_estimators=300, max_depth=8, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8,
            use_label_encoder=False, eval_metric="mlogloss",
            random_state=42,
        )
        self.reg = XGBRegressor(
            n_estimators=300, max_depth=8, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8,
            random_state=42,
        )
        self.scaler     = StandardScaler()
        self.is_trained = False
        self.feature_importances_: Optional[pd.Series] = None

    # ── Training ──────────────────────────────────────────────────────────────

    def train(self, df: pd.DataFrame) -> dict:
        X = df[PRIORITY_FEATURES].copy()
        y_cls = df["priority_class"].values
        y_reg = df["priority_score"].values
        X = self._engineer_features(X)

        X_train, X_test, yc_train, yc_test, yr_train, yr_test = train_test_split(
            X, y_cls, y_reg, test_size=0.20, stratify=y_cls, random_state=42
        )
        X_tr_sc = self.scaler.fit_transform(X_train)
        X_te_sc = self.scaler.transform(X_test)

        # Cross-val classifier
        kf = KFold(5, shuffle=True, random_state=42)
        clf_cv = cross_val_score(self.clf, X_tr_sc, yc_train,
                                 cv=kf, scoring="f1_weighted", n_jobs=-1)
        logger.info(f"Classifier CV F1: {clf_cv.mean():.4f} ± {clf_cv.std():.4f}")

        self.clf.fit(X_tr_sc, yc_train,
                     eval_set=[(X_te_sc, yc_test)], verbose=False)
        self.reg.fit(X_tr_sc, yr_train,
                     eval_set=[(X_te_sc, yr_test)], verbose=False)

        # Importances
        clf_imp = pd.Series(self.clf.feature_importances_, index=list(X.columns))
        reg_imp = pd.Series(self.reg.feature_importances_, index=list(X.columns))
        self.feature_importances_ = ((clf_imp + reg_imp) / 2).sort_values(ascending=False)

        yc_pred = self.clf.predict(X_te_sc)
        yr_pred = self.reg.predict(X_te_sc)

        metrics = {
            "classifier": {
                "report": classification_report(yc_test, yc_pred, output_dict=True),
                "confusion_matrix": confusion_matrix(yc_test, yc_pred).tolist(),
                "cv_f1": round(clf_cv.mean(), 4),
            },
            "regressor": {
                "rmse": round(np.sqrt(mean_squared_error(yr_test, yr_pred)), 4),
                "mae":  round(mean_absolute_error(yr_test, yr_pred), 4),
                "r2":   round(r2_score(yr_test, yr_pred), 4),
            },
            "feature_importances": self.feature_importances_.to_dict(),
        }
        self.is_trained = True
        logger.success(
            f"Priority model | CLF F1={metrics['classifier']['cv_f1']:.4f} "
            f"| REG RMSE={metrics['regressor']['rmse']:.4f}"
        )
        return metrics

    # ── Inference ─────────────────────────────────────────────────────────────

    def predict(self, features: dict) -> dict:
        if not self.is_trained:
            raise RuntimeError("Model not trained.")
        row    = pd.DataFrame([features])[PRIORITY_FEATURES]
        row    = self._engineer_features(row)
        row_sc = self.scaler.transform(row)

        cls_proba  = self.clf.predict_proba(row_sc)[0]
        cls_pred   = int(self.clf.predict(row_sc)[0])
        score      = float(self.reg.predict(row_sc)[0])
        score      = max(0.0, min(1.0, score))

        return {
            "priority_score":  round(score, 4),
            "priority_class":  cls_pred,
            "priority_label":  CLASS_LABELS[cls_pred],
            "class_proba": {
                CLASS_LABELS[i]: round(float(p), 4)
                for i, p in enumerate(cls_proba)
            },
            "recommended_action":   self._action(cls_pred),
            "deployment_urgency":   self._urgency(cls_pred, score),
        }

    def rank_incidents(self, incidents: List[Dict]) -> List[Dict]:
        """
        Rank multiple incidents by priority.
        incidents: list of feature dicts (same shape as predict input).
        Returns the same list sorted descending by priority_score with rank added.
        """
        scored = []
        for inc in incidents:
            result = self.predict(inc)
            scored.append({**inc, **result})
        scored.sort(key=lambda x: x["priority_score"], reverse=True)
        for i, s in enumerate(scored):
            s["rank"] = i + 1
        return scored

    # ── Rule-based fallback (no ML needed) ───────────────────────────────────

    @staticmethod
    def rule_based_score(features: dict) -> dict:
        """
        Instant heuristic scoring without ML.
        Used when model is not loaded or for validation.
        """
        d_type    = features.get("disaster_type", 4)
        people    = features.get("people_count", 1)
        critical  = features.get("critical_count", 0)
        elapsed   = features.get("time_elapsed_min", 0)
        access    = features.get("location_accessibility", 0)
        weather   = features.get("weather_severity", 0)

        d_keys = list(DISASTER_BASE_SCORES.keys())
        base   = DISASTER_BASE_SCORES[d_keys[min(d_type, len(d_keys)-1)]]

        score = (
            PRIORITY_WEIGHTS["disaster_type"]         * base +
            PRIORITY_WEIGHTS["people_count"]          * min(people / 100, 1.0) +
            PRIORITY_WEIGHTS["vulnerability_score"]   * min(critical / 10, 1.0) +
            PRIORITY_WEIGHTS["resource_availability"] * (access / 3) +
            PRIORITY_WEIGHTS["time_elapsed"]          * min(elapsed / 120, 1.0)
        )
        score = max(0.0, min(1.0, score))

        if score >= 0.80:   cls = 3
        elif score >= 0.60: cls = 2
        elif score >= 0.35: cls = 1
        else:               cls = 0

        return {
            "priority_score": round(score, 4),
            "priority_class": cls,
            "priority_label": CLASS_LABELS[cls],
            "method": "rule_based",
        }

    # ── Persistence ───────────────────────────────────────────────────────────

    def save(self):
        joblib.dump({
            "clf": self.clf, "reg": self.reg,
            "scaler": self.scaler, "feature_importances": self.feature_importances_,
        }, MODEL_PATH)
        logger.success(f"Priority model saved → {MODEL_PATH}")

    def load(self):
        data = joblib.load(MODEL_PATH)
        self.clf    = data["clf"]
        self.reg    = data["reg"]
        self.scaler = data["scaler"]
        self.feature_importances_ = data.get("feature_importances")
        self.is_trained = True
        logger.info("Priority model loaded.")

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _engineer_features(X: pd.DataFrame) -> pd.DataFrame:
        X = X.copy()
        X["vulnerability_index"]   = (
            (X["children_count"] * 1.5 + X["elderly_count"] * 1.3 + X["critical_count"] * 2.0)
            / (X["people_count"] + 1)
        )
        X["urgency_composite"]     = (
            X["time_elapsed_min"] / 60 * X["location_accessibility"]
        )
        X["total_risk_composite"]  = (
            X["flood_risk_score"] * 0.5 + X["landslide_risk_score"] * 0.5
        )
        X["team_scarcity"]         = (
            1 - np.clip(X["available_teams"] / 20, 0, 1)
        )
        return X

    @staticmethod
    def _action(cls: int) -> str:
        return {
            0: "MONITOR - Standard response queue",
            1: "RESPOND - Dispatch within 30 minutes",
            2: "URGENT  - Dispatch immediately",
            3: "CRITICAL - All available resources, air support if needed",
        }[cls]

    @staticmethod
    def _urgency(cls: int, score: float) -> str:
        if cls == 3 or score >= 0.85: return "IMMEDIATE"
        if cls == 2 or score >= 0.65: return "WITHIN_15_MIN"
        if cls == 1 or score >= 0.40: return "WITHIN_1_HOUR"
        return "WITHIN_4_HOURS"
