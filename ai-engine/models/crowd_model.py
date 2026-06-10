"""
SAJAG AI - Crowd Density Analysis Module
Two analysis paths:
  1. Tabular ML model  – event features → density level + stampede risk
  2. Computer Vision   – YOLOv8 people detection on images/video frames
"""

import numpy as np
import pandas as pd
import joblib
import cv2
from pathlib import Path
from typing import Optional, List, Dict, Tuple, Union

from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, mean_squared_error, r2_score
from xgboost import XGBClassifier, XGBRegressor
from loguru import logger

from config import (
    MODELS_DIR, YOLO_MODEL_PATH, YOLO_CONF_THRESHOLD,
    YOLO_IOU_THRESHOLD, CROWD_DENSITY_GRID,
)


CROWD_FEATURES = [
    "hour_of_day", "day_of_week", "month", "event_type",
    "venue_capacity", "estimated_crowd", "area_m2",
    "entry_points", "emergency_exits", "security_personnel",
    "ambient_temp_c", "occupancy_ratio", "density_per_m2",
]

DENSITY_LABELS = {0: "NORMAL", 1: "DENSE", 2: "OVERCROWDED", 3: "CRITICAL"}
MODEL_PATH     = MODELS_DIR / "crowd_model.pkl"


# ─────────────────────────────────────────────────────────────────────────────
# TABULAR MODEL
# ─────────────────────────────────────────────────────────────────────────────

class CrowdDensityModel:
    """
    Tabular model for crowd density classification and stampede risk regression.
    """

    def __init__(self):
        self.clf = XGBClassifier(
            n_estimators=250, max_depth=7, learning_rate=0.06,
            subsample=0.8, colsample_bytree=0.8,
            use_label_encoder=False, eval_metric="mlogloss",
            random_state=42,
        )
        self.reg = XGBRegressor(
            n_estimators=250, max_depth=6, learning_rate=0.06,
            subsample=0.8, colsample_bytree=0.8,
            random_state=42,
        )
        self.scaler     = StandardScaler()
        self.is_trained = False

    def train(self, df: pd.DataFrame) -> dict:
        X  = df[CROWD_FEATURES].copy()
        yc = df["crowd_density_level"].values
        yr = df["stampede_risk"].values
        X  = self._engineer_features(X)

        X_train, X_test, yc_tr, yc_te, yr_tr, yr_te = train_test_split(
            X, yc, yr, test_size=0.20, stratify=yc, random_state=42
        )
        X_tr_sc = self.scaler.fit_transform(X_train)
        X_te_sc = self.scaler.transform(X_test)

        self.clf.fit(X_tr_sc, yc_tr, eval_set=[(X_te_sc, yc_te)], verbose=False)
        self.reg.fit(X_tr_sc, yr_tr, eval_set=[(X_te_sc, yr_te)], verbose=False)

        yc_pred = self.clf.predict(X_te_sc)
        yr_pred = self.reg.predict(X_te_sc)

        metrics = {
            "density_report": classification_report(yc_te, yc_pred, output_dict=True),
            "stampede_rmse":  round(np.sqrt(mean_squared_error(yr_te, yr_pred)), 4),
            "stampede_r2":    round(r2_score(yr_te, yr_pred), 4),
            "confusion_matrix": confusion_matrix(yc_te, yc_pred).tolist(),
        }
        self.is_trained = True
        logger.success(f"Crowd model trained | RMSE={metrics['stampede_rmse']:.4f}")
        return metrics

    def predict(self, features: dict) -> dict:
        if not self.is_trained:
            raise RuntimeError("Model not trained.")
        row    = pd.DataFrame([features])[CROWD_FEATURES]
        row    = self._engineer_features(row)
        row_sc = self.scaler.transform(row)

        cls      = int(self.clf.predict(row_sc)[0])
        proba    = self.clf.predict_proba(row_sc)[0]
        stamp_risk = float(self.reg.predict(row_sc)[0])
        stamp_risk = max(0.0, min(1.0, stamp_risk))

        return {
            "density_level":   cls,
            "density_label":   DENSITY_LABELS[cls],
            "class_proba":     {DENSITY_LABELS[i]: round(float(p), 4) for i, p in enumerate(proba)},
            "stampede_risk":   round(stamp_risk, 4),
            "alert_required":  cls >= 2 or stamp_risk >= 0.60,
            "recommended_action": self._action(cls, stamp_risk),
        }

    def save(self):
        joblib.dump({"clf": self.clf, "reg": self.reg, "scaler": self.scaler}, MODEL_PATH)
        logger.success(f"Crowd model saved → {MODEL_PATH}")

    def load(self):
        data = joblib.load(MODEL_PATH)
        self.clf = data["clf"]; self.reg = data["reg"]
        self.scaler = data["scaler"]; self.is_trained = True
        logger.info("Crowd model loaded.")

    @staticmethod
    def _engineer_features(X: pd.DataFrame) -> pd.DataFrame:
        X = X.copy()
        X["crowd_per_exit"]   = X["estimated_crowd"] / (X["emergency_exits"] + 1)
        X["crowd_per_entry"]  = X["estimated_crowd"] / (X["entry_points"] + 1)
        X["security_ratio"]   = X["security_personnel"] / (X["estimated_crowd"] + 1)
        X["capacity_gap"]     = X["venue_capacity"] - X["estimated_crowd"]
        X["hour_sin"]         = np.sin(2 * np.pi * X["hour_of_day"] / 24)
        X["hour_cos"]         = np.cos(2 * np.pi * X["hour_of_day"] / 24)
        return X

    @staticmethod
    def _action(cls: int, risk: float) -> str:
        if cls == 3 or risk >= 0.80:
            return "EVACUATE IMMEDIATELY - Deploy all security, open all exits"
        if cls == 2 or risk >= 0.60:
            return "CONTROL ENTRY - Stop admissions, increase security, monitor exits"
        if cls == 1:
            return "MONITOR CLOSELY - Additional security advisable"
        return "NORMAL OPERATIONS"


# ─────────────────────────────────────────────────────────────────────────────
# COMPUTER VISION MODULE – YOLOv8 Crowd Counting
# ─────────────────────────────────────────────────────────────────────────────

class CrowdVisionAnalyzer:
    """
    YOLOv8-based people detection and crowd density analysis.
    Works on images, video frames, and RTSP streams.
    """

    def __init__(self):
        self.model      = None
        self.is_loaded  = False

    def load_model(self):
        """Load YOLOv8 model. Falls back to yolov8n if custom not found."""
        try:
            from ultralytics import YOLO
            model_path = YOLO_MODEL_PATH if Path(YOLO_MODEL_PATH).exists() else "yolov8n.pt"
            self.model     = YOLO(model_path)
            self.is_loaded = True
            logger.info(f"YOLO model loaded from: {model_path}")
        except Exception as e:
            logger.error(f"YOLO load failed: {e}")
            self.is_loaded = False

    def analyze_image(
        self,
        image: np.ndarray,
        return_annotated: bool = False,
    ) -> dict:
        """
        Detect and count people in image.
        Args:
            image: BGR numpy array (H, W, 3)
            return_annotated: if True, returns annotated image
        Returns:
            count, density_map, bounding_boxes, risk_level
        """
        if not self.is_loaded:
            # Fallback: simple pixel-based heuristic
            return self._fallback_analysis(image)

        results = self.model(
            image,
            conf=YOLO_CONF_THRESHOLD,
            iou=YOLO_IOU_THRESHOLD,
            classes=[0],           # class 0 = person
            verbose=False,
        )

        detections = results[0].boxes
        count      = len(detections)
        bboxes     = detections.xyxy.cpu().numpy().tolist() if count > 0 else []
        confidences = detections.conf.cpu().numpy().tolist() if count > 0 else []

        h, w = image.shape[:2]
        density_map   = self._compute_density_map(bboxes, h, w)
        risk_level    = self._density_to_risk(count, h * w)
        zones         = self._identify_hotspots(density_map)

        annotated = None
        if return_annotated:
            annotated = self._draw_annotations(image.copy(), bboxes, confidences, density_map)

        return {
            "people_count":   count,
            "density_map":    density_map.tolist(),
            "bounding_boxes": [{"x1": b[0], "y1": b[1], "x2": b[2], "y2": b[3]} for b in bboxes],
            "risk_level":     risk_level,
            "hotspot_zones":  zones,
            "crowd_per_sqm":  round(count / max(h * w / 10000, 1), 2),
            "annotated_image": annotated,
        }

    def analyze_frame_stream(
        self,
        frame_generator,
        callback=None,
        sample_every: int = 5,
    ):
        """
        Analyze a video stream frame by frame.
        frame_generator: yields BGR numpy arrays
        callback: optional function called with each result dict
        sample_every: analyze every Nth frame (performance)
        """
        frame_idx = 0
        results   = []
        for frame in frame_generator:
            frame_idx += 1
            if frame_idx % sample_every != 0:
                continue
            result = self.analyze_image(frame)
            result["frame_idx"] = frame_idx
            results.append(result)
            if callback:
                callback(result)
        return results

    # ── Density Map ───────────────────────────────────────────────────────────

    @staticmethod
    def _compute_density_map(
        bboxes: List,
        img_h: int,
        img_w: int,
        grid: int = CROWD_DENSITY_GRID,
    ) -> np.ndarray:
        """Returns an (grid x grid) count matrix."""
        density = np.zeros((grid, grid), dtype=np.float32)
        if not bboxes:
            return density
        cell_h = img_h / grid
        cell_w = img_w / grid
        for box in bboxes:
            cx = (box[0] + box[2]) / 2
            cy = (box[1] + box[3]) / 2
            gi = min(int(cy / cell_h), grid - 1)
            gj = min(int(cx / cell_w), grid - 1)
            density[gi, gj] += 1
        # Gaussian blur for smooth heatmap
        if density.max() > 0:
            density = cv2.GaussianBlur(density, (3, 3), 0)
        return density

    @staticmethod
    def _identify_hotspots(density_map: np.ndarray, threshold: float = 0.5) -> List[Dict]:
        """Return grid cells exceeding threshold * max density."""
        if density_map.max() == 0:
            return []
        norm  = density_map / density_map.max()
        zones = []
        rows, cols = np.where(norm >= threshold)
        for r, c in zip(rows, cols):
            zones.append({
                "grid_row": int(r), "grid_col": int(c),
                "density":  round(float(density_map[r, c]), 2),
                "relative_density": round(float(norm[r, c]), 4),
            })
        return sorted(zones, key=lambda x: -x["density"])

    @staticmethod
    def _density_to_risk(count: int, area_px: int) -> str:
        """Rough density per 100px² to risk level."""
        density = count / max(area_px / 10000, 1)
        if density > 4.0:   return "CRITICAL"
        if density > 2.5:   return "HIGH"
        if density > 1.0:   return "MEDIUM"
        return "LOW"

    @staticmethod
    def _fallback_analysis(image: np.ndarray) -> dict:
        """Simple motion/edge heuristic when YOLO unavailable."""
        gray    = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (21, 21), 0)
        edges   = cv2.Canny(blurred, 50, 150)
        density = np.count_nonzero(edges) / edges.size
        count   = int(density * 500)
        return {
            "people_count":   count,
            "density_map":    np.zeros((CROWD_DENSITY_GRID, CROWD_DENSITY_GRID)).tolist(),
            "bounding_boxes": [],
            "risk_level":     "UNKNOWN",
            "hotspot_zones":  [],
            "method":         "fallback_heuristic",
        }

    @staticmethod
    def _draw_annotations(
        image: np.ndarray,
        bboxes: List,
        confidences: List,
        density_map: np.ndarray,
    ) -> np.ndarray:
        """Draw bounding boxes and density overlay on image."""
        colors = {
            "box":    (0, 255, 0),
            "text":   (255, 255, 255),
            "bg":     (0, 150, 0),
        }
        for i, box in enumerate(bboxes):
            x1, y1, x2, y2 = [int(c) for c in box]
            conf = confidences[i] if i < len(confidences) else 0.0
            cv2.rectangle(image, (x1, y1), (x2, y2), colors["box"], 2)
            label = f"{conf:.2f}"
            cv2.putText(image, label, (x1, y1 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.4, colors["text"], 1)

        # Overlay heatmap
        h, w = image.shape[:2]
        hmap  = cv2.resize(density_map, (w, h))
        if hmap.max() > 0:
            hmap_norm = (hmap / hmap.max() * 255).astype(np.uint8)
            hmap_color = cv2.applyColorMap(hmap_norm, cv2.COLORMAP_JET)
            image = cv2.addWeighted(image, 0.7, hmap_color, 0.3, 0)

        cv2.putText(image, f"Count: {len(bboxes)}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)
        return image
