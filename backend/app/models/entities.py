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
    machine_class = Column(String(10), nullable=False, unique=True)  # "90T", "120T", etc.
    
    # Core specifications
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
    
    # Relationships
    instances = relationship("Machine", back_populates="spec")

class Machine(Base):
    __tablename__ = "machines"
    
    id = Column(Integer, primary_key=True, index=True)
    machine_code = Column(String(20), nullable=False, unique=True)  # "90T/1", "200T/3", etc.
    
    # Foreign keys
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    spec_id = Column(Integer, ForeignKey("machine_specs.id"), nullable=False)
    
    # Instance-specific fields
    serial_number = Column(String(50))
    installation_date = Column(String(10))
    status = Column(String(20), default="idle")  # running, idle, maintenance, broken
    is_active = Column(Boolean, default=True)
    notes = Column(String(500))
    
    # Relationships
    branch = relationship("Branch", back_populates="machines")
    spec = relationship("MachineSpec", back_populates="instances")
    production_runs = relationship("ProductionRun", back_populates="machine")
    
    __table_args__ = (
        UniqueConstraint('branch_id', 'spec_id', 'sequence', name='uq_machine_sequence'),
    )
    
    sequence = Column(Integer, default=1)

class Mold(Base):
    __tablename__ = "molds"
    
    id = Column(Integer, primary_key=True, index=True)
    mold_code = Column(String(30), nullable=False, unique=True)
    
    # Physical dimensions
    length_mm = Column(Float, nullable=False)
    width_mm = Column(Float, nullable=False)
    height_mm = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=False)
    
    # Requirements
    required_tonnage = Column(Integer, nullable=False)
    required_shot_volume = Column(Float, nullable=False)
    
    # Cavity info
    cavities = Column(Integer, default=1)
    steel_type = Column(String(50))  # P20, H13, etc.
    
    # Status
    status = Column(String(20), default="active")  # active, storage, maintenance
    is_active = Column(Boolean, default=True)
    
    # Relationships
    production_runs = relationship("ProductionRun", back_populates="mold")

class ProductionRun(Base):
    __tablename__ = "production_runs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign keys
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=False)
    mold_id = Column(Integer, ForeignKey("molds.id"), nullable=False)
    
    # Production data
    start_time = Column(String(20), nullable=False)
    end_time = Column(String(20))
    ideal_cycle_time = Column(Float)
    actual_cycle_time = Column(Float)
    quantity_produced = Column(Integer, default=0)
    quantity_rejected = Column(Integer, default=0)
    
    # Status
    status = Column(String(20), default="running")  # running, completed, stopped
    
    # Relationships
    machine = relationship("Machine", back_populates="production_runs")
    mold = relationship("Mold", back_populates="production_runs")