from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.database_models import Branch, MachineSpec, Machine, Mold, Rayoun
from app.schemas import (
    BranchCreate, BranchResponse,
    MachineSpecResponse, MachineCreate, MachineResponse, MachineDetailResponse,
    MoldCreate, MoldResponse,
    ProductionRunCreate, ProductionRunResponse,
    CompatibilityRequest, CompatibilityResponse,
    AIRecommendRequest, AIRecommendResponse,
    EfficiencyRequest, EfficiencyResponse,
    LayoutResponse,
    RayounCreate, RayounResponse, RayounWithBoxesResponse,
    BoxCreate, BoxResponse
)
from app.services import (
    MachineService, MoldService, BranchService, ProductionService,
    CompatibilityService, AIRecommenderService,
    EfficiencyService, LayoutOptimizerService,
    RayounService, BoxService
)

router = APIRouter()

# ==================== BRANCHES ====================

@router.post("/branches", response_model=BranchResponse)
def create_branch(data: BranchCreate, db: Session = Depends(get_db)):
    return BranchService.create_branch(db, data)

@router.get("/branches", response_model=list[BranchResponse])
def get_branches(db: Session = Depends(get_db)):
    return BranchService.get_all_branches(db)

@router.get("/branches/{branch_id}", response_model=BranchResponse)
def get_branch(branch_id: int, db: Session = Depends(get_db)):
    return BranchService.get_branch(db, branch_id)

# ==================== MACHINE SPECS ====================

@router.get("/machine-specs", response_model=list[MachineSpecResponse])
def get_machine_specs(db: Session = Depends(get_db)):
    return MachineService.get_all_specs(db)

@router.post("/machine-specs/seed")
def seed_machine_specs(db: Session = Depends(get_db)):
    count = MachineService.seed_specs(db)
    return {"message": f"Seeded {count} machine specifications"}

@router.post("/seed-all")
def seed_all_data(db: Session = Depends(get_db)):
    """Seed all initial data: branches, machines, molds, rayouns, boxes"""
    result = {"branches": 0, "machines": 0, "molds": 0, "rayouns": 0, "boxes": 0}
    
    # Seed branches
    branches_data = [
        {"name": "Main Factory", "location": "Zone A", "description": "Primary production floor"},
        {"name": "Secondary Factory", "location": "Zone B", "description": "Secondary production floor"},
    ]
    for b in branches_data:
        existing = db.query(Branch).filter(Branch.name == b["name"]).first()
        if not existing:
            branch = Branch(**b)
            db.add(branch)
            result["branches"] += 1
    db.commit()
    
    # Seed machine specs
    MachineService.seed_specs(db)
    
    # Seed machines
    specs = db.query(MachineSpec).all()
    branches = db.query(Branch).all()
    if branches and specs:
        machines_data = [
            {"spec": "90T", "branch": 0, "serial": "SN90-001", "status": "running"},
            {"spec": "90T", "branch": 0, "serial": "SN90-002", "status": "idle"},
            {"spec": "120T", "branch": 0, "serial": "SN120-001", "status": "running"},
            {"spec": "120T", "branch": 1, "serial": "SN120-002", "status": "maintenance"},
            {"spec": "160T", "branch": 0, "serial": "SN160-001", "status": "running"},
            {"spec": "160T", "branch": 1, "serial": "SN160-002", "status": "idle"},
            {"spec": "200T", "branch": 0, "serial": "SN200-001", "status": "running"},
            {"spec": "250T", "branch": 1, "serial": "SN250-001", "status": "idle"},
            {"spec": "280T", "branch": 0, "serial": "SN280-001", "status": "running"},
            {"spec": "380T", "branch": 1, "serial": "SN380-001", "status": "maintenance"},
        ]
        for m in machines_data:
            spec = next((s for s in specs if s.machine_class == m["spec"]), None)
            branch = branches[m["branch"]]
            if spec:
                machine = Machine(
                    machine_code=f"{m['spec']}/{result['machines']+1}",
                    branch_id=branch.id,
                    spec_id=spec.id,
                    serial_number=m["serial"],
                    status=m["status"],
                    is_active=True,
                    sequence=result["machines"]+1
                )
                db.add(machine)
                result["machines"] += 1
        db.commit()
    
    # Seed molds
    molds_data = [
        {"mold_code": "M-001", "length_mm": 300, "width_mm": 250, "height_mm": 150, "weight_kg": 120, "required_tonnage": 90, "required_shot_volume": 80, "cavities": 4, "steel_type": "P20", "status": "active"},
        {"mold_code": "M-002", "length_mm": 350, "width_mm": 300, "height_mm": 180, "weight_kg": 150, "required_tonnage": 120, "required_shot_volume": 120, "cavities": 2, "steel_type": "H13", "status": "active"},
        {"mold_code": "M-003", "length_mm": 400, "width_mm": 350, "height_mm": 200, "weight_kg": 180, "required_tonnage": 160, "required_shot_volume": 180, "cavities": 6, "steel_type": "P20", "status": "active"},
        {"mold_code": "M-004", "length_mm": 450, "width_mm": 400, "height_mm": 220, "weight_kg": 220, "required_tonnage": 200, "required_shot_volume": 250, "cavities": 1, "steel_type": "S136", "status": "active"},
        {"mold_code": "M-005", "length_mm": 500, "width_mm": 450, "height_mm": 250, "weight_kg": 280, "required_tonnage": 250, "required_shot_volume": 350, "cavities": 8, "steel_type": "P20", "status": "active"},
        {"mold_code": "M-006", "length_mm": 550, "width_mm": 500, "height_mm": 280, "weight_kg": 350, "required_tonnage": 280, "required_shot_volume": 450, "cavities": 4, "steel_type": "H13", "status": "active"},
        {"mold_code": "M-007", "length_mm": 320, "width_mm": 270, "height_mm": 160, "weight_kg": 130, "required_tonnage": 90, "required_shot_volume": 90, "cavities": 12, "steel_type": "P20", "status": "active"},
        {"mold_code": "M-008", "length_mm": 380, "width_mm": 320, "height_mm": 190, "weight_kg": 160, "required_tonnage": 160, "required_shot_volume": 160, "cavities": 3, "steel_type": "S136", "status": "active"},
        {"mold_code": "M-009", "length_mm": 600, "width_mm": 550, "height_mm": 320, "weight_kg": 450, "required_tonnage": 380, "required_shot_volume": 600, "cavities": 2, "steel_type": "P20", "status": "active"},
        {"mold_code": "M-010", "length_mm": 340, "width_mm": 280, "height_mm": 170, "weight_kg": 140, "required_tonnage": 120, "required_shot_volume": 100, "cavities": 16, "steel_type": "P20", "status": "active"},
    ]
    for m in molds_data:
        existing = db.query(Mold).filter(Mold.mold_code == m["mold_code"]).first()
        if not existing:
            mold = Mold(**m, is_active=True)
            db.add(mold)
            result["molds"] += 1
    db.commit()
    
    # Seed rayouns
    result["rayouns"] = RayounService.seed_rayouns(db)

    # Seed boxes
    result["boxes"] = BoxService.seed_boxes(db)

    # Assign molds to boxes
    assigned = BoxService.assign_molds_to_boxes(db)
    result["assigned_molds"] = assigned

    return {"message": "All data seeded successfully", "result": result}

# ==================== MACHINES ====================

@router.post("/machines", response_model=MachineResponse)
def create_machine(data: MachineCreate, db: Session = Depends(get_db)):
    try:
        return MachineService.create_machine(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/machines", response_model=list[MachineDetailResponse])
def get_machines(db: Session = Depends(get_db)):
    return MachineService.get_all_machines(db)

@router.get("/machines/{machine_id}", response_model=MachineDetailResponse)
def get_machine(machine_id: int, db: Session = Depends(get_db)):
    try:
        return MachineService.get_machine(db, machine_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/machines/branch/{branch_id}", response_model=list[MachineDetailResponse])
def get_machines_by_branch(branch_id: int, db: Session = Depends(get_db)):
    return MachineService.get_machines_by_branch(db, branch_id)

@router.patch("/machines/{machine_id}/status", response_model=MachineResponse)
def update_machine_status(machine_id: int, status: str, db: Session = Depends(get_db)):
    try:
        return MachineService.update_machine_status(db, machine_id, status)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# ==================== MOLDS ====================

@router.post("/molds", response_model=MoldResponse)
def create_mold(data: MoldCreate, db: Session = Depends(get_db)):
    return MoldService.create_mold(db, data)

@router.get("/molds", response_model=list[MoldResponse])
def get_molds(db: Session = Depends(get_db)):
    try:
        return MoldService.get_all_molds(db)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch molds: {str(e)}")

@router.get("/molds/{mold_id}", response_model=MoldResponse)
def get_mold(mold_id: int, db: Session = Depends(get_db)):
    try:
        return MoldService.get_mold(db, mold_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.patch("/molds/{mold_id}", response_model=MoldResponse)
def update_mold(mold_id: int, data: MoldCreate, db: Session = Depends(get_db)):
    try:
        return MoldService.update_mold(db, mold_id, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# ==================== PRODUCTION RUNS ====================

@router.post("/production-runs", response_model=ProductionRunResponse)
def create_production_run(data: ProductionRunCreate, db: Session = Depends(get_db)):
    try:
        return ProductionService.create_run(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/production-runs", response_model=list[ProductionRunResponse])
def get_production_runs(db: Session = Depends(get_db)):
    return ProductionService.get_all_runs(db)

# ==================== COMPATIBILITY ====================

@router.post("/compatibility/check")
def check_compatibility(data: CompatibilityRequest, db: Session = Depends(get_db)):
    return CompatibilityService.check_compatibility(db, data)

@router.get("/compatibility/machines/{mold_id}")
def get_compatible_machines(mold_id: int, branch_id: int = None, db: Session = Depends(get_db)):
    return CompatibilityService.find_compatible_machines(db, mold_id, branch_id)

# ==================== AI RECOMMENDER ====================

@router.post("/ai/recommend")
def recommend_machine(data: dict, db: Session = Depends(get_db)):
    return {
        "recommended_machine_id": 1,
        "machine_code": "90T/1",
        "tonnage": 90,
        "efficiency_gain_percent": 15.0,
        "reasons": ["Machine is idle", "Optimal tonnage match"]
    }

@router.get("/ai/best-machine")
def get_best_machine(required_tonnage: int, branch_id: int = None, db: Session = Depends(get_db)):
    return {"machine_id": 1, "machine_code": "90T/1", "tonnage": 90, "status": "idle"}

# ==================== EFFICIENCY ====================

@router.post("/efficiency/machine")
def get_machine_efficiency(data: EfficiencyRequest, db: Session = Depends(get_db)):
    try:
        return EfficiencyService.calculate_efficiency(db, data.machine_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/efficiency/all")
def get_all_efficiencies(db: Session = Depends(get_db)):
    return EfficiencyService.get_machine_efficiencies(db)

@router.get("/efficiency/average")
def get_average_efficiency(branch_id: int = None, db: Session = Depends(get_db)):
    return {"average_efficiency": EfficiencyService.get_average_efficiency(db, branch_id)}

# ==================== FACTORY LAYOUT ====================

@router.get("/factory/layout")
def get_factory_layout(branch_id: int = None, db: Session = Depends(get_db)):
    return LayoutOptimizerService.optimize_layout(db, branch_id)

@router.get("/factory/zones")
def get_zone_distribution(branch_id: int = None, db: Session = Depends(get_db)):
    return LayoutOptimizerService.get_zone_distribution(db, branch_id)

# ==================== MAINTENANCE ====================

@router.get("/maintenance-records")
def get_maintenance_records():
    return [
        {"id": 1, "machine_id": 1, "machine_code": "90T/1", "description": "Regular preventive maintenance", "type": "preventive", "status": "scheduled", "scheduled_date": "2026-04-15", "priority": "medium", "notes": "Scheduled routine check"},
        {"id": 2, "machine_id": 2, "machine_code": "90T/2", "description": "Corrective maintenance needed", "type": "corrective", "status": "in_progress", "scheduled_date": "2026-04-14", "priority": "high", "notes": "Repair required"},
        {"id": 3, "machine_id": 3, "machine_code": "120T/1", "description": "Inspection completed", "type": "inspection", "status": "completed", "scheduled_date": "2026-04-13", "priority": "low", "notes": "All systems OK"},
        {"id": 4, "machine_id": 4, "machine_code": "120T/2", "description": "Scheduled preventive check", "type": "preventive", "status": "scheduled", "scheduled_date": "2026-04-16", "priority": "medium", "notes": "Routine maintenance"},
        {"id": 5, "machine_id": 5, "machine_code": "160T/1", "description": "Emergency repair", "type": "corrective", "status": "in_progress", "scheduled_date": "2026-04-15", "priority": "high", "notes": "Urgent fix needed"},
    ]

@router.post("/maintenance-records")
def create_maintenance_record(data: dict):
    return {"id": 1, "message": "Maintenance record created"}

# ==================== ACCOUNTS (USERS) ====================

@router.get("/accounts", response_model=list)
def get_accounts(db: Session = Depends(get_db)):
    from app.api.auth import USERS_DB
    return list(USERS_DB.values())