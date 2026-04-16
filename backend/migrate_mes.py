from sqlalchemy import inspect, text
from app.core.database import engine, Base
from app.models.database_models import Branch, MachineSpec, Machine, Mold, Rayoun, Box, Operator, ProductionRun

def run_migration():
    """Run database migration for MES features"""
    
    print("Running MES database migration...")
    
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    print(f"Existing tables: {existing_tables}")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✓ Created/updated all tables")
    
    # Check if operators table was created
    if 'operators' in inspector.get_table_names():
        print("✓ Operators table exists")
    
    # Check production_runs columns
    result = engine.execute(text("PRAGMA table_info(production_runs)"))
    columns = {row[1] for row in result}
    print(f"Production runs columns: {columns}")
    
    # Add missing columns to production_runs
    with engine.begin() as conn:
        if 'operator_id' not in columns:
            conn.execute(text("ALTER TABLE production_runs ADD COLUMN operator_id INTEGER REFERENCES operators(id)"))
            print("✓ Added operator_id column")
        
        if 'date' not in columns:
            conn.execute(text("ALTER TABLE production_runs ADD COLUMN date VARCHAR(10)"))
            print("✓ Added date column")
        
        if 'total_change_minutes' not in columns:
            conn.execute(text("ALTER TABLE production_runs ADD COLUMN total_change_minutes REAL DEFAULT 0.0"))
            print("✓ Added total_change_minutes column")
    
    # Seed some sample operators if none exist
    result = engine.execute(text("SELECT COUNT(*) FROM operators"))
    if result.fetchone()[0] == 0:
        with engine.begin() as conn:
            conn.execute(text("""
                INSERT INTO operators (name, employee_id, department, is_active) VALUES
                ('Ahmed Hassan', 'EMP001', 'Production', 1),
                ('Mohamed Ali', 'EMP002', 'Production', 1),
                ('Said Mohamed', 'EMP003', 'Production', 1),
                ('Youssef Ahmed', 'EMP004', 'Production', 1),
                ('Ali Salem', 'EMP005', 'Quality', 1)
            """))
        print("✓ Seeded sample operators")
    
    print("\n✓ Migration completed successfully!")
    print("\nNew features:")
    print("  - Operator management")
    print("  - Time tracking (start_time, finish_time)")
    print("  - Mold events (mount, change)")
    print("  - Auto-calculated change duration")
    print("  - Production status tracking")

if __name__ == "__main__":
    run_migration()