from sqlalchemy.orm import Session
from datetime import datetime
from app.models.database_models import Branch, MachineSpec, Machine, Mold, ProductionRun
from app.core.machine_catalog import MACHINE_SPECS_CATALOG
from app.schemas import (
    BranchCreate, BranchResponse,
    MachineSpecResponse, MachineCreate, MachineResponse, MachineDetailResponse,
    MoldCreate, MoldResponse, MoldUpdate,
    ProductionRunCreate, ProductionRunUpdate, ProductionRunResponse
)

class MachineService:
    """Machine management service"""
    
    @staticmethod
    def get_all_specs(db: Session) -> list[MachineSpecResponse]:
        specs = db.query(MachineSpec).all()
        return [MachineSpecResponse.model_validate(s) for s in specs]
    
    @staticmethod
    def seed_specs(db: Session) -> int:
        """Seed machine specifications catalog"""
        count = 0
        for spec_data in MACHINE_SPECS_CATALOG.values():
            existing = db.query(MachineSpec).filter(
                MachineSpec.machine_class == spec_data["machine_class"]
            ).first()
            if not existing:
                spec = MachineSpec(**spec_data)
                db.add(spec)
                count += 1
        db.commit()
        return count
    
    @staticmethod
    def create_machine(db: Session, data: MachineCreate) -> MachineResponse:
        """Create machine instance with auto-generated code"""
        spec = db.query(MachineSpec).filter(MachineSpec.id == data.spec_id).first()
        if not spec:
            raise ValueError("Machine spec not found")
        
        last_machine = db.query(Machine).filter(
            Machine.branch_id == data.branch_id,
            Machine.spec_id == data.spec_id
        ).order_by(Machine.sequence.desc()).first()
        
        next_sequence = (last_machine.sequence + 1) if last_machine else 1
        machine_code = f"{spec.machine_class}/{next_sequence}"
        
        machine = Machine(
            machine_code=machine_code,
            branch_id=data.branch_id,
            spec_id=data.spec_id,
            serial_number=data.serial_number,
            installation_date=data.installation_date,
            status=data.status or "idle",
            notes=data.notes,
            sequence=next_sequence
        )
        
        db.add(machine)
        db.commit()
        db.refresh(machine)
        
        return MachineResponse.model_validate(machine)
    
    @staticmethod
    def get_all_machines(db: Session) -> list[MachineDetailResponse]:
        machines = db.query(Machine).all()
        result = []
        for m in machines:
            resp = MachineDetailResponse(
                id=m.id,
                machine_code=m.machine_code,
                branch_id=m.branch_id,
                spec_id=m.spec_id,
                serial_number=m.serial_number,
                installation_date=m.installation_date,
                status=m.status,
                is_active=m.is_active,
                sequence=m.sequence,
                spec=MachineSpecResponse.model_validate(m.spec) if m.spec else None,
                branch=BranchResponse.model_validate(m.branch) if m.branch else None
            )
            result.append(resp)
        return result
    
    @staticmethod
    def get_machine(db: Session, machine_id: int) -> MachineDetailResponse:
        machine = db.query(Machine).filter(Machine.id == machine_id).first()
        if not machine:
            raise ValueError("Machine not found")
        
        return MachineDetailResponse(
            id=machine.id,
            machine_code=machine.machine_code,
            branch_id=machine.branch_id,
            spec_id=machine.spec_id,
            serial_number=machine.serial_number,
            installation_date=machine.installation_date,
            status=machine.status,
            is_active=machine.is_active,
            sequence=machine.sequence,
            spec=MachineSpecResponse.model_validate(machine.spec) if machine.spec else None,
            branch=BranchResponse.model_validate(machine.branch) if machine.branch else None
        )
    
    @staticmethod
    def update_machine_status(db: Session, machine_id: int, status: str) -> MachineResponse:
        machine = db.query(Machine).filter(Machine.id == machine_id).first()
        if not machine:
            raise ValueError("Machine not found")
        
        machine.status = status
        db.commit()
        db.refresh(machine)
        
        return MachineResponse.model_validate(machine)
    
    @staticmethod
    def get_machines_by_branch(db: Session, branch_id: int) -> list[MachineDetailResponse]:
        machines = db.query(Machine).filter(Machine.branch_id == branch_id).all()
        return [MachineService.get_machine(db, m.id) for m in machines]


class MoldService:
    """Mold management service"""

    @staticmethod
    def create_mold(db: Session, data: MoldCreate) -> MoldResponse:
        mold = Mold(**data.model_dump(exclude_none=True))
        db.add(mold)
        db.commit()
        db.refresh(mold)
        return MoldService._to_response(mold)

    @staticmethod
    def get_all_molds(db: Session) -> list[MoldResponse]:
        try:
            molds = db.query(Mold).all()
            return [MoldService._to_response(m) for m in molds]
        except Exception as e:
            import traceback
            traceback.print_exc()
            return []

    @staticmethod
    def _to_response(mold: Mold) -> MoldResponse:
        """Convert Mold model to response, handling missing/null fields safely"""
        try:
            return MoldResponse.model_validate(mold)
        except Exception:
            pass

        data = {
            "id": mold.id,
            "mold_code": mold.mold_code,
            "length_mm": mold.length_mm or 0.0,
            "width_mm": mold.width_mm or 0.0,
            "height_mm": mold.height_mm or 0.0,
            "weight_kg": mold.weight_kg or 0.0,
            "required_tonnage": mold.required_tonnage or 0,
            "required_shot_volume": mold.required_shot_volume or 0.0,
            "cavities": mold.cavities or 1,
            "steel_type": mold.steel_type,
            "status": mold.status or "active",
            "is_active": mold.is_active if hasattr(mold, 'is_active') else True,
            "box_id": mold.box_id,
        }
        if hasattr(mold, 'rayoun_id'):
            data["rayoun_id"] = mold.rayoun_id
        return MoldResponse(**data)
    
    @staticmethod
    def get_mold(db: Session, mold_id: int) -> MoldResponse:
        mold = db.query(Mold).filter(Mold.id == mold_id).first()
        if not mold:
            raise ValueError("Mold not found")
        return MoldService._to_response(mold)

    @staticmethod
    def update_mold(db: Session, mold_id: int, data: MoldCreate) -> MoldResponse:
        mold = db.query(Mold).filter(Mold.id == mold_id).first()
        if not mold:
            raise ValueError("Mold not found")

        for key, value in data.model_dump(exclude_none=True).items():
            if hasattr(mold, key):
                setattr(mold, key, value)

        db.commit()
        db.refresh(mold)
        return MoldService._to_response(mold)

    @staticmethod
    def update_mold_partial(db: Session, mold_id: int, data) -> MoldResponse:
        """Update mold with partial data - for rayoun box assignment"""
        mold = db.query(Mold).filter(Mold.id == mold_id).first()
        if not mold:
            raise ValueError("Mold not found")

        update_data = data.model_dump(exclude_none=True) if hasattr(data, 'model_dump') else data
        for key, value in update_data.items():
            if hasattr(mold, key):
                setattr(mold, key, value)

        db.commit()
        db.refresh(mold)
        return MoldService._to_response(mold)


class BranchService:
    """Branch management service"""
    
    @staticmethod
    def create_branch(db: Session, data: BranchCreate) -> BranchResponse:
        branch = Branch(**data.model_dump())
        db.add(branch)
        db.commit()
        db.refresh(branch)
        return BranchResponse.model_validate(branch)
    
    @staticmethod
    def get_all_branches(db: Session) -> list[BranchResponse]:
        branches = db.query(Branch).all()
        return [BranchResponse.model_validate(b) for b in branches]
    
    @staticmethod
    def get_branch(db: Session, branch_id: int) -> BranchResponse:
        branch = db.query(Branch).filter(Branch.id == branch_id).first()
        if not branch:
            raise ValueError("Branch not found")
        return BranchResponse.model_validate(branch)


class ProductionService:
    """Production run service"""
    
    @staticmethod
    def create_run(db: Session, data: ProductionRunCreate) -> ProductionRunResponse:
        machine = db.query(Machine).filter(Machine.id == data.machine_id).first()
        mold = db.query(Mold).filter(Mold.id == data.mold_id).first()
        
        if not machine:
            raise ValueError("Machine not found")
        if not mold:
            raise ValueError("Mold not found")
        
        if not data.ideal_cycle_time and machine.spec:
            data.ideal_cycle_time = machine.spec.ideal_cycle_time_sec
        
        run = ProductionRun(**data.model_dump())
        db.add(run)
        db.commit()
        db.refresh(run)
        
        return ProductionRunResponse.model_validate(run)
    
    @staticmethod
    def get_all_runs(db: Session) -> list[ProductionRunResponse]:
        runs = db.query(ProductionRun).all()
        return [ProductionRunResponse.model_validate(r) for r in runs]
    
    @staticmethod
    def complete_run(db: Session, run_id: int, actual_cycle_time: float, quantity_produced: int, quantity_rejected: int) -> ProductionRunResponse:
        run = db.query(ProductionRun).filter(ProductionRun.id == run_id).first()
        if not run:
            raise ValueError("Production run not found")

        run.end_time = datetime.now().isoformat()
        run.actual_cycle_time = actual_cycle_time
        run.quantity_produced = quantity_produced
        run.quantity_rejected = quantity_rejected
        run.status = "completed"

        db.commit()
        db.refresh(run)
        return ProductionRunResponse.model_validate(run)

    @staticmethod
    def finish_run(db: Session, run_id: int, finish_time: str = None) -> ProductionRunResponse:
        """Finish production run - only finish_time is editable"""
        run = db.query(ProductionRun).filter(ProductionRun.id == run_id).first()
        if not run:
            raise ValueError("Production run not found")

        if finish_time:
            run.finish_time = finish_time
        else:
            run.finish_time = datetime.now().isoformat()

        if run.mold_change_time and run.mold_mount_time:
            mount_dt = datetime.fromisoformat(run.mold_mount_time.replace('Z', '+00:00'))
            change_dt = datetime.fromisoformat(run.mold_change_time.replace('Z', '+00:00'))
            diff = (change_dt - mount_dt).total_seconds() / 60
            run.total_change_minutes = int(diff)

        if not run.end_time:
            run.status = "completed"
            run.end_time = run.finish_time

        db.commit()
        db.refresh(run)
        return ProductionRunResponse.model_validate(run)

    @staticmethod
    def change_mold(db: Session, run_id: int, new_mold_id: int) -> ProductionRunResponse:
        """Change mold during production - sets change time and calculates duration"""
        run = db.query(ProductionRun).filter(ProductionRun.id == run_id).first()
        if not run:
            raise ValueError("Production run not found")

        mold = db.query(Mold).filter(Mold.id == new_mold_id).first()
        if not mold:
            raise ValueError("Mold not found")

        if not run.mold_mount_time:
            run.mold_mount_time = datetime.now().isoformat()

        run.mold_change_time = datetime.now().isoformat()
        run.mold_id = new_mold_id

        if run.mold_mount_time:
            mount_dt = datetime.fromisoformat(run.mold_mount_time.replace('Z', '+00:00'))
            change_dt = datetime.fromisoformat(run.mold_change_time.replace('Z', '+00:00'))
            diff = (change_dt - mount_dt).total_seconds() / 60
            run.total_change_minutes = int(diff)

        db.commit()
        db.refresh(run)
        return ProductionRunResponse.model_validate(run)