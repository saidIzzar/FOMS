from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.core.machine_catalog import ScrewType

class Branch(Base):
    __tablename__ = "branches"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    location = Column(String(200))
    is_active = Column(Boolean, default=True)
    
    machines = relationship("Machine", back_populates="branch")

class MachineSpec(Base):
    __tablename__ = "machine_specs"
    
    id = Column(Integer, primary_key=True, index=True)
    machine_class = Column(String(10), nullable=False, unique=True)
    tonnage = Column(Integer, nullable=False)
    clamping_force_kn = Column(Integer, nullable=False)
    tie_bar_distance_width = Column(Float, nullable=False)
    tie_bar_distance_height = Column(Float, nullable=False)
    platen_size_width = Column(Float, nullable=False)
    platen_size_height = Column(Float, nullable=False)
    mold_thickness_min = Column(Float, nullable=False)
    mold_thickness_max = Column(Float, nullable=False)
    max_daylight = Column(Float, nullable=False)
    ejector_force_kn = Column(Float, nullable=False)
    shot_volume_max = Column(Float, nullable=False)
    screw_diameter = Column(Float, nullable=False)
    injection_pressure_max = Column(Integer, nullable=False)
    motor_power_kw = Column(Float, nullable=False)
    pump_power_kw = Column(Float, nullable=False)
    ideal_cycle_time_sec = Column(Float, nullable=False)
    weight_kg = Column(Integer, nullable=False)
    screw_type = Column(SQLEnum(ScrewType), default=ScrewType.A)
    
    instances = relationship("Machine", back_populates="spec")

class Machine(Base):
    __tablename__ = "machines"
    
    id = Column(Integer, primary_key=True, index=True)
    machine_code = Column(String(20), nullable=False, unique=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    spec_id = Column(Integer, ForeignKey("machine_specs.id"), nullable=False)
    serial_number = Column(String(50))
    installation_date = Column(String(10))
    status = Column(String(20), default="idle")
    is_active = Column(Boolean, default=True)
    notes = Column(String(500))
    sequence = Column(Integer, default=1)
    
    branch = relationship("Branch", back_populates="machines")
    spec = relationship("MachineSpec", back_populates="instances")
    production_runs = relationship("ProductionRun", back_populates="machine")

class Rayoun(Base):
    __tablename__ = "rayouns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(10), nullable=False, unique=True)  # A, B, C
    description = Column(String(200))
    is_active = Column(Boolean, default=True)

    boxes = relationship("Box", back_populates="rayoun")
    molds = relationship("Mold", back_populates="rayoun")

class Box(Base):
    __tablename__ = "boxes"
    
    id = Column(Integer, primary_key=True, index=True)
    box_number = Column(String(20), nullable=False)  # A1, A2, B1, etc.
    rayoun_id = Column(Integer, ForeignKey("rayouns.id"), nullable=False)
    position = Column(Integer, default=1)  # Position within rayoun
    capacity = Column(Integer, default=6)  # max 6 molds
    status = Column(String(20), default="available")
    
    rayoun = relationship("Rayoun", back_populates="boxes")
    molds = relationship("Mold", back_populates="box")

class Mold(Base):
    __tablename__ = "molds"

    id = Column(Integer, primary_key=True, index=True)
    mold_code = Column(String(30), nullable=False, unique=True)
    length_mm = Column(Float, nullable=False)
    width_mm = Column(Float, nullable=False)
    height_mm = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=False)
    required_tonnage = Column(Integer, nullable=False)
    required_shot_volume = Column(Float, nullable=False)
    cavities = Column(Integer, default=1)
    steel_type = Column(String(50))
    status = Column(String(20), default="active")
    is_active = Column(Boolean, default=True)
    box_id = Column(Integer, ForeignKey("boxes.id"), nullable=True)
    rayoun_id = Column(Integer, ForeignKey("rayouns.id"), nullable=True)

    box = relationship("Box", back_populates="molds")
    rayoun = relationship("Rayoun", back_populates="molds")
    production_runs = relationship("ProductionRun", back_populates="mold")

class ProductionRun(Base):
    __tablename__ = "production_runs"
    
    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=False)
    mold_id = Column(Integer, ForeignKey("molds.id"), nullable=False)
    start_time = Column(String(20), nullable=False)
    end_time = Column(String(20))
    ideal_cycle_time = Column(Float)
    actual_cycle_time = Column(Float)
    quantity_produced = Column(Integer, default=0)
    quantity_rejected = Column(Integer, default=0)
    status = Column(String(20), default="running")
    
    machine = relationship("Machine", back_populates="production_runs")
    mold = relationship("Mold", back_populates="production_runs")

class Material(Base):
    __tablename__ = "materials"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(30), nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    grade = Column(String(50))
    supplier = Column(String(100))
    density = Column(Float)
    mfi = Column(Float)  # Melt Flow Index
    status = Column(String(20), default="active")

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=False)
    log_type = Column(String(50), nullable=False)  # preventive, corrective, inspection
    description = Column(String(500))
    performed_by = Column(String(100))
    status = Column(String(20), default="pending")
    log_date = Column(String(20))