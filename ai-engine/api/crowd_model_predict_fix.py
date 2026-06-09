"""
SAJAG AI - CrowdDensityModel.predict() PATCH
============================================
The existing crowd_model.py predict() method is functionally correct but
its return keys don't match the API schema expected by the frontend.

PROBLEM: current returns {"density_level", "density_label", "stampede_risk", ...}
but is missing "status" wrapper and "stampede_risk_level" expected by CrowdPredictionResponse.

FIX: Drop-in replacement for the predict() method.
Copy this method into models/crowd_model.py replacing the existing predict().

OR — the cleaner way — the prediction_api.py endpoint wraps it:
"""

# ── Option A: Patch predict() inside crowd_model.py ───────────────────────────
# Replace the existing predict() body with this:

PREDICT_METHOD_REPLACEMENT = '''
    def predict(self, features: dict) -> dict:
        if not self.is_trained:
            raise RuntimeError("Model not trained. Call train() or load() first.")

        row    = pd.DataFrame([features])[CROWD_FEATURES]
        row    = self._engineer_features(row)
        row_sc = self.scaler.transform(row)

        cls_proba   = self.clf.predict_proba(row_sc)[0]
        cls_pred    = int(self.clf.predict(row_sc)[0])
        stamp_risk  = float(np.clip(self.reg.predict(row_sc)[0], 0, 1))

        alerts = self._generate_alerts(cls_pred, stamp_risk, features)

        return {
            # ── keys required by CrowdPredictionResponse schema ──
            "density_level":         cls_pred,
            "density_label":         DENSITY_LABELS[cls_pred],
            "stampede_risk":         round(stamp_risk, 4),
            "stampede_risk_level":   self._risk_level(stamp_risk),   # ← was missing
            "class_probabilities":   {
                DENSITY_LABELS[i]: round(float(p), 4)
                for i, p in enumerate(cls_proba)
            },
            "recommended_action":    self._action(cls_pred, stamp_risk),
            "alerts":                alerts,
        }
'''

# ── Option B (preferred): Wrap in prediction_api.py endpoint ─────────────────
# Replace the /predict/crowd endpoint body with:

ENDPOINT_WRAPPER = '''
@app.post("/predict/crowd", response_model=None)
async def predict_crowd(req: CrowdAnalysisRequest):
    if not registry.is_loaded("crowd"):
        raise HTTPException(503, "Crowd model not loaded")
    try:
        raw = registry.get("crowd").predict(req.model_dump())
        # Ensure stampede_risk_level present (backfill if old model version)
        if "stampede_risk_level" not in raw:
            score = raw.get("stampede_risk", 0)
            if score >= 0.80:   raw["stampede_risk_level"] = "CRITICAL"
            elif score >= 0.60: raw["stampede_risk_level"] = "HIGH"
            elif score >= 0.35: raw["stampede_risk_level"] = "MEDIUM"
            else:               raw["stampede_risk_level"] = "LOW"
        return {"status": "success", "prediction": raw}
    except Exception as e:
        raise HTTPException(500, str(e))
'''

# ── Minimal standalone helper (import anywhere) ───────────────────────────────

def normalize_crowd_prediction(raw: dict) -> dict:
    """
    Normalizes crowd model output to match CrowdPredictionResponse.
    Call this anywhere you use crowd model output outside the API.

    Usage:
        raw = crowd_model.predict(features)
        normalized = normalize_crowd_prediction(raw)
    """
    if "stampede_risk_level" not in raw:
        score = raw.get("stampede_risk", 0)
        if score >= 0.80:   raw["stampede_risk_level"] = "CRITICAL"
        elif score >= 0.60: raw["stampede_risk_level"] = "HIGH"
        elif score >= 0.35: raw["stampede_risk_level"] = "MEDIUM"
        else:               raw["stampede_risk_level"] = "LOW"

    # ensure class_probabilities key (not class_proba)
    if "class_proba" in raw and "class_probabilities" not in raw:
        raw["class_probabilities"] = raw.pop("class_proba")

    return raw
