from sqlalchemy.orm import Session
from app.models.database_models import Machine, Mold
from app.schemas import CompatibilityRequest, CompatibilityResponse
from app.core.machine_catalog import MACHINE_SPECS_CATALOG

MOLD_WEIGHT_TO_FORCE_FACTOR = 9.81 / 1000
TONNAGE_SAFETY_MARGIN = 1.10
SHOT_VOLUME_SAFETY_MARGIN = 1.10


class CompatibilityService:
    """
    Industrial compatibility validation engine.
    Validates mold-machine combinations based on injection molding engineering constraints.
    """

    @staticmethod
    def validate_machine_mold(machine: Machine, mold: Mold, detailed: bool = False) -> list[str]:
        """
        Shared validation logic for machine-mold compatibility.
        
        Args:
            machine: Machine database model instance
            mold: Mold database model instance
            detailed: If True, return human-readable messages. If False, return compact codes.
            
        Returns:
            List of incompatibility reasons (empty if compatible)
        """
        reasons = []
        spec = machine.spec
        
        if not spec:
            if detailed:
                reasons.append("Machine specification not found")
            else:
                reasons.append("missing_spec")
            return reasons
        
        if detailed:
            reasons.extend(CompatibilityService._validate_detailed(spec, mold))
        else:
            reasons.extend(CompatibilityService._validate_compact(spec, mold))
        
        return reasons

    @staticmethod
    def _validate_compact(spec, mold) -> list[str]:
        """Compact validation - returns reason codes only"""
        reasons = []
        
        if mold.required_tonnage is None:
            reasons.append("missing_tonnage")
        elif spec.tonnage < mold.required_tonnage * TONNAGE_SAFETY_MARGIN:
            reasons.append("tonnage")
        
        if mold.length_mm is None:
            reasons.append("missing_length")
        elif mold.length_mm > spec.tie_bar_distance_width:
            reasons.append("width")
        
        if mold.width_mm is None:
            reasons.append("missing_width")
        elif mold.width_mm > spec.tie_bar_distance_height:
            reasons.append("height")
        
        if mold.required_shot_volume is None:
            reasons.append("missing_shot")
        elif spec.shot_volume_max < mold.required_shot_volume * SHOT_VOLUME_SAFETY_MARGIN:
            reasons.append("shot")
        
        if mold.weight_kg is None:
            reasons.append("missing_weight")
        else:
            mold_force_kn = mold.weight_kg * MOLD_WEIGHT_TO_FORCE_FACTOR
            if mold_force_kn > spec.ejector_force_kn:
                reasons.append("ejector")
        
        return reasons

    @staticmethod
    def _validate_detailed(spec, mold) -> list[str]:
        """Detailed validation - returns human-readable messages"""
        reasons = []
        
        if mold.required_tonnage is None:
            reasons.append("Mold missing required_tonnage specification")
        elif spec.tonnage < mold.required_tonnage * TONNAGE_SAFETY_MARGIN:
            required = mold.required_tonnage * TONNAGE_SAFETY_MARGIN
            reasons.append(f"Insufficient tonnage: machine {spec.tonnage}T < required {required:.0f}T")
        
        if mold.length_mm is None:
            reasons.append("Mold missing length_mm specification")
        elif mold.length_mm > spec.tie_bar_distance_width:
            reasons.append(f"Mold length {mold.length_mm}mm exceeds tie bar width {spec.tie_bar_distance_width}mm")
        
        if mold.width_mm is None:
            reasons.append("Mold missing width_mm specification")
        elif mold.width_mm > spec.tie_bar_distance_height:
            reasons.append(f"Mold width {mold.width_mm}mm exceeds tie bar height {spec.tie_bar_distance_height}mm")
        
        if mold.required_shot_volume is None:
            reasons.append("Mold missing required_shot_volume specification")
        elif spec.shot_volume_max < mold.required_shot_volume * SHOT_VOLUME_SAFETY_MARGIN:
            required = mold.required_shot_volume * SHOT_VOLUME_SAFETY_MARGIN
            reasons.append(f"Insufficient shot volume: {spec.shot_volume_max}cm³ < required {required:.0f}cm³")
        
        if mold.weight_kg is not None:
            mold_force_kn = mold.weight_kg * MOLD_WEIGHT_TO_FORCE_FACTOR
            if mold_force_kn > spec.ejector_force_kn:
                reasons.append(
                    f"Mold ejector force {mold_force_kn:.2f}kN exceeds capacity {spec.ejector_force_kn}kN"
                )
        
        return reasons

    @staticmethod
    def check_compatibility(db: Session, request: CompatibilityRequest) -> CompatibilityResponse:
        """Check if a machine can run a specific mold"""
        
        machine = db.query(Machine).filter(Machine.id == request.machine_id).first()
        mold = db.query(Mold).filter(Mold.id == request.mold_id).first()
        
        if not machine:
            return CompatibilityResponse(
                compatible=False,
                machine_code="",
                mold_code=getattr(request, 'mold_code', ""),
                reasons=["Machine not found"]
            )
        
        if not mold:
            return CompatibilityResponse(
                compatible=False,
                machine_code=machine.machine_code,
                mold_code="",
                reasons=["Mold not found"]
            )
        
        reasons = CompatibilityService.validate_machine_mold(machine, mold, detailed=True)
        
        return CompatibilityResponse(
            compatible=len(reasons) == 0,
            machine_code=machine.machine_code,
            mold_code=mold.mold_code,
            reasons=reasons
        )

    @staticmethod
    def find_compatible_machines(db: Session, mold_id: int, branch_id: int = None) -> list[dict]:
        """Find all machines compatible with a given mold"""
        mold = db.query(Mold).filter(Mold.id == mold_id).first()
        if not mold:
            return []

        query = db.query(Machine).filter(Machine.is_active == True)
        if branch_id:
            query = query.filter(Machine.branch_id == branch_id)

        machines = query.all()
        compatible = []

        for machine in machines:
            reasons = CompatibilityService.validate_machine_mold(machine, mold, detailed=False)

            if len(reasons) == 0:
                spec = machine.spec
                compatible.append({
                    "machine_id": machine.id,
                    "machine_code": machine.machine_code,
                    "tonnage": spec.tonnage if spec else 0,
                    "status": machine.status
                })

        return compatible