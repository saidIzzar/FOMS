from sqlalchemy.orm import Session
from app.models.database_models import Machine
from app.schemas import LayoutResponse
from app.core.machine_catalog import MachineZone

class LayoutOptimizerService:
    """
    Factory Layout Optimizer.
    
    Groups machines into zones based on tonnage:
    - HEAVY: >= 380T (large molds, high force)
    - MEDIUM: 160T - 380T (standard production)
    - LIGHT: < 160T (small precision parts)
    
    Recommendations based on workflow and maintenance access.
    """
    
    @staticmethod
    def optimize_layout(db: Session, branch_id: int = None) -> LayoutResponse:
        """Generate optimized factory layout"""
        
        query = db.query(MachineDB).filter(MachineDB.is_active == True)
        if branch_id:
            query = query.filter(MachineDB.branch_id == branch_id)
        
        machines = query.all()
        
        zones = {
            "heavy": [],
            "medium": [],
            "light": []
        }
        
        recommendations = []
        
        for machine in machines:
            spec = machine.spec
            if not spec:
                continue
            
            machine_info = {
                "machine_code": machine.machine_code,
                "tonnage": spec.tonnage,
                "status": machine.status,
                "location": f"Zone {spec.machine_class}"
            }
            
            # Categorize by zone
            if spec.tonnage >= 380:
                zones["heavy"].append(machine_info)
            elif spec.tonnage >= 160:
                zones["medium"].append(machine_info)
            else:
                zones["light"].append(machine_info)
        
        # Generate recommendations
        if zones["heavy"]:
            recommendations.append(
                f"Install heavy machines (>=380T) near loading dock for large mold handling"
            )
        if zones["medium"]:
            recommendations.append(
                f"Position medium machines (160-380T) in central production area"
            )
        if zones["light"]:
            recommendations.append(
                f"Place light machines (<160T) nearest to QC station for quick checks"
            )
        
        # Check workflow
        if zones["light"] and zones["heavy"]:
            recommendations.append(
                "Create clear aisle between light and heavy zones for forklift access"
            )
        
        # Count total
        total = len(zones["heavy"]) + len(zones["medium"]) + len(zones["light"])
        recommendations.append(f"Total production capacity: {total} machines")
        
        # Add efficiency recommendations
        for zone, machines_list in zones.items():
            if machines_list:
                active = sum(1 for m in machines_list if m["status"] == "running")
                total_zone = len(machines_list)
                if total_zone > 0:
                    utilization = active / total_zone * 100
                    recommendations.append(
                        f"{zone.upper()} zone utilization: {utilization:.0f}% ({active}/{total_zone} running)"
                    )
        
        return LayoutResponse(
            zones={k: len(v) for k, v in zones.items()},
            recommendations=recommendations
        )
    
    @staticmethod
    def get_zone_distribution(db: Session, branch_id: int = None) -> dict:
        """Get distribution of machines across zones"""
        
        layout = LayoutOptimizerService.optimize_layout(db, branch_id)
        
        return {
            "zones": layout.zones,
            "recommendations": layout.recommendations
        }
    
    @staticmethod
    def suggest_zone_reassignment(db: Session, machine_id: int, target_zone: str) -> dict:
        """Suggest if a machine should be moved to a different zone"""
        
        machine = db.query(MachineDB).filter(MachineDB.id == machine_id).first()
        if not machine or not machine.spec:
            return {"valid": False, "reason": "Machine not found"}
        
        current_zone = LayoutOptimizerService._get_machine_zone(machine.spec.tonnage)
        
        if target_zone == current_zone:
            return {
                "valid": True,
                "reason": "Machine already in optimal zone"
            }
        
        return {
            "valid": True,
            "current_zone": current_zone,
            "suggested_zone": target_zone,
            "reason": f"Machine {machine.machine_code} ({machine.spec.tonnage}T) should be in {target_zone} zone"
        }
    
    @staticmethod
    def _get_machine_zone(tonnage: int) -> str:
        if tonnage >= 380:
            return "heavy"
        elif tonnage >= 160:
            return "medium"
        else:
            return "light"