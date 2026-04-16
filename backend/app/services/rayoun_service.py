from sqlalchemy.orm import Session
from app.models.database_models import Rayoun, Box, Mold
from app.schemas import (
    RayounCreate, RayounResponse, RayounWithBoxesResponse,
    BoxCreate, BoxResponse, BoxWithMoldsResponse,
    MoldCreate, MoldResponse
)

class RayounService:
    """Rayoun storage management service"""
    
    @staticmethod
    def create_rayoun(db: Session, data: RayounCreate) -> RayounResponse:
        rayoun = Rayoun(
            name=data.name.upper(),
            description=data.description
        )
        db.add(rayoun)
        db.commit()
        db.refresh(rayoun)
        return RayounResponse.model_validate(rayoun)
    
    @staticmethod
    def get_all_rayouns(db: Session) -> list[RayounResponse]:
        rayouns = db.query(Rayoun).filter(Rayoun.is_active == True).all()
        return [RayounResponse.model_validate(r) for r in rayouns]
    
    @staticmethod
    def get_rayoun(db: Session, rayoun_id: int) -> RayounResponse:
        rayoun = db.query(Rayoun).filter(Rayoun.id == rayoun_id).first()
        if not rayoun:
            raise ValueError(f"Rayoun {rayoun_id} not found")
        return RayounResponse.model_validate(rayoun)
    
    @staticmethod
    def get_rayouns_with_boxes(db: Session) -> list[RayounWithBoxesResponse]:
        rayouns = db.query(Rayoun).filter(Rayoun.is_active == True).order_by(Rayoun.name).all()
        result = []
        for r in rayouns:
            boxes = db.query(Box).filter(Box.rayoun_id == r.id).order_by(Box.position).all()
            box_responses = []
            for box in boxes:
                molds = db.query(Mold).filter(Mold.box_id == box.id, Mold.is_active == True).all()
                box_responses.append(BoxWithMoldsResponse(
                    id=box.id,
                    box_number=box.box_number,
                    rayoun_id=box.rayoun_id,
                    position=box.position,
                    capacity=box.capacity,
                    status=box.status,
                    molds=[MoldResponse.model_validate(m) for m in molds]
                ))
            result.append(RayounWithBoxesResponse(
                id=r.id,
                name=r.name,
                description=r.description,
                is_active=r.is_active,
                boxes=box_responses
            ))
        return result
    
    @staticmethod
    def delete_rayoun(db: Session, rayoun_id: int):
        rayoun = db.query(Rayoun).filter(Rayoun.id == rayoun_id).first()
        if not rayoun:
            raise ValueError(f"Rayoun {rayoun_id} not found")
        rayoun.is_active = False
        db.commit()
    
    @staticmethod
    def seed_rayouns(db: Session) -> int:
        """Seed default rayouns A, B, C"""
        default_rayouns = ["A", "B", "C"]
        count = 0
        for name in default_rayouns:
            existing = db.query(Rayoun).filter(Rayoun.name == name).first()
            if not existing:
                rayoun = Rayoun(name=name, description=f"Rayoun {name} Storage Area")
                db.add(rayoun)
                count += 1
        db.commit()
        return count


class BoxService:
    """Box management service"""
    
    @staticmethod
    def create_box(db: Session, data: BoxCreate) -> BoxResponse:
        rayoun = db.query(Rayoun).filter(Rayoun.id == data.rayoun_id).first()
        if not rayoun:
            raise ValueError(f"Rayoun {data.rayoun_id} not found")
        
        last_box = db.query(Box).filter(
            Box.rayoun_id == data.rayoun_id
        ).order_by(Box.position.desc()).first()
        
        next_position = (last_box.position + 1) if last_box else 1
        box_number = f"{rayoun.name}{next_position}"
        
        box = Box(
            box_number=box_number,
            rayoun_id=data.rayoun_id,
            position=next_position,
            capacity=data.capacity,
            status=data.status or "available"
        )
        db.add(box)
        db.commit()
        db.refresh(box)
        return BoxResponse.model_validate(box)
    
    @staticmethod
    def get_all_boxes(db: Session) -> list[BoxResponse]:
        boxes = db.query(Box).all()
        return [BoxResponse.model_validate(b) for b in boxes]
    
    @staticmethod
    def get_boxes_by_rayoun(db: Session, rayoun_id: int) -> list[BoxResponse]:
        boxes = db.query(Box).filter(Box.rayoun_id == rayoun_id).order_by(Box.position).all()
        return [BoxResponse.model_validate(b) for b in boxes]
    
    @staticmethod
    def get_box(db: Session, box_id: int) -> BoxResponse:
        box = db.query(Box).filter(Box.id == box_id).first()
        if not box:
            raise ValueError(f"Box {box_id} not found")
        return BoxResponse.model_validate(box)
    
    @staticmethod
    def update_box(db: Session, box_id: int, status: str) -> BoxResponse:
        box = db.query(Box).filter(Box.id == box_id).first()
        if not box:
            raise ValueError(f"Box {box_id} not found")
        box.status = status
        db.commit()
        db.refresh(box)
        return BoxResponse.model_validate(box)
    
    @staticmethod
    def delete_box(db: Session, box_id: int):
        box = db.query(Box).filter(Box.id == box_id).first()
        if not box:
            raise ValueError(f"Box {box_id} not found")
        box.status = "deleted"
        db.commit()
    
    @staticmethod
    def seed_boxes(db: Session) -> int:
        """Seed boxes for each rayoun"""
        rayouns = db.query(Rayoun).all()
        count = 0
        for rayoun in rayouns:
            for i in range(1, 4):
                existing = db.query(Box).filter(
                    Box.rayoun_id == rayoun.id,
                    Box.position == i
                ).first()
                if not existing:
                    box = Box(
                        box_number=f"{rayoun.name}{i}",
                        rayoun_id=rayoun.id,
                        position=i,
                        capacity=6,
                        status="available"
                    )
                    db.add(box)
                    count += 1
        db.commit()
        return count

    @staticmethod
    def assign_molds_to_boxes(db: Session) -> int:
        """Assign molds to boxes if not already assigned"""
        rayouns = db.query(Rayoun).all()
        count = 0

        for idx, rayoun in enumerate(rayouns):
            boxes = db.query(Box).filter(
                Box.rayoun_id == rayoun.id
            ).order_by(Box.position).all()

            for box_idx, box in enumerate(boxes):
                if box.status != "available":
                    continue

                unassigned = db.query(Mold).filter(
                    Mold.box_id == None,
                    Mold.is_active == True
                ).limit(box.capacity).all()

                for mold in unassigned:
                    mold.box_id = box.id
                    if hasattr(mold, 'rayoun_id'):
                        mold.rayoun_id = rayoun.id
                    db.add(mold)
                    count += 1

                if count >= 20:
                    break
            if count >= 20:
                break

        db.commit()
        return count