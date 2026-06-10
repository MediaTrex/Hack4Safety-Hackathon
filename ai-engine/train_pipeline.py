"""
SAJAG AI - Model Registry & Training Pipeline
Single entrypoint to train, evaluate, save, and load all models.
Run: python train_pipeline.py
"""

import sys
import json
import time
from pathlib import Path
from loguru import logger

# ── Setup logging ─────────────────────────────────────────────────────────────
logger.remove()
logger.add(sys.stdout, colorize=True,
           format="<green>{time:HH:mm:ss}</green> | <level>{level:<8}</level> | {message}")
logger.add("logs/training.log", rotation="10 MB", retention="30 days")


def train_all_models():
    """Run the full training pipeline for all SAJAG AI models."""

    logger.info("=" * 60)
    logger.info("SAJAG AI – Full ML Training Pipeline")
    logger.info("=" * 60)
    t_start = time.time()

    # ── 1. Generate Datasets ─────────────────────────────────────────────────
    logger.info("STEP 1/6 – Generating synthetic training datasets...")
    from data.data_generator import generate_all
    datasets = generate_all(save=True)
    logger.success(f"Datasets generated: {list(datasets.keys())}")

    results = {}

    # ── 2. Flood Model ────────────────────────────────────────────────────────
    logger.info("STEP 2/6 – Training Flood Risk Model...")
    t = time.time()
    from models.flood_model import FloodRiskModel
    flood_model = FloodRiskModel()
    flood_metrics = flood_model.train(datasets["flood"])
    flood_model.save()
    results["flood"] = {
        "roc_auc": flood_metrics["roc_auc"],
        "avg_precision": flood_metrics["avg_precision"],
        "time_sec": round(time.time() - t, 1),
    }
    logger.success(f"Flood model ✓ | AUC={flood_metrics['roc_auc']}")

    # ── 3. Landslide Model ────────────────────────────────────────────────────
    logger.info("STEP 3/6 – Training Landslide Risk Model...")
    t = time.time()
    from models.landslide_model import LandslideRiskModel
    ls_model = LandslideRiskModel()
    ls_metrics = ls_model.train(datasets["landslide"])
    ls_model.save()
    results["landslide"] = {
        "roc_auc": ls_metrics["roc_auc"],
        "avg_precision": ls_metrics["avg_precision"],
        "time_sec": round(time.time() - t, 1),
    }
    logger.success(f"Landslide model ✓ | AUC={ls_metrics['roc_auc']}")

    # ── 4. Accident Model ─────────────────────────────────────────────────────
    logger.info("STEP 4/6 – Training Accident Hotspot Model...")
    t = time.time()
    from models.accident_model import AccidentHotspotModel
    acc_model = AccidentHotspotModel()
    acc_metrics = acc_model.train(datasets["accident"])
    acc_model.save()
    results["accident"] = {
        "roc_auc": acc_metrics["roc_auc"],
        "f1_score": acc_metrics["f1_score"],
        "time_sec": round(time.time() - t, 1),
    }
    logger.success(f"Accident model ✓ | AUC={acc_metrics['roc_auc']}")

    # ── 5. Crowd Model ────────────────────────────────────────────────────────
    logger.info("STEP 5/6 – Training Crowd Density Model...")
    t = time.time()
    from models.crowd_model import CrowdDensityModel
    crowd_model = CrowdDensityModel()
    crowd_metrics = crowd_model.train(datasets["crowd"])
    crowd_model.save()
    results["crowd"] = {
        "stampede_rmse": crowd_metrics["stampede_rmse"],
        "stampede_r2":   crowd_metrics["stampede_r2"],
        "time_sec": round(time.time() - t, 1),
    }
    logger.success(f"Crowd model ✓ | RMSE={crowd_metrics['stampede_rmse']}")

    # ── 6. Priority Model ─────────────────────────────────────────────────────
    logger.info("STEP 6/6 – Training Rescue Priority Model...")
    t = time.time()
    from models.priority_model import RescuePriorityModel
    prio_model = RescuePriorityModel()
    prio_metrics = prio_model.train(datasets["priority"])
    prio_model.save()
    results["priority"] = {
        "clf_f1": prio_metrics["classifier"]["cv_f1"],
        "reg_rmse": prio_metrics["regressor"]["rmse"],
        "reg_r2":   prio_metrics["regressor"]["r2"],
        "time_sec": round(time.time() - t, 1),
    }
    logger.success(f"Priority model ✓ | F1={prio_metrics['classifier']['cv_f1']}")

    # ── Summary ───────────────────────────────────────────────────────────────
    total_time = round(time.time() - t_start, 1)
    results["total_time_sec"] = total_time

    logger.info("=" * 60)
    logger.info("TRAINING COMPLETE – Summary")
    logger.info("=" * 60)
    for name, m in results.items():
        if name == "total_time_sec":
            continue
        logger.info(f"  {name:12s}: {m}")
    logger.info(f"  Total time: {total_time}s")

    # Save metrics report
    report_path = Path("logs/training_report.json")
    with open(report_path, "w") as f:
        json.dump(results, f, indent=2)
    logger.success(f"Metrics saved → {report_path}")

    return results


class ModelRegistry:
    """
    Lazy-loading singleton registry for all trained models.
    Access via ModelRegistry.get()
    """
    _instance = None
    _models   = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def load_all(self):
        """Load all saved models from disk."""
        from models.flood_model    import FloodRiskModel
        from models.landslide_model import LandslideRiskModel
        from models.accident_model  import AccidentHotspotModel
        from models.crowd_model     import CrowdDensityModel
        from models.priority_model  import RescuePriorityModel

        loaders = {
            "flood":     FloodRiskModel,
            "landslide": LandslideRiskModel,
            "accident":  AccidentHotspotModel,
            "crowd":     CrowdDensityModel,
            "priority":  RescuePriorityModel,
        }
        for name, cls_ in loaders.items():
            try:
                model = cls_()
                model.load()
                self._models[name] = model
                logger.info(f"Loaded: {name}")
            except Exception as e:
                logger.warning(f"Could not load {name} model: {e}")

    def get(self, name: str):
        if name not in self._models:
            raise KeyError(f"Model '{name}' not loaded. Call load_all() first.")
        return self._models[name]

    def is_loaded(self, name: str) -> bool:
        return name in self._models

    @property
    def available_models(self) -> list:
        return list(self._models.keys())


# Global registry instance
registry = ModelRegistry()


if __name__ == "__main__":
    train_all_models()
