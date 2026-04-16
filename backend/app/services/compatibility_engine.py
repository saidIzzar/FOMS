"""
FOMS Mold-Machine Compatibility Engine
Industrial-grade compatibility scoring with physical constraints
"""

from typing import Optional
from sqlalchemy.orm import Session
from app.models.database_models import Machine, Mold


TONNAGE_SAFETY_FACTOR = 1.10
SCORE_WEIGHTS = {
    "tonnage": 40,
    "physical_fit": 30,
    "weight": 10,
    "shot_volume": 10,
    "efficiency": 10
}


class CompatibilityResult:
    def __init__(
        self,
        machine_id: int,
        machine_code: str,
        score: int,
        status: str,
        reasons: list[str],
        tonnage_score: int = 0,
        fit_score: int = 0,
        weight_score: int = 0,
        shot_score: int = 0,
        efficiency_score: int = 0
    ):
        self.machine_id = machine_id
        self.machine_code = machine_code
        self.score = score
        self.status = status
        self.reasons = reasons
        self.tonnage_score = tonnage_score
        self.fit_score = fit_score
        self.weight_score = weight_score
        self.shot_score = shot_score
        self.efficiency_score = efficiency_score

    def to_dict(self):
        return {
            "machine_id": self.machine_id,
            "machine_code": self.machine_code,
            "score": self.score,
            "status": self.status,
            "reason": "; ".join(self.reasons),
            "details": {
                "tonnage_score": self.tonnage_score,
                "physical_fit_score": self.fit_score,
                "weight_score": self.weight_score,
                "shot_volume_score": self.shot_score,
                "efficiency_score": self.efficiency_score
            }
        }


class MoldCompatibilityEngine:
    """
    Industrial mold-machine compatibility engine.
    Uses physical constraints, not just tonnage.
    """

    @staticmethod
    def calculate_compatibility(machine: Machine, mold: Mold) -> CompatibilityResult:
        """
        Calculate compatibility score (0-100) between mold and machine.
        """
        reasons = []
        score = 0

        spec = machine.spec or {}
        machine_tonnage = spec.get("tonnage", 0)
        tie_bar_x = spec.get("tie_bar_distance_width", 0)
        tie_bar_y = spec.get("tie_bar_distance_height", 0)
        max_weight = spec.get("max_mold_weight", 99999)
        shot_capacity = spec.get("shot_volume_max", 9999)
        cycle_time = spec.get("ideal_cycle_time_sec", 999)
        max_height = spec.get("mold_thickness_max", 9999)
        min_height = spec.get("mold_thickness_min", 0)

        # 1. Tonnage check (40%)
        tonnage_score = 0
        mold_tonnage = mold.required_tonnage or 0

        if machine_tonnage > 0 and mold_tonnage > 0:
            ratio = machine_tonnage / mold_tonnage
            if ratio < TONNAGE_SAFETY_FACTOR:
                reasons.append(f"Tonnage unsafe: {machine_tonnage}T < {mold_tonnage}T × {TONNAGE_SAFETY_FACTOR}")
            elif ratio <= 1.3:
                tonnage_score = SCORE_WEIGHTS["tonnage"]
                reasons.append(f"Tonnage: {machine_tonnage}T ≥ {mold_tonnage}T (safe)")
            elif ratio <= 1.5:
                tonnage_score = int(SCORE_WEIGHTS["tonnage"] * 0.8)
                reasons.append(f"Tonnage: {machine_tonnage}T ok for {mold_tonnage}T")
            else:
                tonnage_score = int(SCORE_WEIGHTS["tonnage"] * 0.6)
                reasons.append(f"Tonnage: generous {machine_tonnage}T for {mold_tonnage}T")
        score += tonnage_score

        # 2. Physical fit (30%)
        fit_score = 0
        mold_length = mold.length_mm or 0
        mold_width = mold.width_mm or 0

        if mold_length <= tie_bar_x and mold_width <= tie_bar_y:
            fit_score = SCORE_WEIGHTS["physical_fit"]
            clearance_x = tie_bar_x - mold_length
            clearance_y = tie_bar_y - mold_width
            reasons.append(f"Fit: {clearance_x}mm×{clearance_y}mm clearance")
        else:
            if mold_length > tie_bar_x:
                reasons.append(f"Too wide: {mold_length}mm > {tie_bar_x}mm")
            if mold_width > tie_bar_y:
                reasons.append(f"Too tall: {mold_width}mm > {tie_bar_y}mm")
        score += fit_score

        # 3. Weight safety (10%)
        weight_score = 0
        mold_weight = mold.weight_kg or 0

        if mold_weight <= max_weight:
            margin = max_weight - mold_weight
            weight_score = SCORE_WEIGHTS["weight"]
            reasons.append(f"Weight: {mold_weight}kg ≤ {max_weight}kg ({margin}kg margin)")
        else:
            reasons.append(f"Weight too heavy: {mold_weight}kg > {max_weight}kg limit")
        score += weight_score

        # 4. Shot volume (10%)
        shot_score = 0
        mold_shot = mold.required_shot_volume or 0

        if mold_shot <= shot_capacity:
            shot_score = SCORE_WEIGHTS["shot_volume"]
            reasons.append(f"Shot: {mold_shot}cm³ ≤ {shot_capacity}cm³")
        else:
            reasons.append(f"Shot too large: {mold_shot}cm³ > {shot_capacity}cm³")
        score += shot_score

        # 5. Efficiency (10%)
        efficiency_score = 0
        status = machine.status or "unknown"

        if status == "running":
            efficiency_score += 5
            reasons.append("Machine: running")

        if cycle_time <= 12:
            efficiency_score += 5
            reasons.append(f"Cycle: {cycle_time}s (fast)")
        elif cycle_time <= 20:
            efficiency_score += 3
            reasons.append(f"Cycle: {cycle_time}s (normal)")
        else:
            reasons.append(f"Cycle: {cycle_time}s (slow)")
        score += efficiency_score

        # Determine status
        if score >= 80:
            status = "EXCELLENT_MATCH"
        elif score >= 60:
            status = "SAFE_MATCH"
        elif score >= 40:
            status = "MARGINAL"
        elif score > 0:
            status = "INCOMPATIBLE"
        else:
            status = "DANGER"

        return CompatibilityResult(
            machine_id=machine.id,
            machine_code=machine.machine_code,
            score=min(100, score),
            status=status,
            reasons=reasons,
            tonnage_score=tonnage_score,
            fit_score=fit_score,
            weight_score=weight_score,
            shot_score=shot_score,
            efficiency_score=efficiency_score
        )

    @staticmethod
    def find_best_machine(db: Session, mold_id: int, branch_id: int = None) -> dict:
        """
        Find the best machine for a mold with full analysis.
        """
        mold = db.query(Mold).filter(Mold.id == mold_id).first()
        if not mold:
            return {"error": "Mold not found"}

        query = db.query(Machine).filter(Machine.is_active == True)
        if branch_id:
            query = query.filter(Machine.branch_id == branch_id)

        machines = query.all()
        results = []

        for machine in machines:
            result = MoldCompatibilityEngine.calculate_compatibility(machine, mold)
            if result.score > 0:
                results.append(result)

        # Sort by score descending
        results.sort(key=lambda x: x.score, reverse=True)

        if not results:
            return {
                "mold_id": mold_id,
                "mold_code": mold.mold_code,
                "status": "NO_MATCH",
                "reason": "No compatible machine found",
                "best_machine": None,
                "alternatives": []
            }

        best = results[0]
        alternatives = [r.to_dict() for r in results[1:6] if r.score > 20]

        return {
            "mold_id": mold_id,
            "mold_code": mold.mold_code,
            "best_machine": best.to_dict(),
            "alternatives": alternatives,
            "total_machines_checked": len(machines),
            "compatible_count": len(results)
        }

    @staticmethod
    def check_all_machines(db: Session, mold_id: int) -> list[dict]:
        """
        Test mold against all machines, return ranked list.
        """
        mold = db.query(Mold).filter(Mold.id == mold_id).first()
        if not mold:
            return []

        machines = db.query(Machine).filter(Machine.is_active == True).all()
        results = []

        for machine in machines:
            result = MoldCompatibilityEngine.calculate_compatibility(machine, machine)
            results.append(result.to_dict())

        results.sort(key=lambda x: x["score"], reverse=True)
        return results


class MachineSelector:
    """
    Smart machine selection with multiple strategies.
    """

    @staticmethod
    def select_optimal(db: Session, mold_id: int, strategy: str = "score") -> dict:
        """
        Select optimal machine using different strategies.
        - score: Highest compatibility score
        - smallest: Smallest capable machine
        - fastest: Fastest cycle time
        - balanced: Score + efficiency
        """
        mold = db.query(Mold).filter(Mold.id == mold_id).first()
        if not mold:
            return {"error": "Mold not found"}

        machines = db.query(Machine).filter(Machine.is_active == True).all()
        results = []

        machine_specs = machine.spec if hasattr(machine, 'spec') else {}

        for machine in machines:
            comp = MoldCompatibilityEngine.calculate_compatibility(machine, mold)

            if strategy == "score":
                priority = comp.score
            elif strategy == "smallest":
                priority = -1 * (machine_specs.get("tonnage", 999))
            elif strategy == "fastest":
                priority = -1 * (machine_specs.get("ideal_cycle_time_sec", 999))
            elif strategy == "balanced":
                priority = comp.score - machine_specs.get("tonnage", 0) / 10
            else:
                priority = comp.score

            results.append({
                "priority": priority,
                "compatibility": comp,
                "machine": machine
            })

        results.sort(key=lambda x: x["priority"], reverse=True)
        best = results[0]["compatibility"]

        return best.to_dict()


def calculate_compatibility_score(machine_tonnage: int, mold_tonnage: int) -> int:
    """Quick compatibility check for API calls."""
    if machine_tonnage < mold_tonnage * TONNAGE_SAFETY_FACTOR:
        return 0

    ratio = machine_tonnage / mold_tonnage
    if ratio <= 1.3:
        return 100
    elif ratio <= 1.5:
        return 80
    elif ratio <= 2.0:
        return 60
    else:
        return 40


def check_physical_fit(
    mold_length: float,
    mold_width: float,
    mold_height: float,
    tie_bar_x: float,
    tie_bar_y: float,
    min_height: float,
    max_height: float
) -> dict:
    """Quick physical fit check."""
    fits = mold_length <= tie_bar_x and mold_width <= tie_bar_y
    height_ok = min_height <= mold_height <= max_height

    return {
        "fits": fits and height_ok,
        "length_ok": mold_length <= tie_bar_x,
        "width_ok": mold_width <= tie_bar_y,
        "height_ok": height_ok,
        "clearance_x": tie_bar_x - mold_length,
        "clearance_y": tie_bar_y - mold_width
    }