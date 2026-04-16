"""
FOMS MES - Comprehensive Production Data Seeder
Realistic industrial data for injection molding factory
"""

import sys
sys.path.insert(0, '.')
sys.stdout.reconfigure(encoding='utf-8')

from app.core.database import Base, engine, SessionLocal
from app.models.database_models import Branch, MachineSpec, Machine, Mold, ProductionRun, Rayoun, Box, Material, MaintenanceLog
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
    print("\n[1/8] Branches...")
    branches = [
        Branch(name="Main Factory", location="Industrial Zone A, Cairo", is_active=True),
        Branch(name="Warehouse B", location="Industrial Zone B, Cairo", is_active=True),
        Branch(name="Extension Hall C", location="New Capital, Cairo", is_active=True),
    ]
    for b in branches:
        db.add(b)
    db.commit()
    print(f"   {tick()} Created {len(branches)} branches")
    
    # 2. RAYOUNS (Storage Racks)
    print("\n[2/8] Rayouns (Storage Racks)...")
    from app.models.database_models import Rayoun, Box
    rayouns_data = [
        {"name": "A", "description": "Main Factory Storage Row A", "boxes_count": 10},
        {"name": "B", "description": "Main Factory Storage Row B", "boxes_count": 10},
        {"name": "C", "description": "Extension Hall Storage Row C", "boxes_count": 8},
    ]
    rayoun_ids = []
    for r in rayouns_data:
        rayoun = Rayoun(name=r["name"], description=r["description"], is_active=True)
        db.add(rayoun)
        db.flush()
        rayoun_ids.append(rayoun.id)
        for i in range(1, r["boxes_count"] + 1):
            box = Box(box_number=f"{r['name']}{i}", rayoun_id=rayoun.id, position=i, capacity=6, status="available")
            db.add(box)
    db.commit()
    print(f"   {tick()} Created {len(rayouns_data)} rayouns with boxes")
    
    # 3. MACHINE SPECIFICATIONS
    print("\n[3/8] Machine Specifications (90T - 800T)...")
    specs_count = 0
    for spec_data in MACHINE_SPECS_CATALOG.values():
        spec = MachineSpec(**spec_data)
        db.add(spec)
        specs_count += 1
    db.commit()
    print(f"   {tick()} Created {specs_count} machine specifications")
    
    # 4. MACHINES - 20 machines
    print("\n[4/8] Machine Instances...")
    machines = [
        # Main Factory - Haitian Mars Series (Branch 1)
        {"machine_code": "90T/1", "branch_id": 1, "spec_id": 1, "serial_number": "HM90-2021-001", "status": "running", "sequence": 1},
        {"machine_code": "90T/2", "branch_id": 1, "spec_id": 1, "serial_number": "HM90-2021-002", "status": "running", "sequence": 2},
        {"machine_code": "90T/3", "branch_id": 1, "spec_id": 1, "serial_number": "HM90-2022-001", "status": "idle", "sequence": 3},
        {"machine_code": "120T/1", "branch_id": 1, "spec_id": 2, "serial_number": "HM120-2021-001", "status": "running", "sequence": 1},
        {"machine_code": "120T/2", "branch_id": 1, "spec_id": 2, "serial_number": "HM120-2022-001", "status": "idle", "sequence": 2},
        {"machine_code": "160T/1", "branch_id": 1, "spec_id": 3, "serial_number": "HM160-2020-001", "status": "running", "sequence": 1},
        {"machine_code": "160T/2", "branch_id": 1, "spec_id": 3, "serial_number": "HM160-2021-003", "status": "maintenance", "sequence": 2},
        {"machine_code": "200T/1", "branch_id": 1, "spec_id": 4, "serial_number": "HM200-2020-001", "status": "running", "sequence": 1},
        {"machine_code": "250T/1", "branch_id": 1, "spec_id": 5, "serial_number": "HM250-2019-001", "status": "running", "sequence": 1},
        {"machine_code": "280T/1", "branch_id": 1, "spec_id": 6, "serial_number": "HM280-2020-001", "status": "idle", "sequence": 1},
        
        # Warehouse B (Branch 2)
        {"machine_code": "90T/4", "branch_id": 2, "spec_id": 1, "serial_number": "HM90-2022-002", "status": "idle", "sequence": 4},
        {"machine_code": "120T/3", "branch_id": 2, "spec_id": 2, "serial_number": "HM120-2022-002", "status": "running", "sequence": 3},
        {"machine_code": "160T/3", "branch_id": 2, "spec_id": 3, "serial_number": "HM160-2022-001", "status": "running", "sequence": 3},
        {"machine_code": "250T/2", "branch_id": 2, "spec_id": 5, "serial_number": "HM250-2020-002", "status": "maintenance", "sequence": 2},
        {"machine_code": "380T/2", "branch_id": 2, "spec_id": 7, "serial_number": "HM380-2020-001", "status": "running", "sequence": 2},
        {"machine_code": "450T/1", "branch_id": 2, "spec_id": 8, "serial_number": "HM450-2018-001", "status": "running", "sequence": 1},
        
        # Extension Hall C (Branch 3)
        {"machine_code": "280T/2", "branch_id": 3, "spec_id": 6, "serial_number": "HM280-2021-001", "status": "running", "sequence": 2},
        {"machine_code": "380T/3", "branch_id": 3, "spec_id": 7, "serial_number": "HM380-2021-002", "status": "running", "sequence": 3},
        {"machine_code": "450T/2", "branch_id": 3, "spec_id": 8, "serial_number": "HM450-2020-001", "status": "running", "sequence": 2},
        {"machine_code": "470T/1", "branch_id": 3, "spec_id": 9, "serial_number": "HM470-2019-001", "status": "running", "sequence": 1},
        {"machine_code": "800T/1", "branch_id": 3, "spec_id": 10, "serial_number": "HM800-2018-001", "status": "running", "sequence": 1},
    ]
    
    for m in machines:
        db.add(Machine(**m))
    db.commit()
    print(f"   {tick()} Created {len(machines)} machine instances")
    
    # 5. MOLDS - 50 molds
    print("\n[5/8] Production Molds...")
    molds = [
        # Small parts (90T-120T) - 15 molds
        {"mold_code": "MOLD-001", "length_mm": 180, "width_mm": 120, "height_mm": 80, 
         "weight_kg": 18, "required_tonnage": 90, "required_shot_volume": 65, 
         "cavities": 8, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-002", "length_mm": 200, "width_mm": 150, "height_mm": 90, 
         "weight_kg": 25, "required_tonnage": 90, "required_shot_volume": 80, 
         "cavities": 6, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-003", "length_mm": 250, "width_mm": 180, "height_mm": 100, 
         "weight_kg": 35, "required_tonnage": 120, "required_shot_volume": 120, 
         "cavities": 4, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-004", "length_mm": 190, "width_mm": 130, "height_mm": 85, 
         "weight_kg": 20, "required_tonnage": 90, "required_shot_volume": 70, 
         "cavities": 8, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-005", "length_mm": 210, "width_mm": 160, "height_mm": 95, 
         "weight_kg": 28, "required_tonnage": 90, "required_shot_volume": 85, 
         "cavities": 6, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-006", "length_mm": 240, "width_mm": 170, "height_mm": 98, 
         "weight_kg": 32, "required_tonnage": 120, "required_shot_volume": 110, 
         "cavities": 4, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-007", "length_mm": 260, "width_mm": 190, "height_mm": 105, 
         "weight_kg": 38, "required_tonnage": 120, "required_shot_volume": 130, 
         "cavities": 4, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-008", "length_mm": 195, "width_mm": 140, "height_mm": 82, 
         "weight_kg": 22, "required_tonnage": 90, "required_shot_volume": 72, 
         "cavities": 8, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-009", "length_mm": 220, "width_mm": 165, "height_mm": 92, 
         "weight_kg": 30, "required_tonnage": 120, "required_shot_volume": 100, 
         "cavities": 6, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-010", "length_mm": 255, "width_mm": 185, "height_mm": 102, 
         "weight_kg": 36, "required_tonnage": 120, "required_shot_volume": 125, 
         "cavities": 4, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-011", "length_mm": 185, "width_mm": 125, "height_mm": 78, 
         "weight_kg": 17, "required_tonnage": 90, "required_shot_volume": 60, 
         "cavities": 8, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-012", "length_mm": 205, "width_mm": 155, "height_mm": 88, 
         "weight_kg": 26, "required_tonnage": 90, "required_shot_volume": 78, 
         "cavities": 6, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-013", "length_mm": 245, "width_mm": 175, "height_mm": 98, 
         "weight_kg": 34, "required_tonnage": 120, "required_shot_volume": 115, 
         "cavities": 4, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-014", "length_mm": 270, "width_mm": 200, "height_mm": 110, 
         "weight_kg": 42, "required_tonnage": 120, "required_shot_volume": 140, 
         "cavities": 4, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-015", "length_mm": 230, "width_mm": 168, "height_mm": 96, 
         "weight_kg": 31, "required_tonnage": 90, "required_shot_volume": 90, 
         "cavities": 6, "steel_type": "P20", "status": "in_storage"},
        
        # Medium parts (160T-250T) - 15 molds
        {"mold_code": "MOLD-016", "length_mm": 320, "width_mm": 240, "height_mm": 140, 
         "weight_kg": 65, "required_tonnage": 160, "required_shot_volume": 200, 
         "cavities": 2, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-017", "length_mm": 350, "width_mm": 280, "height_mm": 150, 
         "weight_kg": 85, "required_tonnage": 200, "required_shot_volume": 280, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-018", "length_mm": 380, "width_mm": 300, "height_mm": 160, 
         "weight_kg": 95, "required_tonnage": 250, "required_shot_volume": 350, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-019", "length_mm": 310, "width_mm": 230, "height_mm": 135, 
         "weight_kg": 60, "required_tonnage": 160, "required_shot_volume": 190, 
         "cavities": 2, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-020", "length_mm": 340, "width_mm": 265, "height_mm": 145, 
         "weight_kg": 80, "required_tonnage": 160, "required_shot_volume": 250, 
         "cavities": 2, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-021", "length_mm": 360, "width_mm": 290, "height_mm": 155, 
         "weight_kg": 90, "required_tonnage": 200, "required_shot_volume": 300, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-022", "length_mm": 390, "width_mm": 310, "height_mm": 165, 
         "weight_kg": 100, "required_tonnage": 250, "required_shot_volume": 380, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-023", "length_mm": 330, "width_mm": 250, "height_mm": 142, 
         "weight_kg": 70, "required_tonnage": 160, "required_shot_volume": 220, 
         "cavities": 2, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-024", "length_mm": 370, "width_mm": 295, "height_mm": 158, 
         "weight_kg": 92, "required_tonnage": 200, "required_shot_volume": 320, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-025", "length_mm": 400, "width_mm": 320, "height_mm": 170, 
         "weight_kg": 110, "required_tonnage": 250, "required_shot_volume": 400, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-026", "length_mm": 315, "width_mm": 235, "height_mm": 138, 
         "weight_kg": 62, "required_tonnage": 160, "required_shot_volume": 195, 
         "cavities": 2, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-027", "length_mm": 355, "width_mm": 275, "height_mm": 148, 
         "weight_kg": 82, "required_tonnage": 160, "required_shot_volume": 260, 
         "cavities": 2, "steel_type": "P20", "status": "active"},
        {"mold_code": "MOLD-028", "length_mm": 385, "width_mm": 305, "height_mm": 162, 
         "weight_kg": 98, "required_tonnage": 250, "required_shot_volume": 360, 
         "cavities": 1, "steel_type": "H13", "status": "in_maintenance"},
        {"mold_code": "MOLD-029", "length_mm": 365, "width_mm": 285, "height_mm": 152, 
         "weight_kg": 88, "required_tonnage": 200, "required_shot_volume": 290, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-030", "length_mm": 395, "width_mm": 315, "height_mm": 168, 
         "weight_kg": 105, "required_tonnage": 250, "required_shot_volume": 370, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        
        # Large parts (280T-450T) - 12 molds
        {"mold_code": "MOLD-031", "length_mm": 450, "width_mm": 350, "height_mm": 200, 
         "weight_kg": 140, "required_tonnage": 280, "required_shot_volume": 500, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-032", "length_mm": 520, "width_mm": 420, "height_mm": 220, 
         "weight_kg": 180, "required_tonnage": 380, "required_shot_volume": 700, 
         "cavities": 1, "steel_type": "H13", "status": "in_storage"},
        {"mold_code": "MOLD-033", "length_mm": 580, "width_mm": 480, "height_mm": 250, 
         "weight_kg": 220, "required_tonnage": 450, "required_shot_volume": 950, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-034", "length_mm": 440, "width_mm": 340, "height_mm": 195, 
         "weight_kg": 135, "required_tonnage": 280, "required_shot_volume": 480, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-035", "length_mm": 510, "width_mm": 410, "height_mm": 215, 
         "weight_kg": 175, "required_tonnage": 380, "required_shot_volume": 680, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-036", "length_mm": 570, "width_mm": 470, "height_mm": 245, 
         "weight_kg": 210, "required_tonnage": 450, "required_shot_volume": 920, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-037", "length_mm": 460, "width_mm": 360, "height_mm": 205, 
         "weight_kg": 145, "required_tonnage": 280, "required_shot_volume": 520, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-038", "length_mm": 530, "width_mm": 430, "height_mm": 225, 
         "weight_kg": 185, "required_tonnage": 380, "required_shot_volume": 720, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-039", "length_mm": 590, "width_mm": 490, "height_mm": 255, 
         "weight_kg": 230, "required_tonnage": 450, "required_shot_volume": 980, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-040", "length_mm": 470, "width_mm": 365, "height_mm": 202, 
         "weight_kg": 150, "required_tonnage": 280, "required_shot_volume": 540, 
         "cavities": 1, "steel_type": "H13", "status": "in_maintenance"},
        {"mold_code": "MOLD-041", "length_mm": 540, "width_mm": 435, "height_mm": 228, 
         "weight_kg": 190, "required_tonnage": 380, "required_shot_volume": 740, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-042", "length_mm": 600, "width_mm": 500, "height_mm": 260, 
         "weight_kg": 240, "required_tonnage": 450, "required_shot_volume": 1000, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        
        # Extra large (470T-800T) - 8 molds
        {"mold_code": "MOLD-043", "length_mm": 650, "width_mm": 550, "height_mm": 300, 
         "weight_kg": 320, "required_tonnage": 470, "required_shot_volume": 1200, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-044", "length_mm": 800, "width_mm": 650, "height_mm": 350, 
         "weight_kg": 450, "required_tonnage": 650, "required_shot_volume": 1800, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-045", "length_mm": 950, "width_mm": 800, "height_mm": 400, 
         "weight_kg": 650, "required_tonnage": 800, "required_shot_volume": 2500, 
         "cavities": 1, "steel_type": "H13", "status": "in_maintenance"},
        {"mold_code": "MOLD-046", "length_mm": 630, "width_mm": 530, "height_mm": 290, 
         "weight_kg": 300, "required_tonnage": 470, "required_shot_volume": 1150, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-047", "length_mm": 780, "width_mm": 630, "height_mm": 340, 
         "weight_kg": 420, "required_tonnage": 650, "required_shot_volume": 1700, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-048", "length_mm": 930, "width_mm": 780, "height_mm": 390, 
         "weight_kg": 620, "required_tonnage": 800, "required_shot_volume": 2400, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-049", "length_mm": 670, "width_mm": 560, "height_mm": 310, 
         "weight_kg": 340, "required_tonnage": 470, "required_shot_volume": 1250, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
        {"mold_code": "MOLD-050", "length_mm": 850, "width_mm": 700, "height_mm": 380, 
         "weight_kg": 500, "required_tonnage": 650, "required_shot_volume": 2000, 
         "cavities": 1, "steel_type": "H13", "status": "active"},
    ]
    
    for m in molds:
        db.add(Mold(**m))
    db.commit()
    print(f"   {tick()} Created {len(molds)} production molds")
    
    # 6. PRODUCTION RUNS (Real Timestamps)
    print("\n[6/8] Production Runs...")
    runs = [
        # Today runs
{"machine_id": 1, "mold_id": 1, "start_time": "2026-04-15T06:00:00", "finish_time": "2026-04-15T07:30:00",
          "ideal_cycle_time": 10, "actual_cycle_time": 9.5, "quantity_produced": 850, "quantity_rejected": 12, "status": "finished"},
        {"machine_id": 1, "mold_id": 1, "start_time": "2026-04-15T07:45:00", "finish_time": "2026-04-15T09:15:00",
          "ideal_cycle_time": 10, "actual_cycle_time": 9.8, "quantity_produced": 920, "quantity_rejected": 8, "status": "finished"},
        {"machine_id": 2, "mold_id": 2, "start_time": "2026-04-15T06:30:00", "finish_time": "2026-04-15T08:00:00",
          "ideal_cycle_time": 10, "actual_cycle_time": 9.2, "quantity_produced": 780, "quantity_rejected": 15, "status": "finished"},
        {"machine_id": 3, "mold_id": 3, "start_time": "2026-04-15T08:00:00", "finish_time": "2026-04-15T09:30:00",
          "ideal_cycle_time": 12, "actual_cycle_time": 11.5, "quantity_produced": 650, "quantity_rejected": 10, "status": "finished"},
        {"machine_id": 5, "mold_id": 5, "start_time": "2026-04-15T08:30:00",
          "ideal_cycle_time": 16, "actual_cycle_time": 0, "quantity_produced": 0, "quantity_rejected": 0, "status": "running"},
        
        # Yesterday runs
        {"machine_id": 1, "mold_id": 1, "start_time": "2026-04-14T06:00:00", "finish_time": "2026-04-14T07:30:00",
          "ideal_cycle_time": 10, "actual_cycle_time": 9.3, "quantity_produced": 880, "quantity_rejected": 5, "status": "finished"},
        {"machine_id": 3, "mold_id": 4, "start_time": "2026-04-14T08:00:00", "finish_time": "2026-04-14T10:00:00",
          "ideal_cycle_time": 14, "actual_cycle_time": 13.8, "quantity_produced": 520, "quantity_rejected": 8, "status": "finished"},
        {"machine_id": 7, "mold_id": 8, "start_time": "2026-04-14T10:30:00", "finish_time": "2026-04-14T12:00:00",
          "ideal_cycle_time": 24, "actual_cycle_time": 23.2, "quantity_produced": 280, "quantity_rejected": 4, "status": "finished"},
        
        # This week
        {"machine_id": 10, "mold_id": 10, "start_time": "2026-04-13T09:00:00", "finish_time": "2026-04-13T11:00:00",
          "ideal_cycle_time": 30, "actual_cycle_time": 28.5, "quantity_produced": 180, "quantity_rejected": 3, "status": "finished"},
        {"machine_id": 10, "mold_id": 11, "start_time": "2026-04-13T11:30:00", "finish_time": "2026-04-13T14:00:00",
          "ideal_cycle_time": 40, "actual_cycle_time": 38.2, "quantity_produced": 150, "quantity_rejected": 5, "status": "finished"},
        
        # Active/ongoing runs
        {"machine_id": 4, "mold_id": 4, "start_time": "2026-04-15T09:00:00",
          "ideal_cycle_time": 14, "actual_cycle_time": 0, "quantity_produced": 0, "quantity_rejected": 0, "status": "running"},
    ]
    
    for r in runs:
        db.add(ProductionRun(**r))
    db.commit()
    print(f"   {tick()} Created {len(runs)} production runs")
    
    # 7. MATERIALS (Common plastics)
    print("\n[7/8] Materials...")
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
    
    # 8. MAINTENANCE LOGS
    print("\n[8/8] Maintenance Logs...")
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
    print(f"  - Rayouns: {db.query(Rayoun).count()}")
    print(f"  - Boxes: {db.query(Box).count()}")
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