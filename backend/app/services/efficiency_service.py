from sqlalchemy.orm import Session
from app.models.database_models import Machine, ProductionRun
from app.schemas import EfficiencyRequest, EfficiencyResponse

class EfficiencyService:
    """
    Production Efficiency Calculation System.
    
    Formula: efficiency = (ideal_cycle_time / actual_cycle_time) * 100
    
    Status thresholds:
    - >= 85%: Excellent (green)
    - 70-84%: Good (yellow)  
    - < 70%: Needs improvement (red)
    """
    
    @staticmethod
    def calculate_efficiency(db: Session, machine_id: int) -> EfficiencyResponse:
        """Calculate efficiency for a specific machine based on recent runs"""
        
        # Get machine
        machine = db.query(MachineDB).filter(MachineDB.id == machine_id).first()
        if not machine:
            raise ValueError("Machine not found")
        
        if not machine.spec:
            raise ValueError("Machine spec not found")
        
        ideal_time = machine.spec.ideal_cycle_time_sec
        
        # Get last completed run
        last_run = db.query(ProductionRunDB).filter(
            ProductionRunDB.machine_id == machine_id,
            ProductionRunDB.status == "completed",
            ProductionRunDB.actual_cycle_time.isnot(None)
        ).order_by(ProductionRunDB.id.desc()).first()
        
        if not last_run or not last_run.actual_cycle_time:
            return EfficiencyResponse(
                machine_code=machine.machine_code,
                ideal_cycle_time=ideal_time,
                actual_cycle_time=0,
                efficiency_percent=0,
                status="no_data"
            )
        
        actual_time = last_run.actual_cycle_time
        
        # Calculate efficiency
        if actual_time > 0:
            efficiency = (ideal_time / actual_time) * 100
        else:
            efficiency = 0
        
        # Determine status
        if efficiency >= 85:
            status = "excellent"
        elif efficiency >= 70:
            status = "good"
        else:
            status = "needs_improvement"
        
        return EfficiencyResponse(
            machine_code=machine.machine_code,
            ideal_cycle_time=ideal_time,
            actual_cycle_time=actual_time,
            efficiency_percent=round(efficiency, 1),
            status=status
        )
    
    @staticmethod
    def get_machine_efficiencies(db: Session) -> list[EfficiencyResponse]:
        """Get efficiency for all machines"""
        
        machines = db.query(MachineDB).filter(MachineDB.is_active == True).all()
        
        return [
            EfficiencyService.calculate_efficiency(db, m.id)
            for m in machines
        ]
    
    @staticmethod
    def get_average_efficiency(db: Session, branch_id: int = None) -> float:
        """Get average efficiency across all or specified branch machines"""
        
        query = db.query(MachineDB).filter(MachineDB.is_active == True)
        if branch_id:
            query = query.filter(MachineDB.branch_id == branch_id)
        
        machines = query.all()
        
        if not machines:
            return 0
        
        total_efficiency = 0
        count = 0
        
        for machine in machines:
            eff = EfficiencyService.calculate_efficiency(db, machine.id)
            if eff.efficiency_percent > 0:
                total_efficiency += eff.efficiency_percent
                count += 1
        
        if count == 0:
            return 0
        
        return round(total_efficiency / count, 1)