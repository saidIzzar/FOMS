"""
FOMS MES - Comprehensive Production Data Seeder
Realistic industrial data for injection molding factory
"""

import sys
sys.path.insert(0, '.')
sys.stdout.reconfigure(encoding='utf-8')

from app.core.database import Base, engine, SessionLocal
from app.models.database_models import Branch, MachineSpec, Machine, Mold, ProductionRun
from app.core.machine_catalog import MACHINE_SPECS_CATALOG

def tick():
    return "[OK]"

def seed_all():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    print("=" * 60)
    print("FOMS MES - INDUSTRIAL DATA SEEDER")
    print("=" * 60)
    
    # 1. BRANCHES
    print("\n[1/7] Branches...")
    branches = [
        Branch(name="Main Factory", location="Industrial Zone A, Cairo", is_active=True),
        Branch(name="Warehouse B", location="Industrial Zone B, Cairo", is_active=True),
        Branch(name="Extension Hall C", location="New Capital, Cairo", is_active=True),
    ]
    for b in branches:
        db.add(b)
    db.commit()
    print(f"   {tick()} Created {len(branches)} branches")
    
    # 2. MACHINE SPECIFICATIONS
    print("\n[2/7] Machine Specifications (90T - 800T)...")
    specs_count = 0
    for spec_data in MACHINE_SPECS_CATALOG.values():
        spec = MachineSpec(**spec_data)
        db.add(spec)
        specs_count += 1
    db.commit()
    print(f"   {tick()} Created {specs_count} machine specifications")
    
    # 3. MACHINES (Realistic)
    print("\n[3/7] Machine Instances...")
    machines = [
        # Main Factory - Haitian Mars Series
        {"machine_code": "90T/1", "branch_id": 1, "spec_id": 1, "serial_number": "HM90-2021-001", "status": "running", "sequence": 1},
        {"machine_code": "90T/2", "branch_id": 1, "spec_id": 1, "serial_number": "HM90-2021-002", "status": "running", "sequence": 2},
        {"machine_code": "120T/1", "branch_id": 1, "spec_id": 2, "serial_number": "HM120-2021-001", "status": "running", "sequence": 1},
        {"machine_code": "120T/2", "branch_id": 1, "spec_id": 2, "serial_number": "HM120-2022-001", "status": "idle", "sequence": 2},
        {"machine_code": "160T/1", "branch_id": 1, "spec_id": 3, "serial_number": "HM160-2020-001", "status": "running", "sequence": 1},
        {"machine_code": "160T/2", "branch_id": 1, "spec_id": 3, "serial_number": "HM160-2021-003", "status": "maintenance", "sequence": 2},
        {"machine_code": "200T/1", "branch_id": 1, "spec_id": 4, "serial_number": "HM200-2020-001", "status": "running", "sequence": 1},
        {"machine_code": "250T/1", "branch_id": 1, "spec_id": 5, "serial_number": "HM250-2019-001", "status": "running", "sequence": 1},
        {"machine_code": "280T/1", "branch_id": 1, "spec_id": 6, "serial_number": "HM280-2020-001", "status": "idle", "sequence": 1},
        {"machine_code": "380T/1", "branch_id": 1, "spec_id": 7, "serial_number": "HM380-2019-001", "status": "running", "sequence": 1},
        
        # Warehouse B
        {"machine_code": "90T/3", "branch_id": 2, "spec_id": 1, "serial_number": "HM90-2022-001", "status": "idle", "sequence": 3},
        {"machine_code": "120T/3", "branch_id": 2, "spec_id": 2, "serial_number": "HM120-2022-002", "status": "running", "sequence": 3},
        {"machine_code": "160T/3", "branch_id": 2, "spec_id": 3, "serial_number": "HM160-2022-001", "status": "running", "sequence": 3},
        {"machine_code": "250T/2", "branch_id": 2, "spec_id": 5, "serial_number": "HM250-2020-002", "status": "maintenance", "sequence": 2},
        {"machine_code": "450T/1", "branch_id": 2, "spec_id": 8, "serial_number": "HM450-2018-001", "status": "running", "sequence": 1},
        
        # Extension Hall C (Large machines)
        {"machine_code": "380T/2", "branch_id": 3, "spec_id": 7, "serial_number": "HM380-2021-002", "status": "running", "sequence": 2},
        {"machine_code": "450T/2", "branch_id": 3, "spec_id": 8, "serial_number": "HM450-2020-001", "status": "running", "sequence": 2},
        {"machine_code": "470T/1", "branch_id": 3, "spec_id": 9, "serial_number": "HM470-2019-001", "status": "running", "sequence": 1},
        {"machine_code": "800T/1", "branch_id": 3, "spec_id": 10, "serial_number": "HM800-2018-001", "status": "running", "sequence": 1},
    ]
    
    for m in machines:
        db.add(Machine(**m))
    db.commit()
    print(f"   {tick()} Created {len(machines)} machine instances")
    
    # 4. MOLDS (Realistic Production Molds)
    print("\n[4/7] Production Molds...")
    molds = [
        # Small parts (90T-120T)
        {"mold_code": "MOLD-001", "length_mm": 180, "width_mm": 120, "height_mm": 80, 
         "weight_kg": 18, "required_tonnage": 90, "required_shot_volume": 65, 
         "cavities": 8, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-002", "length_mm": 200, "width_mm": 150, "height_mm": 90, 
         "weight_kg": 25, "required_tonnage": 90, "required_shot_volume": 80, 
         "cavities": 6, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-003", "length_mm": 250, "width_mm": 180, "height_mm": 100, 
         "weight_kg": 35, "required_tonnage": 120, "required_shot_volume": 120, 
         "cavities": 4, "steel_type": "P20", "status": "active"},
        
        # Medium parts (160T-250T)
        {"mold_code": "MOLD-004", "length_mm": 320, "width_mm": 240, "height_mm": 140, 
         "weight_kg": 65, "required_tonnage": 160, "required_shot_volume": 200, 
         "cavities": 2, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-005", "length_mm": 350, "width_mm": 280, "height_mm": 150, 
         "weight_kg": 85, "required_tonnage": 200, "required_shot_volume": 280, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-006", "length_mm": 380, "width_mm": 300, "height_mm": 160, 
         "weight_kg": 95, "required_tonnage": 250, "required_shot_volume": 350, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        
        # Large parts (280T-450T)
        {"mold_code": "MOLD-007", "length_mm": 450, "width_mm": 350, "height_mm": 200, 
         "weight_kg": 140, "required_tonnage": 280, "required_shot_volume": 500, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-008", "length_mm": 520, "width_mm": 420, "height_mm": 220, 
         "weight_kg": 180, "required_tonnage": 380, "required_shot_volume": 700, 
         "cavities": 1, "steel_type": "H13", "status": "in_storage"},
        {"mold_code": "MOLD-009", "length_mm": 580, "width_mm": 480, "height_mm": 250, 
         "weight_kg": 220, "required_tonnage": 450, "required_shot_volume": 950, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        
        # Extra large (470T-800T)
        {"mold_code": "MOLD-010", "length_mm": 650, "width_mm": 550, "height_mm": 300, 
         "weight_kg": 320, "required_tonnage": 470, "required_shot_volume": 1200, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-011", "length_mm": 800, "width_mm": 650, "height_mm": 350, 
         "weight_kg": 450, "required_tonnage": 650, "required_shot_volume": 1800, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-012", "length_mm": 950, "width_mm": 800, "height_mm": 400, 
         "weight_kg": 650, "required_tonnage": 800, "required_shot_volume": 2500, 
         "cavities": 1, "steel_type": "H13", "status": "in_maintenance"},
    ]
    
    for m in molds:
        db.add(Mold(**m))
    db.commit()
    print(f"   {tick()} Created {len(molds)} production molds")
    
    # 5. PRODUCTION RUNS (Real Timestamps)
    print("\n[5/7] Production Runs...")
    runs = [
        # Today runs
        {"machine_id": 1, "mold_id": 1, "start_time": "2026-04-15T06:00:00", "end_time": "2026-04-15T07:30:00",
         "ideal_cycle_time": 10, "actual_cycle_time": 9.5, "quantity_produced": 850, "quantity_rejected": 12, "status": "completed"},
        {"machine_id": 1, "mold_id": 1, "start_time": "2026-04-15T07:45:00", "end_time": "2026-04-15T09:15:00",
         "ideal_cycle_time": 10, "actual_cycle_time": 9.8, "quantity_produced": 920, "quantity_rejected": 8, "status": "completed"},
        {"machine_id": 2, "mold_id": 2, "start_time": "2026-04-15T06:30:00", "end_time": "2026-04-15T08:00:00",
         "ideal_cycle_time": 10, "actual_cycle_time": 9.2, "quantity_produced": 780, "quantity_rejected": 15, "status": "completed"},
        {"machine_id": 3, "mold_id": 3, "start_time": "2026-04-15T08:00:00", "end_time": "2026-04-15T09:30:00",
         "ideal_cycle_time": 12, "actual_cycle_time": 11.5, "quantity_produced": 650, "quantity_rejected": 10, "status": "completed"},
        {"machine_id": 5, "mold_id": 5, "start_time": "2026-04-15T08:30:00",
         "ideal_cycle_time": 16, "actual_cycle_time": 0, "quantity_produced": 0, "quantity_rejected": 0, "status": "running"},
        
        # Yesterday runs
        {"machine_id": 1, "mold_id": 1, "start_time": "2026-04-14T06:00:00", "end_time": "2026-04-14T07:30:00",
         "ideal_cycle_time": 10, "actual_cycle_time": 9.3, "quantity_produced": 880, "quantity_rejected": 5, "status": "completed"},
        {"machine_id": 3, "mold_id": 4, "start_time": "2026-04-14T08:00:00", "end_time": "2026-04-14T10:00:00",
         "ideal_cycle_time": 14, "actual_cycle_time": 13.8, "quantity_produced": 520, "quantity_rejected": 8, "status": "completed"},
        {"machine_id": 7, "mold_id": 8, "start_time": "2026-04-14T10:30:00", "end_time": "2026-04-14T12:00:00",
         "ideal_cycle_time": 24, "actual_cycle_time": 23.2, "quantity_produced": 280, "quantity_rejected": 4, "status": "completed"},
        
        # This week
        {"machine_id": 10, "mold_id": 10, "start_time": "2026-04-13T09:00:00", "end_time": "2026-04-13T11:00:00",
         "ideal_cycle_time": 30, "actual_cycle_time": 28.5, "quantity_produced": 180, "quantity_rejected": 3, "status": "completed"},
        {"machine_id": 10, "mold_id": 11, "start_time": "2026-04-13T11:30:00", "end_time": "2026-04-13T14:00:00",
         "ideal_cycle_time": 40, "actual_cycle_time": 38.2, "quantity_produced": 150, "quantity_rejected": 5, "status": "completed"},
        
        # Active/ongoing runs
        {"machine_id": 4, "mold_id": 4, "start_time": "2026-04-15T09:00:00",
         "ideal_cycle_time": 14, "actual_cycle_time": 0, "quantity_produced": 0, "quantity_rejected": 0, "status": "running"},
    ]
    
    for r in runs:
        db.add(ProductionRun(**r))
    db.commit()
    print(f"   {tick()} Created {len(runs)} production runs")
    
    # 6. MATERIALS (Common plastics)
    print("\n[6/7] Materials...")
    from app.models.database_models import Material
    materials = [
        {"code": "PP-BC7500", "name": "Polypropylene Copolymer", "grade": "BC7500", "supplier": "SABIC", "density": 0.9, "mfi": 8.5, "status": "active"},
        {"code": "ABS-A23", "name": "ABS Resin", "grade": "A23", "supplier": "LG Chemical", "density": 1.04, "mfi": 22, "status": "active"},
        {"code": "PA66-GF30", "name": "Nylon 66 30% Glass", "grade": "GF30", "supplier": "DuPont", "density": 1.35, "mfi": 25, "status": "active"},
        {"code": "PC-2800", "name": "Polycarbonate", "grade": "2800", "supplier": "SABIC", "density": 1.2, "mfi": 12, "status": "active"},
        {"code": "PE-HD5218", "name": "HDPE Resin", "grade": "HD5218", "supplier": "Total", "density": 0.96, "mfi": 18, "status": "active"},
        {"code": "POM-M90", "name": "POM Copolymer", "grade": "M90-44", "supplier": "DuPont", "density": 1.41, "mfi": 9, "status": "active"},
        {"code": "PS-484", "name": "General Purpose PS", "grade": "484", "supplier": "BASF", "density": 1.05, "mfi": 14, "status": "active"},
    ]
    
    for m in materials:
        db.add(Material(**m))
    db.commit()
    print(f"   {tick()} Created {len(materials)} materials")
    
    # 7. MAINTENANCE LOGS
    print("\n[7/7] Maintenance Logs...")
    from app.models.database_models import MaintenanceLog
    maintenance_logs = [
        {"machine_id": 7, "log_type": "preventive", "description": "Scheduled oil change", "performed_by": "Ahmed Hassan", "status": "completed", "log_date": "2026-04-10"},
        {"machine_id": 7, "log_type": "preventive", "description": " Hydraulic system check", "performed_by": "Mohamed Ali", "status": "completed", "log_date": "2026-04-05"},
        {"machine_id": 6, "log_type": "corrective", "description": "Screw replacement", "performed_by": "Ahmed Hassan", "status": "completed", "log_date": "2026-04-01"},
        {"machine_id": 3, "log_type": "inspection", "description": "Annual inspection", "performed_by": "Safety Team", "status": "completed", "log_date": "2026-03-28"},
        {"machine_id": 4, "log_type": "preventive", "description": "Mold alignment check", "performed_by": "Operator", "status": "completed", "log_date": "2026-04-12"},
        {"machine_id": 13, "log_type": "corrective", "description": "Heater band replacement", "performed_by": "Electrician", "status": "in_progress", "log_date": "2026-04-15"},
    ]
    
    for log in maintenance_logs:
        db.add(MaintenanceLog(**log))
    db.commit()
    print(f"   {tick()} Created {len(maintenance_logs)} maintenance logs")
    
    # SUMMARY
    print("\n" + "=" * 60)
    print("INDUSTRIAL DATA SEED COMPLETE!")
    print("=" * 60)
    print(f"  - Branches: {db.query(Branch).count()}")
    print(f"  - Machine Specs: {db.query(MachineSpec).count()}")
    print(f"  - Machines: {db.query(Machine).count()}")
    print(f"  - Molds: {db.query(Mold).count()}")
    print(f"  - Production Runs: {db.query(ProductionRun).count()}")
    print(f"  - Materials: {db.query(Material).count()}")
    print(f"  - Maintenance Logs: {db.query(MaintenanceLog).count()}")
    print("\n" + "=" * 60)
    
    db.close()
    print("\nFOMS MES is ready for production use!")

if __name__ == "__main__":
    seed_all()