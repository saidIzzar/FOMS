from datetime import datetime
from sqlalchemy.orm import Session
from app.models.database_models import ProductionRun, Machine, Mold, Operator
from app.schemas import (
    ProductionRunCreate, ProductionRunResponse, ProductionRunUpdate,
    MountMoldEvent, ChangeMoldEvent, FinishWorkEvent, ProductionEventResponse,
    OperatorCreate, OperatorResponse
)


def get_current_timestamp() -> str:
    return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")


def parse_timestamp(ts: str) -> datetime:
    if not ts:
        return None
    try:
        return datetime.strptime(ts, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        try:
            return datetime.strptime(ts, "%Y-%m-%dT%H:%M:%S")
        except ValueError:
            try:
                return datetime.strptime(ts, "%Y-%m-%d %H:%M")
            except ValueError:
                return None


def calculate_minutes_between(start: str, end: str) -> float:
    if not start or not end:
        return 0.0
    start_dt = parse_timestamp(start)
    end_dt = parse_timestamp(end)
    if not start_dt or not end_dt:
        return 0.0
    try:
        diff = end_dt - start_dt
        return round(diff.total_seconds() / 60, 2)
    except Exception:
        return 0.0


def calculate_production_times(run: ProductionRun) -> tuple[float, float, float]:
    """Calculate production time metrics:
    - total_production_minutes: start to finish
    - net_production_minutes: after subtracting change time
    - total_change_minutes: mold change duration
    """
    total_change = 0.0
    
    if run.mold_mount_time and run.mold_change_time:
        total_change = calculate_minutes_between(run.mold_mount_time, run.mold_change_time)
    elif run.mold_change_time and run.start_time:
        total_change = calculate_minutes_between(run.start_time, run.mold_change_time)
    
    total_prod = 0.0
    if run.start_time and run.finish_time:
        total_prod = calculate_minutes_between(run.start_time, run.finish_time)
    
    net_prod = max(0, total_prod - total_change)
    
    return round(total_prod, 2), round(net_prod, 2), round(total_change, 2)


def to_response(run: ProductionRun) -> ProductionRunResponse:
    machine_code = None
    machine_tonnage = None
    if run.machine:
        machine_code = run.machine.machine_code or f"Machine #{run.machine_id}"
        if run.machine.spec:
            machine_tonnage = run.machine.spec.tonnage
    
    mold_code = None
    if run.mold:
        mold_code = run.mold.mold_code or f"Mold #{run.mold_id}"
    
    operator_name = None
    if run.operator:
        operator_name = run.operator.name
    
    total_prod, net_prod, change = calculate_production_times(run)
    
    is_compatible = None
    mold_required_tonnage = None
    if run.mold and run.machine:
        mold_required_tonnage = run.mold.required_tonnage
        machine_tonnage_val = machine_tonnage or 0
        is_compatible = mold_required_tonnage <= machine_tonnage_val
    
    return ProductionRunResponse(
        id=run.id,
        machine_id=run.machine_id,
        mold_id=run.mold_id,
        operator_id=run.operator_id,
        material_type=run.material_type,
        start_time=run.start_time or "",
        finish_time=run.finish_time,
        mold_mount_time=run.mold_mount_time,
        mold_change_time=run.mold_change_time,
        mold_change_2_time=run.mold_change_2_time,
        total_change_minutes=change,
        total_production_minutes=total_prod,
        net_production_minutes=net_prod,
        ideal_cycle_time=run.ideal_cycle_time,
        actual_cycle_time=run.actual_cycle_time,
        quantity_produced=run.quantity_produced or 0,
        quantity_rejected=run.quantity_rejected or 0,
        status=run.status or "created",
        date=run.date,
        machine_code=machine_code,
        mold_code=mold_code,
        operator_name=operator_name,
        machine_tonnage=machine_tonnage,
        mold_required_tonnage=mold_required_tonnage,
        is_mold_compatible=is_compatible
    )


class ProductionEventService:

    @staticmethod
    def start_work(db: Session, data: ProductionRunCreate) -> ProductionRunResponse:
        machine = db.query(Machine).filter(Machine.id == data.machine_id).first()
        if not machine:
            raise ValueError("Machine not found")

        running = db.query(ProductionRun).filter(
            ProductionRun.machine_id == data.machine_id,
            ProductionRun.status == "running"
        ).first()
        if running:
            raise ValueError(f"Machine {machine.machine_code} already has active production")

        mold = db.query(Mold).filter(Mold.id == data.mold_id).first()
        if not mold:
            raise ValueError("Mold not found")

        timestamp = get_current_timestamp()
        date = timestamp.split()[0]

        run = ProductionRun(
            machine_id=data.machine_id,
            mold_id=data.mold_id,
            operator_id=data.operator_id,
            material_type=data.material_type,
            start_time=timestamp,
            status="created",
            date=date,
            ideal_cycle_time=data.ideal_cycle_time,
            quantity_produced=data.quantity_produced or 0,
            quantity_rejected=data.quantity_rejected or 0
        )

        db.add(run)
        db.commit()
        db.refresh(run)
        
        return to_response(run)

    @staticmethod
    def mount_mold(db: Session, run_id: int) -> ProductionEventResponse:
        run = db.query(ProductionRun).filter(ProductionRun.id == run_id).first()
        if not run:
            raise ValueError("Production run not found")

        if run.status != "running":
            return ProductionEventResponse(
                success=False,
                message=f"Cannot mount mold: production is {run.status}"
            )

        if run.mold_mount_time:
            return ProductionEventResponse(
                success=False,
                message="Mold already mounted"
            )

        run.mold_mount_time = get_current_timestamp()
        db.commit()
        db.refresh(run)

        return ProductionEventResponse(
            success=True,
            message="Mold mounted successfully",
            production_run=to_response(run)
        )

    @staticmethod
    def change_mold(db: Session, run_id: int, event: ChangeMoldEvent) -> ProductionEventResponse:
        run = db.query(ProductionRun).filter(ProductionRun.id == run_id).first()
        if not run:
            raise ValueError("Production run not found")

        if run.status != "running":
            return ProductionEventResponse(
                success=False,
                message=f"Cannot change mold: production is {run.status}"
            )

        new_mold = db.query(Mold).filter(Mold.id == event.new_mold_id).first()
        if not new_mold:
            raise ValueError("New mold not found")

        now = get_current_timestamp()

        if run.mold_mount_time:
            run.total_change_minutes = calculate_minutes_between(run.mold_mount_time, now)

        run.mold_id = event.new_mold_id
        run.mold_change_time = now

        db.commit()
        db.refresh(run)

        return ProductionEventResponse(
            success=True,
            message=f"Mold changed to {new_mold.mold_code}",
            production_run=to_response(run)
        )

    @staticmethod
    def finish_work(db: Session, run_id: int, event: FinishWorkEvent) -> ProductionEventResponse:
        run = db.query(ProductionRun).filter(ProductionRun.id == run_id).first()
        if not run:
            raise ValueError("Production run not found")

        if run.status == "completed":
            return ProductionEventResponse(
                success=False,
                message="Production already completed"
            )

        if event.finish_time:
            if run.start_time and event.finish_time < run.start_time:
                raise ValueError("Finish time cannot be before start time")
            run.finish_time = event.finish_time
        else:
            run.finish_time = get_current_timestamp()
        
        run.status = "completed"
        
        if event.quantity_produced is not None:
            run.quantity_produced = event.quantity_produced
        if event.quantity_rejected is not None:
            run.quantity_rejected = event.quantity_rejected
        if event.material_type:
            run.material_type = event.material_type

        db.commit()
        db.refresh(run)

        return ProductionEventResponse(
            success=True,
            message="Production completed",
            production_run=to_response(run)
        )

    @staticmethod
    def update_production(db: Session, run_id: int, data: ProductionRunUpdate) -> ProductionRunResponse:
        run = db.query(ProductionRun).filter(ProductionRun.id == run_id).first()
        if not run:
            raise ValueError("Production run not found")

        if data.finish_time:
            run.finish_time = data.finish_time
        if data.status:
            run.status = data.status
        if data.mold_id:
            run.mold_id = data.mold_id
        if data.quantity_produced is not None:
            run.quantity_produced = data.quantity_produced
        if data.quantity_rejected is not None:
            run.quantity_rejected = data.quantity_rejected

        db.commit()
        db.refresh(run)
        return to_response(run)

    @staticmethod
    def get_all_production(db: Session) -> list[ProductionRunResponse]:
        runs = db.query(ProductionRun).order_by(ProductionRun.id.desc()).all()
        return [to_response(r) for r in runs]

    @staticmethod
    def get_production_by_id(db: Session, run_id: int) -> ProductionRunResponse:
        run = db.query(ProductionRun).filter(ProductionRun.id == run_id).first()
        if not run:
            raise ValueError("Production run not found")
        return to_response(run)


class OperatorService:
    
    @staticmethod
    def create_operator(db: Session, data: OperatorCreate) -> OperatorResponse:
        operator = Operator(**data.model_dump())
        db.add(operator)
        db.commit()
        db.refresh(operator)
        return OperatorResponse.model_validate(operator)
    
    @staticmethod
    def get_all_operators(db: Session) -> list[OperatorResponse]:
        operators = db.query(Operator).filter(Operator.is_active == True).all()
        return [OperatorResponse.model_validate(o) for o in operators]
    
    @staticmethod
    def get_operator(db: Session, operator_id: int) -> OperatorResponse:
        operator = db.query(Operator).filter(Operator.id == operator_id).first()
        if not operator:
            raise ValueError("Operator not found")
        return OperatorResponse.model_validate(operator)