from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.database_models import Rayoun, Box, Mold

router = APIRouter(prefix="/api/v1/rayouns", tags=["Rayouns"])

@router.get("")
def get_rayouns(db: Session = Depends(get_db)):
    """Get all rayouns (flat list)"""
    try:
        rayouns = db.query(Rayoun).filter(Rayoun.is_active == True).all()
        return [{"id": r.id, "name": r.name, "description": r.description} for r in rayouns]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tree")
def get_rayoun_tree(db: Session = Depends(get_db)):
    """Get rayoun tree with boxes and molds"""
    try:
        rayouns = db.query(Rayoun).filter(Rayoun.is_active == True).all()
        if not rayouns:
            return []

        result = []
        for r in rayouns:
            boxes = db.query(Box).filter(Box.rayoun_id == r.id).order_by(Box.position).all()
            box_data = []
            for b in boxes:
                molds = db.query(Mold).filter(Mold.box_id == b.id, Mold.is_active == True).all()
                mold_list = []
                for m in molds:
                    mold_list.append({
                        "id": m.id,
                        "name": m.mold_code,
                        "length_mm": m.length_mm,
                        "width_mm": m.width_mm,
                        "cavities": m.cavities,
                        "steel_type": m.steel_type,
                        "required_tonnage": m.required_tonnage,
                        "status": m.status
                    })
                box_data.append({
                    "id": b.id,
                    "name": b.box_number,
                    "capacity": b.capacity,
                    "status": b.status,
                    "molds": mold_list
                })

            result.append({
                "id": r.id,
                "name": r.name,
                "description": r.description,
                "boxes": box_data,
                "molds": []
            })
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
