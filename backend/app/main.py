from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api.main import router as api_router
from app.api.auth import router as auth_router
from app.routes.rayoun import router as rayoun_router
import logging
import sqlite3
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_migrations():
    """Run database migrations to fix schema"""
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    if not Path(db_path).exists():
        logger.warning(f"Database not found: {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check molds table for rayoun_id and box_id
        cursor.execute("PRAGMA table_info(molds)")
        mold_cols = {c[1] for c in cursor.fetchall()}

        if "rayoun_id" not in mold_cols:
            logger.info("Adding rayoun_id column to molds...")
            cursor.execute("ALTER TABLE molds ADD COLUMN rayoun_id INTEGER REFERENCES rayouns(id)")
            conn.commit()
            logger.info("Migration: rayoun_id added")

        if "box_id" not in mold_cols:
            logger.info("Adding box_id column to molds...")
            cursor.execute("ALTER TABLE molds ADD COLUMN box_id INTEGER REFERENCES boxes(id)")
            conn.commit()
            logger.info("Migration: box_id added")

        # Check boxes table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='boxes'")
        if not cursor.fetchone():
            logger.info("Creating boxes table...")
            cursor.execute("""
                CREATE TABLE boxes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    box_number TEXT NOT NULL,
                    rayoun_id INTEGER REFERENCES rayouns(id),
                    position INTEGER DEFAULT 1,
                    capacity INTEGER DEFAULT 6,
                    status TEXT DEFAULT 'available'
                )
            """)
            conn.commit()
            logger.info("Migration: boxes table created")

        # Check rayouns table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='rayouns'")
        if not cursor.fetchone():
            logger.info("Creating rayouns table...")
            cursor.execute("""
                CREATE TABLE rayouns (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    description TEXT,
                    is_active INTEGER DEFAULT 1
                )
            """)
            conn.commit()
            logger.info("Migration: rayouns table created")

        # Check production_runs table for new columns
        cursor.execute("PRAGMA table_info(production_runs)")
        run_cols = {c[1] for c in cursor.fetchall()}

        new_run_fields = {
            "mold_mount_time": "ALTER TABLE production_runs ADD COLUMN mold_mount_time TEXT",
            "mold_change_time": "ALTER TABLE production_runs ADD COLUMN mold_change_time TEXT",
            "finish_time": "ALTER TABLE production_runs ADD COLUMN finish_time TEXT",
            "total_change_minutes": "ALTER TABLE production_runs ADD COLUMN total_change_minutes INTEGER DEFAULT 0"
        }

        for col, sql in new_run_fields.items():
            if col not in run_cols:
                logger.info(f"Adding {col} column to production_runs...")
                cursor.execute(sql)
                conn.commit()
                logger.info(f"Migration: {col} added")

        logger.info("Migrations complete")
    except Exception as e:
        logger.error(f"Migration error: {e}")
    finally:
        conn.close()


# Run migrations
run_migrations()

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Industrial MES System for Injection Molding"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(api_router, prefix=settings.API_V1_PREFIX)
app.include_router(rayoun_router)

logger.info(f"API prefix: {settings.API_V1_PREFIX}")
logger.info(f"Registered routes: {[r.path for r in app.routes]}")

# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}

@app.get("/")
def root():
    return {"message": "FOMS MES API", "version": settings.APP_VERSION}