"""
SAJAG AI - Configuration Module
Centralizes all constants, model paths, and environment settings.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models" / "saved"
DATA_DIR   = BASE_DIR / "data"
LOGS_DIR   = BASE_DIR / "logs"

for d in [MODELS_DIR, DATA_DIR, LOGS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ─── Database ─────────────────────────────────────────────────────────────────
MONGO_URI  = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB   = os.getenv("MONGO_DB", "sajag_ai")

# ─── Nepal Geographic Boundaries ──────────────────────────────────────────────
NEPAL_BOUNDS = {
    "lat_min": 26.347,
    "lat_max": 30.447,
    "lon_min": 80.058,
    "lon_max": 88.201,
}

# ─── High-risk districts (historical data) ────────────────────────────────────
HIGH_RISK_DISTRICTS = [
    "Sindhupalchok", "Kaski", "Myagdi", "Parbat",
    "Syangja", "Palpa", "Rupandehi", "Nawalparasi",
    "Chitwan", "Makwanpur", "Dhading", "Nuwakot",
    "Rasuwa", "Dolakha", "Solukhumbu", "Taplejung",
]

# ─── Model hyperparameters ────────────────────────────────────────────────────
FLOOD_RF_PARAMS = {
    "n_estimators": 300,
    "max_depth": 12,
    "min_samples_split": 4,
    "min_samples_leaf": 2,
    "random_state": 42,
    "n_jobs": -1,
    "class_weight": "balanced",
}

FLOOD_XGB_PARAMS = {
    "n_estimators": 300,
    "max_depth": 8,
    "learning_rate": 0.05,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "scale_pos_weight": 3,
    "use_label_encoder": False,
    "eval_metric": "logloss",
    "random_state": 42,
    "n_jobs": -1,
}

ACCIDENT_RF_PARAMS = {
    "n_estimators": 250,
    "max_depth": 10,
    "min_samples_split": 5,
    "random_state": 42,
    "n_jobs": -1,
    "class_weight": "balanced",
}

LANDSLIDE_XGB_PARAMS = {
    "n_estimators": 350,
    "max_depth": 9,
    "learning_rate": 0.04,
    "subsample": 0.75,
    "colsample_bytree": 0.75,
    "scale_pos_weight": 4,
    "use_label_encoder": False,
    "eval_metric": "logloss",
    "random_state": 42,
}

# ─── Risk Thresholds ──────────────────────────────────────────────────────────
RISK_THRESHOLDS = {
    "LOW":    0.0,
    "MEDIUM": 0.35,
    "HIGH":   0.60,
    "CRITICAL": 0.80,
}

# ─── Priority Scoring Weights ─────────────────────────────────────────────────
PRIORITY_WEIGHTS = {
    "disaster_type":         0.30,
    "people_count":          0.25,
    "vulnerability_score":   0.20,
    "resource_availability": 0.15,
    "time_elapsed":          0.10,
}

DISASTER_BASE_SCORES = {
    "flood":           0.85,
    "landslide":       0.90,
    "earthquake":      0.95,
    "fire":            0.80,
    "accident":        0.70,
    "crowd_incident":  0.65,
    "missing_person":  0.55,
    "infrastructure":  0.60,
    "other":           0.50,
}

# ─── YOLOv8 / Computer Vision ─────────────────────────────────────────────────
YOLO_MODEL_PATH     = str(MODELS_DIR / "yolov8_crowd.pt")
YOLO_CONF_THRESHOLD = 0.45
YOLO_IOU_THRESHOLD  = 0.45
CROWD_DENSITY_GRID  = 8           # NxN grid for crowd density heatmap

# ─── API ──────────────────────────────────────────────────────────────────────
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", 8001))
API_WORKERS = int(os.getenv("API_WORKERS", 4))
