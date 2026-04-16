const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: config.DB,
  logging: false
});

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: true },
  password: { type: DataTypes.STRING, allowNull: false },
  first_name: { type: DataTypes.STRING, defaultValue: '' },
  last_name: { type: DataTypes.STRING, defaultValue: '' },
  role: { type: DataTypes.ENUM('admin', 'engineer', 'operator'), defaultValue: 'operator' },
  department: { type: DataTypes.STRING, defaultValue: '' },
  position: { type: DataTypes.STRING, defaultValue: '' },
  branch: { type: DataTypes.STRING, defaultValue: '' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  language: { type: DataTypes.STRING, defaultValue: 'ar' }
});

const Machine = sequelize.define('Machine', {
  name: { type: DataTypes.STRING, allowNull: false },
  model: { type: DataTypes.STRING, defaultValue: '' },
  serial_number: { type: DataTypes.STRING, defaultValue: '' },
  manufacturer: { type: DataTypes.STRING, defaultValue: 'Haitian' },
  series: { type: DataTypes.STRING, defaultValue: 'Mars' },
  tonnage: { type: DataTypes.INTEGER, defaultValue: 0 },
  clamping_force_kn: { type: DataTypes.INTEGER, defaultValue: 0 },
  platen_size_width: { type: DataTypes.FLOAT, defaultValue: 0 },
  platen_size_height: { type: DataTypes.FLOAT, defaultValue: 0 },
  tie_bar_distance_width: { type: DataTypes.FLOAT, defaultValue: 0 },
  tie_bar_distance_height: { type: DataTypes.FLOAT, defaultValue: 0 },
  mold_thickness_min: { type: DataTypes.FLOAT, defaultValue: 0 },
  mold_thickness_max: { type: DataTypes.FLOAT, defaultValue: 0 },
  max_daylight: { type: DataTypes.FLOAT, defaultValue: 0 },
  ejector_force_kn: { type: DataTypes.FLOAT, defaultValue: 0 },
  ejector_pins: { type: DataTypes.INTEGER, defaultValue: 0 },
  screw_diameter: { type: DataTypes.FLOAT, defaultValue: 0 },
  screw_l_d_ratio: { type: DataTypes.FLOAT, defaultValue: 0 },
  injection_volume_max: { type: DataTypes.FLOAT, defaultValue: 0 },
  injection_pressure_max: { type: DataTypes.FLOAT, defaultValue: 0 },
  machine_dimensions_length: { type: DataTypes.FLOAT, defaultValue: 0 },
  machine_dimensions_width: { type: DataTypes.FLOAT, defaultValue: 0 },
  machine_dimensions_height: { type: DataTypes.FLOAT, defaultValue: 0 },
  machine_weight_kg: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.ENUM('running', 'idle', 'maintenance', 'broken'), defaultValue: 'idle' },
  location: { type: DataTypes.STRING, defaultValue: '' },
  installation_date: { type: DataTypes.DATEONLY, allowNull: true },
  last_maintenance: { type: DataTypes.DATE, allowNull: true },
  notes: { type: DataTypes.TEXT, defaultValue: '' }
});

const MoldProcess = sequelize.define('MoldProcess', {
  machine_id: { type: DataTypes.INTEGER, allowNull: false },
  mold_id: { type: DataTypes.INTEGER, allowNull: true },
  material: { type: DataTypes.STRING, defaultValue: 'PP' },
  injection_temperature: { type: DataTypes.FLOAT, defaultValue: 220 },
  mold_temperature: { type: DataTypes.FLOAT, defaultValue: 25 },
  injection_speed: { type: DataTypes.FLOAT, defaultValue: 50 },
  holding_pressure: { type: DataTypes.FLOAT, defaultValue: 100 },
  cooling_time: { type: DataTypes.FLOAT, defaultValue: 10 },
  cycle_time: { type: DataTypes.FLOAT, defaultValue: 30 },
  process_notes: { type: DataTypes.TEXT, defaultValue: '' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const MachineLog = sequelize.define('MachineLog', {
  machine_id: { type: DataTypes.INTEGER, allowNull: false },
  event_type: { type: DataTypes.STRING, defaultValue: 'status_change' },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  old_status: { type: DataTypes.STRING, defaultValue: '' },
  new_status: { type: DataTypes.STRING, defaultValue: '' },
  created_by: { type: DataTypes.INTEGER, allowNull: true }
});

const OptimalParameter = sequelize.define('OptimalParameter', {
  machine_model: { type: DataTypes.STRING, allowNull: false },
  material: { type: DataTypes.STRING, allowNull: false },
  tonnage_min: { type: DataTypes.INTEGER, defaultValue: 0 },
  tonnage_max: { type: DataTypes.INTEGER, defaultValue: 0 },
  injection_temp_min: { type: DataTypes.FLOAT, defaultValue: 180 },
  injection_temp_max: { type: DataTypes.FLOAT, defaultValue: 280 },
  mold_temp_min: { type: DataTypes.FLOAT, defaultValue: 20 },
  mold_temp_max: { type: DataTypes.FLOAT, defaultValue: 80 },
  injection_speed: { type: DataTypes.FLOAT, defaultValue: 50 },
  holding_pressure: { type: DataTypes.FLOAT, defaultValue: 100 },
  cooling_time: { type: DataTypes.FLOAT, defaultValue: 10 }
});

const Mold = sequelize.define('Mold', {
  code: { type: DataTypes.STRING, allowNull: false },
  product_name: { type: DataTypes.STRING, defaultValue: '' },
  material: { type: DataTypes.STRING, defaultValue: '' },
  material_code: { type: DataTypes.STRING, defaultValue: '' },
  dimensions: { type: DataTypes.STRING, defaultValue: '' },
  cavity_layout: { type: DataTypes.STRING, defaultValue: '' },
  runner_type: { type: DataTypes.STRING, defaultValue: 'cold' },
  gate_type: { type: DataTypes.STRING, defaultValue: 'pin' },
  cavities: { type: DataTypes.INTEGER, defaultValue: 1 },
  weight_kg: { type: DataTypes.FLOAT, defaultValue: 0 },
  steel_type: { type: DataTypes.STRING, defaultValue: 'P20' },
  hardness_hrc: { type: DataTypes.FLOAT, defaultValue: 0 },
  e_dimension: { type: DataTypes.FLOAT, defaultValue: 0 },
  a_dimension: { type: DataTypes.FLOAT, defaultValue: 0 },
  b_dimension: { type: DataTypes.FLOAT, defaultValue: 0 },
  c_dimension: { type: DataTypes.FLOAT, defaultValue: 0 },
  d_dimension: { type: DataTypes.FLOAT, defaultValue: 0 },
  mold_height: { type: DataTypes.FLOAT, defaultValue: 0 },
  mold_weight_kg: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.ENUM('active', 'in_storage', 'in_maintenance', 'retired'), defaultValue: 'active' },
  location_id: { type: DataTypes.INTEGER, allowNull: true },
  machine_tonnage_min: { type: DataTypes.INTEGER, defaultValue: 0 },
  machine_tonnage_max: { type: DataTypes.INTEGER, defaultValue: 1000 },
  last_used: { type: DataTypes.DATE, allowNull: true },
  total_cycles: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_maintenance: { type: DataTypes.DATE, allowNull: true },
  notes: { type: DataTypes.TEXT, defaultValue: '' }
});

const MoldLocation = sequelize.define('MoldLocation', {
  name: { type: DataTypes.STRING, allowNull: false },
  zone: { type: DataTypes.STRING, defaultValue: '' },
  rack: { type: DataTypes.STRING, defaultValue: '' },
  shelf: { type: DataTypes.STRING, defaultValue: '' },
  capacity: { type: DataTypes.INTEGER, defaultValue: 10 },
  current_count: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const StorageBox = sequelize.define('StorageBox', {
  location_id: { type: DataTypes.INTEGER, allowNull: false },
  mold_id: { type: DataTypes.INTEGER, allowNull: true },
  label: { type: DataTypes.STRING, defaultValue: '' },
  position: { type: DataTypes.STRING, defaultValue: '' }
});

const ProductionLog = sequelize.define('ProductionLog', {
  machine_id: { type: DataTypes.INTEGER, allowNull: false },
  mold_id: { type: DataTypes.INTEGER, allowNull: true },
  operator_id: { type: DataTypes.INTEGER, allowNull: true },
  start_time: { type: DataTypes.DATE, allowNull: false },
  end_time: { type: DataTypes.DATE, allowNull: true },
  quantity_produced: { type: DataTypes.INTEGER, defaultValue: 0 },
  quantity_rejected: { type: DataTypes.INTEGER, defaultValue: 0 },
  material_used: { type: DataTypes.STRING, defaultValue: '' },
  notes: { type: DataTypes.TEXT, defaultValue: '' },
  status: { type: DataTypes.ENUM('running', 'completed'), defaultValue: 'running' }
});

const MoldChangeLog = sequelize.define('MoldChangeLog', {
  machine_id: { type: DataTypes.INTEGER, allowNull: false },
  old_mold_id: { type: DataTypes.INTEGER, allowNull: true },
  new_mold_id: { type: DataTypes.INTEGER, allowNull: true },
  change_time: { type: DataTypes.DATE, allowNull: false },
  duration_minutes: { type: DataTypes.INTEGER, defaultValue: 0 },
  notes: { type: DataTypes.TEXT, defaultValue: '' }
});

const MoldRepairLog = sequelize.define('MoldRepairLog', {
  mold_id: { type: DataTypes.INTEGER, allowNull: false },
  repair_date: { type: DataTypes.DATE, allowNull: false },
  repair_type: { type: DataTypes.STRING, defaultValue: '' },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  cost: { type: DataTypes.FLOAT, defaultValue: 0 },
  performed_by: { type: DataTypes.STRING, defaultValue: '' }
});

const MaintenanceLog = sequelize.define('MaintenanceLog', {
  machine_id: { type: DataTypes.INTEGER, allowNull: false },
  maintenance_type: { type: DataTypes.ENUM('preventive', 'corrective', 'emergency'), defaultValue: 'preventive' },
  scheduled_date: { type: DataTypes.DATE, allowNull: false },
  completed_date: { type: DataTypes.DATE, allowNull: true },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  technician: { type: DataTypes.STRING, defaultValue: '' },
  cost: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'), defaultValue: 'scheduled' }
});

const MaterialSupplier = sequelize.define('MaterialSupplier', {
  name: { type: DataTypes.STRING, allowNull: false },
  contact_person: { type: DataTypes.STRING, defaultValue: '' },
  email: { type: DataTypes.STRING, defaultValue: '' },
  phone: { type: DataTypes.STRING, defaultValue: '' },
  address: { type: DataTypes.TEXT, defaultValue: '' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const MaterialReception = sequelize.define('MaterialReception', {
  supplier_id: { type: DataTypes.INTEGER, allowNull: false },
  material_type: { type: DataTypes.STRING, allowNull: false },
  batch_number: { type: DataTypes.STRING, defaultValue: '' },
  quantity_kg: { type: DataTypes.FLOAT, defaultValue: 0 },
  reception_date: { type: DataTypes.DATE, allowNull: false },
  lot_number: { type: DataTypes.STRING, defaultValue: '' },
  status: { type: DataTypes.ENUM('pending', 'tested', 'approved', 'rejected'), defaultValue: 'pending' },
  notes: { type: DataTypes.TEXT, defaultValue: '' }
});

const MaterialTest = sequelize.define('MaterialTest', {
  reception_id: { type: DataTypes.INTEGER, allowNull: false },
  test_date: { type: DataTypes.DATE, allowNull: false },
  melt_flow_index: { type: DataTypes.FLOAT, defaultValue: 0 },
  density: { type: DataTypes.FLOAT, defaultValue: 0 },
  moisture_content: { type: DataTypes.FLOAT, defaultValue: 0 },
  result: { type: DataTypes.ENUM('pass', 'fail', 'pending'), defaultValue: 'pending' },
  tested_by: { type: DataTypes.STRING, defaultValue: '' },
  notes: { type: DataTypes.TEXT, defaultValue: '' }
});

const Branch = sequelize.define('Branch', {
  name: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, defaultValue: '' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const MachineSpec = sequelize.define('MachineSpec', {
  spec_id: { type: DataTypes.STRING, unique: true, allowNull: false },
  screw_type: { type: DataTypes.STRING, defaultValue: 'A' },
  tonnage: { type: DataTypes.INTEGER, allowNull: false },
  clamping_force_kn: { type: DataTypes.INTEGER, defaultValue: 0 },
  tie_bar_spacing_mm: { type: DataTypes.STRING, defaultValue: '' },
  max_daylight_mm: { type: DataTypes.INTEGER, defaultValue: 0 },
  mold_height_min_mm: { type: DataTypes.INTEGER, defaultValue: 0 },
  mold_height_max_mm: { type: DataTypes.INTEGER, defaultValue: 0 },
  screw_diameter_mm: { type: DataTypes.FLOAT, defaultValue: 0 },
  shot_volume_cm3: { type: DataTypes.FLOAT, defaultValue: 0 },
  injection_pressure_bar: { type: DataTypes.INTEGER, defaultValue: 0 },
  injection_rate_cm3_s: { type: DataTypes.FLOAT, defaultValue: 0 },
  plasticizing_capacity_kg_h: { type: DataTypes.FLOAT, defaultValue: 0 },
  dry_cycle_time_sec: { type: DataTypes.FLOAT, defaultValue: 0 },
  motor_power_kw: { type: DataTypes.FLOAT, defaultValue: 0 }
});

const Article = sequelize.define('Article', {
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, defaultValue: '' },
  category: { type: DataTypes.STRING, defaultValue: '' },
  author_id: { type: DataTypes.INTEGER, allowNull: true },
  is_published: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const Notification = sequelize.define('Notification', {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, defaultValue: '' },
  type: { type: DataTypes.ENUM('info', 'warning', 'error', 'success'), defaultValue: 'info' },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  link: { type: DataTypes.STRING, defaultValue: '' }
});

const AuditLog = sequelize.define('AuditLog', {
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  action: { type: DataTypes.STRING, allowNull: false },
  entity_type: { type: DataTypes.STRING, defaultValue: '' },
  entity_id: { type: DataTypes.INTEGER, allowNull: true },
  details: { type: DataTypes.TEXT, defaultValue: '' },
  ip_address: { type: DataTypes.STRING, defaultValue: '' }
});

Machine.hasOne(MoldProcess, { foreignKey: 'machine_id', as: 'currentProcess' });
MoldProcess.belongsTo(Machine, { foreignKey: 'machine_id', as: 'machine' });

Machine.belongsTo(MachineSpec, { foreignKey: 'spec_id', as: 'spec' });
MachineSpec.hasMany(Machine, { foreignKey: 'spec_id', as: 'machines' });

Machine.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Branch.hasMany(Machine, { foreignKey: 'branch_id', as: 'machines' });

MoldProcess.belongsTo(Mold, { foreignKey: 'mold_id', as: 'mold' });
Mold.hasMany(MoldProcess, { foreignKey: 'mold_id', as: 'processes' });

Machine.hasMany(MachineLog, { foreignKey: 'machine_id', as: 'logs' });
MachineLog.belongsTo(Machine, { foreignKey: 'machine_id', as: 'machine' });

Mold.belongsTo(MoldLocation, { foreignKey: 'location_id', as: 'location' });
MoldLocation.hasMany(Mold, { foreignKey: 'location_id', as: 'molds' });

ProductionLog.belongsTo(Machine, { foreignKey: 'machine_id', as: 'machine' });
Machine.hasMany(ProductionLog, { foreignKey: 'machine_id', as: 'productionLogs' });

ProductionLog.belongsTo(Mold, { foreignKey: 'mold_id', as: 'mold' });
ProductionLog.belongsTo(User, { foreignKey: 'operator_id', as: 'operator' });

MoldChangeLog.belongsTo(Machine, { foreignKey: 'machine_id', as: 'machine' });
MoldChangeLog.belongsTo(Mold, { foreignKey: 'old_mold_id', as: 'oldMold' });
MoldChangeLog.belongsTo(Mold, { foreignKey: 'new_mold_id', as: 'newMold' });

MoldRepairLog.belongsTo(Mold, { foreignKey: 'mold_id', as: 'mold' });

MaintenanceLog.belongsTo(Machine, { foreignKey: 'machine_id', as: 'machine' });
Machine.hasMany(MaintenanceLog, { foreignKey: 'machine_id', as: 'maintenanceLogs' });

MaterialReception.belongsTo(MaterialSupplier, { foreignKey: 'supplier_id', as: 'supplier' });
MaterialSupplier.hasMany(MaterialReception, { foreignKey: 'supplier_id', as: 'receptions' });

MaterialTest.belongsTo(MaterialReception, { foreignKey: 'reception_id', as: 'reception' });
MaterialReception.hasMany(MaterialTest, { foreignKey: 'reception_id', as: 'tests' });

module.exports = {
  sequelize,
  User,
  Machine,
  MachineSpec,
  MoldProcess,
  MachineLog,
  OptimalParameter,
  Mold,
  MoldLocation,
  StorageBox,
  ProductionLog,
  MoldChangeLog,
  MoldRepairLog,
  MaintenanceLog,
  MaterialSupplier,
  MaterialReception,
  MaterialTest,
  Branch,
  Article,
  Notification,
  AuditLog
};