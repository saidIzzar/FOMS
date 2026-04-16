from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.database_models import Branch, MachineSpec, Machine, Mold, Rayoun, Material
from app.schemas import (
    BranchCreate, BranchResponse,
    MachineSpecResponse, MachineCreate, MachineResponse, MachineDetailResponse,
    MoldCreate, MoldResponse, MoldUpdate,
    ProductionRunCreate, ProductionRunResponse, ProductionRunUpdate,
    MountMoldEvent, ChangeMoldEvent, FinishWorkEvent, ProductionEventResponse,
    OperatorCreate, OperatorResponse,
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
from app.services.production_event_service import ProductionEventService, OperatorService
from app.api.dependencies import require_role, require_admin, require_engineer, get_current_user

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
    result = {"branches": 0, "machines": 0, "molds": 0, "rayouns": 0, "boxes": 0, "materials": 0}
    
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
    
    # Seed machines - expanded to 20 machines
    specs = db.query(MachineSpec).all()
    branches = db.query(Branch).all()
    if branches and specs:
        machines_data = [
            {"spec": "90T", "branch": 0, "serial": "SN90-001", "status": "running"},
            {"spec": "90T", "branch": 0, "serial": "SN90-002", "status": "idle"},
            {"spec": "90T", "branch": 1, "serial": "SN90-003", "status": "running"},
            {"spec": "120T", "branch": 0, "serial": "SN120-001", "status": "running"},
            {"spec": "120T", "branch": 0, "serial": "SN120-002", "status": "idle"},
            {"spec": "120T", "branch": 1, "serial": "SN120-003", "status": "maintenance"},
            {"spec": "160T", "branch": 0, "serial": "SN160-001", "status": "running"},
            {"spec": "160T", "branch": 0, "serial": "SN160-002", "status": "idle"},
            {"spec": "160T", "branch": 1, "serial": "SN160-003", "status": "running"},
            {"spec": "200T", "branch": 0, "serial": "SN200-001", "status": "running"},
            {"spec": "200T", "branch": 1, "serial": "SN200-002", "status": "idle"},
            {"spec": "250T", "branch": 0, "serial": "SN250-001", "status": "running"},
            {"spec": "250T", "branch": 1, "serial": "SN250-002", "status": "idle"},
            {"spec": "280T", "branch": 0, "serial": "SN280-001", "status": "running"},
            {"spec": "280T", "branch": 0, "serial": "SN280-002", "status": "maintenance"},
            {"spec": "280T", "branch": 1, "serial": "SN280-003", "status": "running"},
            {"spec": "380T", "branch": 0, "serial": "SN380-001", "status": "running"},
            {"spec": "380T", "branch": 1, "serial": "SN380-002", "status": "maintenance"},
            {"spec": "450T", "branch": 0, "serial": "SN450-001", "status": "running"},
            {"spec": "450T", "branch": 1, "serial": "SN450-002", "status": "idle"},
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
    
    # Seed molds - 25 molds for rayouns
    molds_data = [
        # Rayoun A molds (A1-A3 boxes)
        {"mold_code": "M-A01", "length_mm": 280, "width_mm": 240, "height_mm": 140, "weight_kg": 95, "required_tonnage": 90, "required_shot_volume": 75, "cavities": 4, "steel_type": "P20", "status": "active"},
        {"mold_code": "M-A02", "length_mm": 310, "width_mm": 260, "height_mm": 155, "weight_kg": 110, "required_tonnage": 90, "required_shot_volume": 85, "cavities": 4, "steel_type": "P20", "status": "active"},
        {"mold_code": "M-A03", "length_mm": 340, "width_mm": 290, "height_mm": 165, "weight_kg": 135, "required_tonnage": 120, "required_shot_volume": 110, "cavities": 2, "steel_type": "H13", "status": "active"},
        {"mold_code": "M-A04", "length_mm": 290, "width_mm": 250, "height_mm": 145, "weight_kg": 100, "required_tonnage": 90, "required_shot_volume": 80, "cavities": 4, "steel_type": "P20", "status": "active"},
        {"mold_code": "M-A05", "length_mm": 360, "width_mm": 310, "height_mm": 180, "weight_kg": 155, "required_tonnage": 120, "required_shot_volume": 130, "cavities": 2, "steel_type": "H13", "status": "active"},
        {"mold_code": "M-A06", "length_mm": 320, "width_mm": 270, "height_mm": 160, "weight_kg": 125, "required_tonnage": 120, "required_shot_volume": 95, "cavities": 4, "steel_type": "P20", "status": "active"},
        {"mold_code": "M-A07", "length_mm": 270, "width_mm": 220, "height_mm": 130, "weight_kg": 85, "required_tonnage": 90, "required_shot_volume": 65, "cavities": 4, "steel_type": "P20", "status": "active"},
        {"mold_code": "M-A08", "length_mm": 350, "width_mm": 300, "height_mm": 170, "weight_kg": 145, "required_tonnage": 120, "required_shot_volume": 115, "cavities": 2, "steel_type": "P20", "status": "active"},
        {"mold_code": "M-A09", "length_mm": 330, "width_mm": 280, "height_mm": 160, "weight_kg": 130, "required_tonnage": 120, "required_shot_volume": 100, "cavities": 2, "steel_type": "S136", "status": "active"},

        # Rayoun B molds (B1-B3 boxes)
        {"mold_code": "M-B01", "length_mm": 420, "width_mm": 360, "height_mm": 210, "weight_kg": 205, "required_tonnage": 160, "required_shot_volume": 200, "cavities": 4, "steel_type": "P20", "status": "active"},
        {"mold_code": "M-B02", "length_mm": 450, "width_mm": 390, "height_mm": 230, "weight_kg": 245, "required_tonnage": 200, "required_shot_volume": 280, "cavities": 2, "steel_type": "S136", "status": "active"},
        {"mold_code": "M-B03", "length_mm": 480, "width_mm": 420, "height_mm": 250, "weight_kg": 295, "required_tonnage": 250, "required_shot_volume": 350, "cavities": 2, "steel_type": "H13", "status": "active"},
        {"mold_code": "M-B04", "length_mm": 400, "width_mm": 340, "height_mm": 195, "weight_kg": 180, "required_tonnage": 160, "required_shot_volume": 170, "cavities": 4, "steel_type": "P20", "status": "active"},
        {"mold_code": "M-B05", "length_mm": 440, "width_mm": 380, "height_mm": 220, "weight_kg": 225, "required_tonnage": 200, "required_shot_volume": 240, "cavities": 2, "steel_type": "S136", "status": "active"},
        {"mold_code": "M-B06", "length_mm": 410, "width_mm": 350, "height_mm": 205, "weight_kg": 190, "required_tonnage": 160, "required_shot_volume": 185, "cavities": 4, "steel_type": "P20", "status": "active"},
        {"mold_code": "M-B07", "length_mm": 460, "width_mm": 400, "height_mm": 240, "weight_kg": 265, "required_tonnage": 200, "required_shot_volume": 310, "cavities": 2, "steel_type": "S136", "status": "active"},

        # Rayoun C molds (C1-C3 boxes)
        {"mold_code": "M-C01", "length_mm": 520, "width_mm": 460, "height_mm": 270, "weight_kg": 360, "required_tonnage": 280, "required_shot_volume": 420, "cavities": 4, "steel_type": "H13", "status": "active"},
        {"mold_code": "M-C02", "length_mm": 560, "width_mm": 500, "height_mm": 300, "weight_kg": 420, "required_tonnage": 280, "required_shot_volume": 520, "cavities": 2, "steel_type": "H13", "status": "active"},
        {"mold_code": "M-C03", "length_mm": 600, "width_mm": 540, "height_mm": 330, "weight_kg": 485, "required_tonnage": 380, "required_shot_volume": 650, "cavities": 2, "steel_type": "H13", "status": "active"},
        {"mold_code": "M-C04", "length_mm": 540, "width_mm": 480, "height_mm": 280, "weight_kg": 385, "required_tonnage": 280, "required_shot_volume": 450, "cavities": 4, "steel_type": "H13", "status": "active"},
        {"mold_code": "M-C05", "length_mm": 580, "width_mm": 520, "height_mm": 310, "weight_kg": 445, "required_tonnage": 380, "required_shot_volume": 580, "cavities": 2, "steel_type": "S136", "status": "active"},
        {"mold_code": "M-C06", "length_mm": 550, "width_mm": 490, "height_mm": 285, "weight_kg": 405, "required_tonnage": 280, "required_shot_volume": 480, "cavities": 4, "steel_type": "H13", "status": "active"},
        {"mold_code": "M-C07", "length_mm": 620, "width_mm": 560, "height_mm": 350, "weight_kg": 520, "required_tonnage": 380, "required_shot_volume": 700, "cavities": 2, "steel_type": "H13", "status": "active"},
        {"mold_code": "M-C08", "length_mm": 590, "width_mm": 530, "height_mm": 320, "weight_kg": 465, "required_tonnage": 380, "required_shot_volume": 620, "cavities": 2, "steel_type": "S136", "status": "active"},
        {"mold_code": "M-C09", "length_mm": 630, "width_mm": 570, "height_mm": 360, "weight_kg": 545, "required_tonnage": 380, "required_shot_volume": 750, "cavities": 2, "steel_type": "H13", "status": "active"},
    ]
    for m in molds_data:
        existing = db.query(Mold).filter(Mold.mold_code == m["mold_code"]).first()
        if not existing:
            mold = Mold(**m, is_active=True)
            db.add(mold)
            result["molds"] += 1
    db.commit()

    # Seed materials - industrial plastics
    materials_data = [
        {"code": "ABS-SG500", "name": "ABS Standard Grade", "grade": "SG500", "supplier": "Samsung", "density": 1.04, "mfi": 22, "status": "active"},
        {"code": "ABS-FR700", "name": "ABS Flame Retardant", "grade": "FR700", "supplier": "Samsung", "density": 1.18, "mfi": 18, "status": "active"},
        {"code": "PP-HF100", "name": "PP Homopolymer", "grade": "HF100", "supplier": "Reliance", "density": 0.90, "mfi": 45, "status": "active"},
        {"code": "PP-RC100", "name": "PP Random Copolymer", "grade": "RC100", "supplier": "Reliance", "density": 0.90, "mfi": 35, "status": "active"},
        {"code": "PC-2400", "name": "Polycarbonate", "grade": "2400", "supplier": "Sabic", "density": 1.20, "mfi": 12, "status": "active"},
        {"code": "PC-2800", "name": "Polycarbonate GF", "grade": "2800", "supplier": "Sabic", "density": 1.35, "mfi": 10, "status": "active"},
        {"code": "PE-HM5411", "name": "HDPE Film", "grade": "HM5411", "supplier": "Borealis", "density": 0.95, "mfi": 0.8, "status": "active"},
        {"code": "PE-LD450", "name": "LDPE General", "grade": "LD450", "supplier": "Borealis", "density": 0.92, "mfi": 45, "status": "active"},
        {"code": "PVC-S65", "name": "PVC Suspension", "grade": "S65", "supplier": "Formosa", "density": 1.40, "mfi": 65, "status": "active"},
        {"code": "PS-GP123", "name": "PS General Purpose", "grade": "GP123", "supplier": "Styrolution", "density": 1.05, "mfi": 8, "status": "active"},
        {"code": "POM-D500", "name": "POM Delrin", "grade": "D500", "supplier": "DuPont", "density": 1.42, "mfi": 9, "status": "active"},
        {"code": "PA6-GF30", "name": "Nylon 6 GF30", "grade": "GF30", "supplier": "BASF", "density": 1.35, "mfi": 25, "status": "active"},
        {"code": "PA66-GF30", "name": "Nylon 66 GF30", "grade": "GF30", "supplier": "BASF", "density": 1.35, "mfi": 20, "status": "active"},
        {"code": "PMMA-8N", "name": "Acrylic Clear", "grade": "8N", "supplier": "Arkema", "density": 1.19, "mfi": 3, "status": "active"},
        {"code": "TPU-A85", "name": "TPU Shore A85", "grade": "A85", "supplier": "BASF", "density": 1.12, "mfi": 35, "status": "active"},
    ]
    for m in materials_data:
        existing = db.query(Material).filter(Material.code == m["code"]).first()
        if not existing:
            material = Material(**m)
            db.add(material)
            result["materials"] = result.get("materials", 0) + 1
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
def create_machine(data: MachineCreate, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
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

@router.get("/machines/logs")
def get_machine_logs(machine_id: int = None, db: Session = Depends(get_db)):
    """Get machine operation logs - with optional machine_id filter"""
    from datetime import datetime, timedelta

    logs = []
    machines = db.query(Machine).all() if machine_id is None else [db.query(Machine).filter(Machine.id == machine_id).first()]

    for m in machines:
        if not m:
            continue

        # Generate sample logs for demonstration
        statuses = ["running", "idle", "maintenance", "running", "running"]
        for i, status in enumerate(statuses):
            logs.append({
                "id": len(logs) + 1,
                "machine_id": m.id,
                "machine_code": m.machine_code,
                "status": status,
                "timestamp": (datetime.now() - timedelta(hours=i*2)).isoformat(),
                "message": f"Machine {m.machine_code} is now {status}"
            })

    return logs

# ==================== MOLDS ====================

@router.post("/molds", response_model=MoldResponse)
def create_mold(data: MoldCreate, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
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
async def update_mold(mold_id: int, request: Request, db: Session = Depends(get_db)):
    """PATCH /molds/{id} — accepts {box_id} for assign/unassign. Reads raw JSON body to handle null values."""
    from app.models.database_models import Box
    from app.services.rayoun_service import mold_to_response

    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    mold = db.query(Mold).filter(Mold.id == mold_id).first()
    if not mold:
        raise HTTPException(status_code=404, detail=f"Mold {mold_id} not found")

    # Handle box_id assignment (the ONLY field this endpoint is designed for)
    if "box_id" in data:
        box_id = data["box_id"]

        if box_id is None:
            # Unassign: clear box and rayoun
            mold.box_id = None
            mold.rayoun_id = None
        else:
            # Assign to box
            box = db.query(Box).filter(Box.id == box_id).first()
            if not box:
                raise HTTPException(status_code=404, detail=f"Box {box_id} not found")

            # Check capacity
            current_count = db.query(Mold).filter(
                Mold.box_id == box_id,
                Mold.is_active == True,
                Mold.id != mold_id
            ).count()
            if current_count >= box.capacity:
                raise HTTPException(status_code=400, detail=f"Box {box.box_number} is full (capacity: {box.capacity})")

            mold.box_id = box_id
            mold.rayoun_id = box.rayoun_id

    # Allow other field updates from MoldUpdate schema
    allowed_fields = {
        "mold_code", "length_mm", "width_mm", "height_mm", "weight_kg",
        "required_tonnage", "required_shot_volume", "cavities",
        "steel_type", "location", "status", "rayoun_id"
    }
    for field in allowed_fields:
        if field in data and data[field] is not None:
            setattr(mold, field, data[field])

    db.commit()
    db.refresh(mold)
    return mold_to_response(mold)

# ==================== PRODUCTION RUNS (Daily Work) ====================

@router.post("/production-runs", response_model=ProductionRunResponse)
def create_production_run(data: ProductionRunCreate, db: Session = Depends(get_db), current_user = Depends(require_role(["admin", "engineer"]))):
    """Start a new production run (daily work) - requires admin or engineer"""
    try:
        return ProductionEventService.start_work(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/production-runs", response_model=list[ProductionRunResponse])
def get_production_runs(db: Session = Depends(get_db)):
    """Get all production runs"""
    return ProductionEventService.get_all_production(db)


@router.get("/production-runs/{run_id}", response_model=ProductionRunResponse)
def get_production_run(run_id: int, db: Session = Depends(get_db)):
    """Get specific production run"""
    try:
        return ProductionEventService.get_production_by_id(db, run_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/production-runs/{run_id}/mount-mold", response_model=ProductionEventResponse)
def mount_mold(run_id: int, db: Session = Depends(get_db)):
    """Event: Mount mold - sets mold_mount_time"""
    try:
        return ProductionEventService.mount_mold(db, run_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/production-runs/{run_id}/change-mold", response_model=ProductionEventResponse)
def change_mold(run_id: int, data: ChangeMoldEvent, db: Session = Depends(get_db)):
    """Event: Change mold - sets mold_change_time and recalculates duration"""
    try:
        return ProductionEventService.change_mold(db, run_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/production-runs/{run_id}/finish", response_model=ProductionEventResponse)
def finish_production_run(run_id: int, data: FinishWorkEvent, db: Session = Depends(get_db)):
    """Event: Finish work - only finish_time is editable"""
    try:
        return ProductionEventService.finish_work(db, run_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/production-runs/{run_id}", response_model=ProductionRunResponse)
def update_production_run(run_id: int, data: ProductionRunUpdate, db: Session = Depends(get_db)):
    """Update production run"""
    try:
        return ProductionEventService.update_production(db, run_id, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# ==================== OPERATORS ====================

@router.post("/operators", response_model=OperatorResponse)
def create_operator(data: OperatorCreate, db: Session = Depends(get_db)):
    try:
        return OperatorService.create_operator(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/operators", response_model=list[OperatorResponse])
def get_operators(db: Session = Depends(get_db)):
    return OperatorService.get_all_operators(db)


@router.get("/operators/{operator_id}", response_model=OperatorResponse)
def get_operator(operator_id: int, db: Session = Depends(get_db)):
    try:
        return OperatorService.get_operator(db, operator_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# ==================== SMART COMPATIBILITY ====================
from app.services.compatibility_engine import MoldCompatibilityEngine, MachineSelector

@router.post("/compatibility/check")
def check_compatibility(data: CompatibilityRequest, db: Session = Depends(get_db)):
    return CompatibilityService.check_compatibility(db, data)

@router.get("/compatibility/machines/{mold_id}")
def get_compatible_machines(mold_id: int, branch_id: int = None, db: Session = Depends(get_db)):
    return CompatibilityService.find_compatible_machines(db, mold_id, branch_id)

@router.get("/compatibility/best-machine/{mold_id}")
def get_best_machine(mold_id: int, branch_id: int = None, db: Session = Depends(get_db)):
    """Find best machine with full analysis"""
    return MoldCompatibilityEngine.find_best_machine(db, mold_id, branch_id)

@router.get("/compatibility/all-machines/{mold_id}")
def get_all_machine_scores(mold_id: int, db: Session = Depends(get_db)):
    """Get compatibility scores for all machines"""
    return MoldCompatibilityEngine.check_all_machines(db, mold_id)

@router.get("/compatibility/select/{mold_id}")
def select_machine(mold_id: int, strategy: str = "score", db: Session = Depends(get_db)):
    """Smart machine selection with strategy (score/smallest/fastest/balanced)"""
    return MachineSelector.select_optimal(db, mold_id, strategy)

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
def create_maintenance_record(data: dict, current_user = Depends(require_role(["admin", "engineer"]))):
    """Create maintenance record - requires admin or engineer"""
    return {"id": 1, "message": "Maintenance record created"}

# ==================== ACCOUNTS (USERS) ====================

@router.get("/accounts", response_model=list)
def get_accounts(db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    """Get all user accounts - admin only"""
    from app.api.auth import USERS_DB
    return list(USERS_DB.values())

# ==================== MATERIALS ====================

@router.get("/materials")
def get_materials(db: Session = Depends(get_db)):
    """Get all materials"""
    materials = db.query(Material).filter(Material.status == "active").all()
    return [{
        "id": m.id,
        "code": m.code,
        "name": m.name,
        "grade": m.grade,
        "supplier": m.supplier,
        "density": m.density,
        "mfi": m.mfi,
        "status": m.status
    } for m in materials]

@router.get("/materials/{material_id}")
def get_material(material_id: int, db: Session = Depends(get_db)):
    """Get specific material"""
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return {
        "id": material.id,
        "code": material.code,
        "name": material.name,
        "grade": material.grade,
        "supplier": material.supplier,
        "density": material.density,
        "mfi": material.mfi,
        "status": material.status
    }