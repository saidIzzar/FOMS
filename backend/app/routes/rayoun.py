from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.rayoun_service import RayounService, BoxService, MoldAssignmentService
from app.schemas import (
    RayounCreate, RayounResponse, RayounWithBoxesResponse,
    BoxCreate, BoxResponse,
    AssignMoldToBoxRequest, UpdateMoldLocationRequest,
    MoldResponse
)
from app.models.database_models import Rayoun, Box, Mold

router = APIRouter(prefix="/api/v1/rayouns", tags=["Rayouns"])

# ==================== TREE (FULL HIERARCHY) ====================

@router.get("/tree")
def get_rayoun_tree(db: Session = Depends(get_db)):
    """
    GET /api/v1/rayouns/tree
    Returns full hierarchy: rayouns → boxes → molds.
    Never returns null or broken relations.
    Auto-seeds if empty.
    """
    try:
        # Ensure rayouns exist
        rayouns = db.query(Rayoun).filter(Rayoun.is_active == True).all()
        if not rayouns:
            _seed_default_data(db)
            rayouns = db.query(Rayoun).filter(Rayoun.is_active == True).all()

        result = []
        for r in sorted(rayouns, key=lambda x: x.name):
            boxes = db.query(Box).filter(
                Box.rayoun_id == r.id,
                Box.status != 'deleted'
            ).order_by(Box.position).all()

            # Ensure at least 3 boxes per rayoun
            if not boxes:
                for i in range(1, 4):
                    b = Box(
                        box_number=f"{r.name}{i}",
                        rayoun_id=r.id,
                        position=i,
                        capacity=6,
                        status="available"
                    )
                    db.add(b)
                db.commit()
                boxes = db.query(Box).filter(
                    Box.rayoun_id == r.id,
                    Box.status != 'deleted'
                ).order_by(Box.position).all()

            box_list = []
            for box in boxes:
                molds = db.query(Mold).filter(
                    Mold.box_id == box.id,
                    Mold.is_active == True
                ).all()

                mold_list = []
                for m in molds:
                    mold_list.append({
                        "id": m.id,
                        "mold_code": m.mold_code,
                        "required_tonnage": m.required_tonnage,
                        "box_id": m.box_id,
                        "location": m.location,
                        "is_active": m.is_active,
                        "cavities": m.cavities,
                        "steel_type": m.steel_type,
                    })

                box_list.append({
                    "id": box.id,
                    "box_number": box.box_number,
                    "rayoun_id": box.rayoun_id,
                    "position": box.position,
                    "capacity": box.capacity,
                    "status": box.status,
                    "molds": mold_list
                })

            result.append({
                "id": r.id,
                "name": r.name,
                "description": r.description or f"Rayoun {r.name} Storage",
                "is_active": r.is_active,
                "boxes": box_list
            })

        return result

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch rayoun tree: {str(e)}")


# ==================== SEED ====================

@router.post("/seed")
def seed_rayouns(db: Session = Depends(get_db)):
    """
    POST /api/v1/rayouns/seed
    Initializes rayouns, boxes, and capacities.
    System must always recover from empty state.
    """
    result = _seed_default_data(db)
    return {
        "message": "Seed complete",
        "rayouns": result["rayouns"],
        "boxes": result["boxes"]
    }


def _seed_default_data(db: Session) -> dict:
    """Internal: seed rayouns A/B/C and their boxes. Idempotent."""
    rayoun_names = ["A", "B", "C"]
    seeded_rayouns = 0
    seeded_boxes = 0

    for name in rayoun_names:
        existing = db.query(Rayoun).filter(Rayoun.name == name).first()
        if not existing:
            r = Rayoun(
                name=name,
                description=f"Rayoun {name} Storage Area",
                is_active=True
            )
            db.add(r)
            seeded_rayouns += 1
    db.commit()

    # Seed boxes (3 per rayoun, capacity 6 each)
    for name in rayoun_names:
        r = db.query(Rayoun).filter(Rayoun.name == name).first()
        if not r:
            continue
        for i in range(1, 4):
            existing_box = db.query(Box).filter(
                Box.rayoun_id == r.id,
                Box.position == i
            ).first()
            if not existing_box:
                b = Box(
                    box_number=f"{name}{i}",
                    rayoun_id=r.id,
                    position=i,
                    capacity=6,
                    status="available"
                )
                db.add(b)
                seeded_boxes += 1
    db.commit()

    return {"rayouns": seeded_rayouns, "boxes": seeded_boxes}


# ==================== RAYOUNS CRUD ====================

@router.get("", response_model=list[RayounResponse])
def get_rayouns(db: Session = Depends(get_db)):
    """Get all rayouns (flat list)"""
    return RayounService.get_all_rayouns(db)

@router.post("", response_model=RayounResponse)
def create_rayoun(data: RayounCreate, db: Session = Depends(get_db)):
    """Create a new rayoun"""
    try:
        return RayounService.create_rayoun(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{rayoun_id}", response_model=RayounResponse)
def get_rayoun(rayoun_id: int, db: Session = Depends(get_db)):
    """Get specific rayoun"""
    try:
        return RayounService.get_rayoun(db, rayoun_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{rayoun_id}")
def delete_rayoun(rayoun_id: int, db: Session = Depends(get_db)):
    """Delete (deactivate) a rayoun"""
    try:
        RayounService.delete_rayoun(db, rayoun_id)
        return {"message": "Rayoun deleted"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ==================== BOXES ====================

@router.get("/{rayoun_id}/boxes", response_model=list[BoxResponse])
def get_rayoun_boxes(rayoun_id: int, db: Session = Depends(get_db)):
    """Get boxes for a specific rayoun"""
    return BoxService.get_boxes_by_rayoun(db, rayoun_id)

@router.post("/boxes", response_model=BoxResponse)
def create_box(data: BoxCreate, db: Session = Depends(get_db)):
    """Create a new box in a rayoun"""
    try:
        return BoxService.create_box(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/boxes/{box_id}/status", response_model=BoxResponse)
def update_box_status(box_id: int, status: str, db: Session = Depends(get_db)):
    """Update box status"""
    try:
        return BoxService.update_box(db, box_id, status)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ==================== MOLD ASSIGNMENTS ====================

@router.post("/molds/assign", response_model=MoldResponse)
def assign_mold_to_box(data: AssignMoldToBoxRequest, db: Session = Depends(get_db)):
    """Assign a mold to a box"""
    try:
        return MoldAssignmentService.assign_mold_to_box(db, data.mold_id, data.box_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/molds/{mold_id}/remove", response_model=MoldResponse)
def remove_mold_from_box(mold_id: int, db: Session = Depends(get_db)):
    """Remove a mold from its box"""
    try:
        return MoldAssignmentService.remove_mold_from_box(db, mold_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/molds/{mold_id}/location", response_model=MoldResponse)
def update_mold_location(mold_id: int, data: UpdateMoldLocationRequest, db: Session = Depends(get_db)):
    """Update mold location metadata"""
    try:
        return MoldAssignmentService.update_mold_location(db, mold_id, data.location)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/assign-molds")
def assign_molds(db: Session = Depends(get_db)):
    """Auto-assign unassigned molds to available boxes"""
    count = BoxService.assign_molds_to_boxes(db)
    return {"message": f"Assigned {count} molds to boxes"}