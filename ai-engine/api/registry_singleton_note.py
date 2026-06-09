"""
SAJAG AI - Model Registry Singleton
=====================================
The ModelRegistry singleton `registry` lives in train_pipeline.py.
This file shows backend devs exactly how to import and use it.

HOW IT WORKS
------------
train_pipeline.py exposes a module-level singleton:

    registry = ModelRegistry()   ← bottom of train_pipeline.py

On FastAPI startup, prediction_api.py calls:

    registry.load_all()

After that, every endpoint calls:

    registry.get("flood").predict(...)

CORRECT IMPORT PATTERN
-----------------------
In any file inside the ai_engine package:

    from train_pipeline import registry

    # Check if loaded before using
    if registry.is_loaded("flood"):
        result = registry.get("flood").predict(features)

In the main Node.js/Express backend (calling via HTTP):

    POST http://localhost:8001/predict/flood
    POST http://localhost:8001/predict/landslide
    POST http://localhost:8001/predict/accident
    POST http://localhost:8001/predict/crowd
    POST http://localhost:8001/predict/priority
    POST http://localhost:8001/incident/analyse
    POST http://localhost:8001/heatmap/generate
    POST http://localhost:8001/routes/safe
    POST http://localhost:8001/dispatch/recommend
    POST http://localhost:8001/dispatch/optimise

DO NOT import registry across processes — it is in-memory only.
The Node backend should always call the FastAPI HTTP endpoints.

AVAILABLE MODELS KEY
---------------------
"flood"     → FloodRiskModel       (flood_model.py)
"landslide" → LandslideRiskModel   (landslide_model.py)
"accident"  → AccidentHotspotModel (accident_model.py)
"crowd"     → CrowdDensityModel    (crowd_model.py)
"priority"  → RescuePriorityModel  (priority_model.py)

STARTUP SEQUENCE
-----------------
1. Run: python train_pipeline.py          # generates data + trains + saves .pkl files
2. Run: uvicorn api.prediction_api:app --host 0.0.0.0 --port 8001
3. On startup, prediction_api.py calls registry.load_all() → loads .pkl files
4. Node.js backend hits http://localhost:8001/health to confirm models are ready

DOCKER NOTE
-----------
If running in Docker, train_pipeline.py should run as an init container
or entrypoint script BEFORE the FastAPI server starts, so .pkl files exist.

Dockerfile entrypoint example:
    CMD ["sh", "-c", "python train_pipeline.py && uvicorn api.prediction_api:app --host 0.0.0.0 --port 8001"]
"""

# Nothing to import here — this file is documentation only.
# The actual singleton is at the bottom of train_pipeline.py:
#
#   registry = ModelRegistry()
#
# That line runs once when the module is first imported, giving a true singleton.
