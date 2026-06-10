"""
SAJAG AI - Team Recommendation Engine
Ranks and assigns optimal rescue teams to incidents
using multi-criteria decision analysis (MCDA).
"""

import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field, asdict
from loguru import logger
from geopy.distance import geodesic


# ─────────────────────────────────────────────────────────────────────────────
# DATA CLASSES
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class RescueTeam:
    team_id:          str
    name:             str
    lat:              float
    lon:              float
    status:           str           # AVAILABLE / BUSY / RETURNING / OFF_DUTY
    specialization:   List[str]     # e.g. ["flood", "search_rescue"]
    member_count:     int
    vehicle_type:     str           # "4WD", "BOAT", "HELICOPTER", "MOTORCYCLE"
    equipment:        List[str]
    success_rate:     float         # 0-1, historical
    avg_response_min: float         # historical average response time
    district:         str
    current_load:     int           # active missions


@dataclass
class TeamRecommendation:
    team:             RescueTeam
    score:            float         # composite suitability score 0-1
    rank:             int
    distance_km:      float
    eta_minutes:      float
    suitability_breakdown: Dict[str, float] = field(default_factory=dict)
    notes:            List[str]     = field(default_factory=list)

    def to_dict(self) -> dict:
        d = asdict(self)
        return d


# ─────────────────────────────────────────────────────────────────────────────
# RECOMMENDATION ENGINE
# ─────────────────────────────────────────────────────────────────────────────

class TeamRecommendationEngine:
    """
    Multi-criteria ranking of rescue teams for a given incident.
    Criteria:
        - Distance / ETA            (40%)
        - Disaster type match       (25%)
        - Team capability score     (20%)
        - Current availability      (15%)
    """

    CRITERIA_WEIGHTS = {
        "proximity":     0.40,
        "specialization": 0.25,
        "capability":    0.20,
        "availability":  0.15,
    }

    DISASTER_SPECIALIZATION_MAP = {
        "flood":          ["flood", "water_rescue", "boat"],
        "landslide":      ["search_rescue", "heavy_equipment", "mountaineering"],
        "earthquake":     ["search_rescue", "structural", "medical"],
        "fire":           ["firefighting", "rescue"],
        "accident":       ["medical", "rescue", "traffic"],
        "crowd_incident": ["crowd_control", "medical", "riot"],
        "missing_person": ["search_rescue", "k9", "mountaineering"],
        "infrastructure": ["engineering", "heavy_equipment"],
    }

    VEHICLE_TERRAIN_SCORE = {
        "HELICOPTER": {"mountain": 1.0, "flood": 0.9, "urban": 0.8, "remote": 1.0},
        "BOAT":       {"flood": 1.0, "mountain": 0.2, "urban": 0.4, "remote": 0.5},
        "4WD":        {"mountain": 0.9, "flood": 0.6, "urban": 0.7, "remote": 0.9},
        "MOTORCYCLE": {"urban": 0.9, "mountain": 0.5, "flood": 0.2, "remote": 0.6},
        "TRUCK":      {"urban": 0.8, "mountain": 0.5, "flood": 0.4, "remote": 0.7},
    }

    def recommend(
        self,
        incident: dict,
        teams: List[RescueTeam],
        top_n: int = 5,
    ) -> List[TeamRecommendation]:
        """
        Args:
            incident: {
                lat, lon, disaster_type,
                priority_score, people_count,
                terrain_type, accessibility
            }
            teams: list of RescueTeam objects
            top_n: how many to return
        Returns:
            list of TeamRecommendation sorted by score descending
        """
        available = [t for t in teams if t.status in ("AVAILABLE", "RETURNING")]
        if not available:
            logger.warning("No available teams found. Including BUSY teams.")
            available = teams

        scored: List[TeamRecommendation] = []
        for team in available:
            rec = self._score_team(team, incident)
            scored.append(rec)

        scored.sort(key=lambda r: r.score, reverse=True)
        for i, rec in enumerate(scored):
            rec.rank = i + 1

        logger.info(
            f"Team recommendation for {incident.get('disaster_type','?')} | "
            f"Top team: {scored[0].team.name if scored else 'None'}"
        )
        return scored[:top_n]

    def auto_assign(
        self,
        incident: dict,
        teams: List[RescueTeam],
        required_count: int = 1,
    ) -> Tuple[List[TeamRecommendation], str]:
        """
        Auto-assign top `required_count` teams and return assignment message.
        """
        recs = self.recommend(incident, teams, top_n=required_count * 3)
        assigned = recs[:required_count]
        msg = (
            f"AUTO-ASSIGNED {required_count} team(s) to "
            f"{incident.get('disaster_type','incident')} at "
            f"({incident.get('lat'):.4f}, {incident.get('lon'):.4f}): "
            + ", ".join(r.team.name for r in assigned)
        )
        logger.info(msg)
        return assigned, msg

    # ── Scoring ───────────────────────────────────────────────────────────────

    def _score_team(self, team: RescueTeam, incident: dict) -> TeamRecommendation:
        dist_km = geodesic(
            (team.lat, team.lon),
            (incident["lat"], incident["lon"])
        ).km

        # ETA based on vehicle type
        speed_kmh = self._vehicle_speed(team.vehicle_type)
        eta_min   = (dist_km / speed_kmh * 60) if speed_kmh > 0 else 9999

        breakdown = {}

        # 1. Proximity score (exponential decay)
        prox_score = np.exp(-0.05 * dist_km)
        breakdown["proximity"] = round(float(prox_score), 4)

        # 2. Specialization match
        req_skills = self.DISASTER_SPECIALIZATION_MAP.get(
            incident.get("disaster_type", "other"), []
        )
        if req_skills:
            matches = sum(1 for s in req_skills if s in team.specialization)
            spec_score = matches / len(req_skills)
        else:
            spec_score = 0.5
        breakdown["specialization"] = round(spec_score, 4)

        # 3. Capability score
        terrain    = incident.get("terrain_type", "urban")
        veh_score  = self.VEHICLE_TERRAIN_SCORE.get(
            team.vehicle_type, {}
        ).get(terrain, 0.5)
        cap_score  = (
            veh_score * 0.40 +
            team.success_rate * 0.40 +
            min(team.member_count / 20, 1.0) * 0.20
        )
        breakdown["capability"] = round(float(cap_score), 4)

        # 4. Availability score
        avail_score = 1.0 if team.status == "AVAILABLE" else 0.6
        avail_score *= max(0.1, 1.0 - team.current_load * 0.1)
        breakdown["availability"] = round(float(avail_score), 4)

        # Weighted composite
        composite = (
            self.CRITERIA_WEIGHTS["proximity"]      * breakdown["proximity"] +
            self.CRITERIA_WEIGHTS["specialization"] * breakdown["specialization"] +
            self.CRITERIA_WEIGHTS["capability"]     * breakdown["capability"] +
            self.CRITERIA_WEIGHTS["availability"]   * breakdown["availability"]
        )

        notes = []
        if dist_km > 50:  notes.append(f"⚠ Far: {dist_km:.1f} km away")
        if eta_min > 60:  notes.append(f"⚠ Long ETA: {eta_min:.0f} min")
        if spec_score == 0: notes.append("⚠ No specialization match")
        if spec_score == 1.0: notes.append("✓ Perfect specialization match")
        if team.success_rate >= 0.90: notes.append("✓ High success rate")

        return TeamRecommendation(
            team=team,
            score=round(float(composite), 4),
            rank=0,
            distance_km=round(dist_km, 2),
            eta_minutes=round(eta_min, 1),
            suitability_breakdown=breakdown,
            notes=notes,
        )

    @staticmethod
    def _vehicle_speed(vehicle_type: str) -> float:
        return {
            "HELICOPTER": 180,
            "4WD":        60,
            "BOAT":       40,
            "MOTORCYCLE": 70,
            "TRUCK":      50,
        }.get(vehicle_type, 50)


# ─────────────────────────────────────────────────────────────────────────────
# RESOURCE OPTIMISER
# ─────────────────────────────────────────────────────────────────────────────

class ResourceOptimiser:
    """
    Determines minimum resources required to handle a set of incidents
    without exceeding team capacity.
    """

    def optimise(
        self,
        incidents: List[dict],
        teams: List[RescueTeam],
    ) -> Dict:
        """
        Simple greedy assignment: highest priority incidents first.
        """
        available     = {t.team_id: t for t in teams if t.status == "AVAILABLE"}
        assignments   = {}
        unassigned    = []

        incidents_sorted = sorted(incidents,
                                  key=lambda i: i.get("priority_score", 0),
                                  reverse=True)

        engine = TeamRecommendationEngine()

        for inc in incidents_sorted:
            avail_list = list(available.values())
            if not avail_list:
                unassigned.append(inc)
                continue

            recs = engine.recommend(inc, avail_list, top_n=1)
            if not recs:
                unassigned.append(inc)
                continue

            best      = recs[0]
            tid       = best.team.team_id
            assignments[inc.get("incident_id", id(inc))] = {
                "team_id":      tid,
                "team_name":    best.team.name,
                "score":        best.score,
                "eta_minutes":  best.eta_minutes,
            }
            available[tid].current_load  += 1
            available[tid].status = "BUSY"
            del available[tid]

        return {
            "assignments":      assignments,
            "unassigned_count": len(unassigned),
            "unassigned":       [i.get("incident_id", "?") for i in unassigned],
            "utilisation":      round(len(assignments) / max(len(teams), 1), 4),
        }
