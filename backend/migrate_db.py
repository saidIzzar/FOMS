"""
Database Migration Script for FOMS
Adds missing columns and fixes schema inconsistencies
"""
import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).parent / "foms_mes.db"


def migrate():
    """Run database migrations"""

    if not DB_PATH.exists():
        print(f"Database not found at {DB_PATH}")
        return False

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("Starting migration...")

    # 1. Check and add rayoun_id to molds table
    cursor.execute("PRAGMA table_info(molds)")
    mold_cols = {c[1] for c in cursor.fetchall()}

    if "rayoun_id" not in mold_cols:
        print("Adding rayoun_id column to molds...")
        cursor.execute("ALTER TABLE molds ADD COLUMN rayoun_id INTEGER REFERENCES rayouns(id)")
        print("  Added rayoun_id column")
    else:
        print("  rayoun_id already exists")

    # 2. Check boxes table integrity
    cursor.execute("PRAGMA table_info(boxes)")
    box_cols = {c[1] for c in cursor.fetchall()}

    required_box_cols = ["id", "box_number", "rayoun_id", "position", "capacity", "status"]
    for col in required_box_cols:
        if col not in box_cols:
            print(f"WARNING: Missing column in boxes: {col}")

    # 3. Verify rayouns table
    cursor.execute("PRAGMA table_info(rayouns)")
    rayoun_cols = {c[1] for c in cursor.fetchall()}

    if "id" not in rayoun_cols:
        print("ERROR: rayouns table missing id column!")
        return False

    # 4. Create indexes if missing
    cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_molds_rayoun'")
    if not cursor.fetchone():
        cursor.execute("CREATE INDEX idx_molds_rayoun ON molds(rayoun_id)")
        print("Created index idx_molds_rayoun")

    cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_molds_box'")
    if not cursor.fetchone():
        cursor.execute("CREATE INDEX idx_molds_box ON molds(box_id)")
        print("Created index idx_molds_box")

    conn.commit()

    # Verify final state
    cursor.execute("PRAGMA table_info(molds)")
    mold_cols = {c[1] for c in cursor.fetchall()}
    print(f"\nFinal molds columns: {sorted(mold_cols)}")

    print("\nMigration complete!")
    return True


if __name__ == "__main__":
    migrate()