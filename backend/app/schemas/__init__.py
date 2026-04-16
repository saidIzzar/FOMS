from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class ScrewTypeSchema(str, Enum):
    A = "Screw Type A"

class MachineClassSchema(str, Enum):
    T90 = "90T"
    T120 = "120T"
    T160 = "160T"
    T200 = "200T"
    T250 = "250T"
    T280 = "280T"
    T380 = "380T"
    T450 = "450T"
    T470 = "470T"
    T800 = "800T"

# Machine Spec Schemas
class MachineSpecBase(BaseModel):
    machine_class: str
    tonnage: int
    clamping_force_kn: int
    tie_bar_distance_width: float
    tie_bar_distance_height: float
    platen_size_width: float
    platen_size_height: float
    mold_thickness_min: float
    mold_thickness_max: float
    max_daylight: float
    ejector_force_kn: float
    shot_volume_max: float
    screw_diameter: float
    injection_pressure_max: int
    motor_power_kw: float
    pump_power_kw: float
    ideal_cycle_time_sec: float
    weight_kg: int
    screw_type: ScrewTypeSchema = ScrewTypeSchema.A

class MachineSpecResponse(MachineSpecBase):
    id: int
    class Config:
        from_attributes = True

# Branch Schemas
class BranchBase(BaseModel):
    name: str
    location: Optional[str] = None

class BranchCreate(BranchBase):
    pass

class BranchResponse(BranchBase):
    id: int
    is_active: bool
    class Config:
        from_attributes = True

# Machine Instance Schemas
class MachineBase(BaseModel):
    machine_code: str
    branch_id: int
    spec_id: int
    serial_number: Optional[str] = None
    installation_date: Optional[str] = None
    status: str = "idle"
    notes: Optional[str] = None

class MachineCreate(BaseModel):
    branch_id: int
    spec_id: int
    serial_number: Optional[str] = None
    installation_date: Optional[str] = None
    notes: Optional[str] = None

class MachineResponse(BaseModel):
    id: int
    machine_code: str
    branch_id: int
    spec_id: int
    serial_number: Optional[str]
    installation_date: Optional[str]
    status: str
    is_active: bool
    sequence: int
    class Config:
        from_attributes = True

class MachineDetailResponse(MachineResponse):
    spec: Optional[MachineSpecResponse] = None
    branch: Optional[BranchResponse] = None

# Mold Schemas
class MoldBase(BaseModel):
    mold_code: str
    length_mm: float
    width_mm: float
    height_mm: float
    weight_kg: float
    required_tonnage: int
    required_shot_volume: float
    cavities: int = 1
    steel_type: Optional[str] = None

class MoldCreate(MoldBase):
    status: str = "active"
    box_id: Optional[int] = None
    rayoun_id: Optional[int] = None

# Production Run Schemas
class ProductionRunBase(BaseModel):
    machine_id: int
    mold_id: int
    start_time: str
    ideal_cycle_time: Optional[float] = None
    actual_cycle_time: Optional[float] = None
    quantity_produced: int = 0
    quantity_rejected: int = 0

class ProductionRunCreate(ProductionRunBase):
    end_time: Optional[str] = None
    status: str = "running"

class ProductionRunResponse(ProductionRunBase):
    id: int
    end_time: Optional[str]
    status: str
    class Config:
        from_attributes = True

# Compatibility Schemas
class CompatibilityRequest(BaseModel):
    machine_id: int
    mold_id: int

class CompatibilityResponse(BaseModel):
    compatible: bool
    machine_code: str
    mold_code: str
    reasons: list[str]

# AI Recommender Schemas
class AIRecommendRequest(BaseModel):
    mold_id: int
    branch_id: Optional[int] = None

class AIRecommendResponse(BaseModel):
    recommended_machine_id: int
    machine_code: str
    tonnage: int
    efficiency_gain_percent: float
    reasons: list[str]

# Efficiency Schemas
class EfficiencyRequest(BaseModel):
    machine_id: int

class EfficiencyResponse(BaseModel):
    machine_code: str
    ideal_cycle_time: float
    actual_cycle_time: float
    efficiency_percent: float
    status: str

# Layout Schemas
class LayoutResponse(BaseModel):
    zones: dict
    recommendations: list[str]

# Rayoun Schemas
class RayounBase(BaseModel):
    name: str
    description: Optional[str] = None

class RayounCreate(RayounBase):
    pass

class RayounResponse(RayounBase):
    id: int
    is_active: bool
    class Config:
        from_attributes = True

# Box Schemas
class BoxBase(BaseModel):
    box_number: str
    rayoun_id: int
    position: int = 1
    capacity: int = 6

class BoxCreate(BoxBase):
    status: str = "available"

class BoxResponse(BoxBase):
    id: int
    status: str
    class Config:
        from_attributes = True

# Updated Mold Response
class MoldResponse(MoldBase):
    id: int
    status: str
    is_active: bool
    box_id: Optional[int] = None
    rayoun_id: Optional[int] = None
    class Config:
        from_attributes = True

# Box with Molds
class BoxWithMoldsResponse(BoxResponse):
    molds: list[MoldResponse] = []

# Rayoun with Boxes
class RayounWithBoxesResponse(RayounResponse):
    boxes: list[BoxWithMoldsResponse] = []