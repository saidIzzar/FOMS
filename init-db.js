const { sequelize, User, Machine, MachineSpec, Mold, MoldLocation, OptimalParameter, Branch, ProductionLog } = require('./models');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  console.log('Syncing database...');
  await sequelize.sync({ force: true });
  
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    username: 'admin',
    email: 'admin@foms.com',
    password: adminPassword,
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    department: 'IT',
    position: 'System Administrator',
    is_active: true
  });
  
  console.log('Creating engineer user...');
  const engineerPassword = await bcrypt.hash('engineer123', 10);
  await User.create({
    username: 'engineer',
    email: 'engineer@foms.com',
    password: engineerPassword,
    first_name: 'John',
    last_name: 'Engineer',
    role: 'engineer',
    department: 'Engineering',
    position: 'Process Engineer',
    is_active: true
  });
  
  console.log('Creating operator user...');
  const operatorPassword = await bcrypt.hash('operator123', 10);
  await User.create({
    username: 'operator1',
    email: 'operator1@foms.com',
    password: operatorPassword,
    first_name: 'Ahmed',
    last_name: 'Ali',
    role: 'operator',
    department: 'Production',
    position: 'Machine Operator',
    is_active: true
  });
  
  console.log('Creating branches...');
  await Branch.bulkCreate([
    { name: 'Main Factory', location: 'Industrial Zone A', is_active: true },
    { name: 'Warehouse', location: 'Industrial Zone B', is_active: true }
  ]);
  
  console.log('Creating machine specs (Haitian Catalog)...');
  await MachineSpec.bulkCreate([
    { spec_id: '90T-A', screw_type: 'A', tonnage: 90, clamping_force_kn: 900, tie_bar_spacing_mm: '320x320', screw_diameter_mm: 28, shot_volume_cm3: 95, injection_pressure_bar: 1600, motor_power_kw: 11 },
    { spec_id: '120T-A', screw_type: 'A', tonnage: 120, clamping_force_kn: 1200, tie_bar_spacing_mm: '360x360', screw_diameter_mm: 32, shot_volume_cm3: 140, injection_pressure_bar: 1700, motor_power_kw: 15 },
    { spec_id: '160T-A', screw_type: 'A', tonnage: 160, clamping_force_kn: 1600, tie_bar_spacing_mm: '410x410', screw_diameter_mm: 38, shot_volume_cm3: 210, injection_pressure_bar: 1800, motor_power_kw: 18.5 },
    { spec_id: '200T-A', screw_type: 'A', tonnage: 200, clamping_force_kn: 2000, tie_bar_spacing_mm: '460x460', screw_diameter_mm: 42, shot_volume_cm3: 320, injection_pressure_bar: 1900, motor_power_kw: 22 },
    { spec_id: '250T-A', screw_type: 'A', tonnage: 250, clamping_force_kn: 2500, tie_bar_spacing_mm: '520x520', screw_diameter_mm: 48, shot_volume_cm3: 450, injection_pressure_bar: 2000, motor_power_kw: 30 },
    { spec_id: '280T-A', screw_type: 'A', tonnage: 280, clamping_force_kn: 2800, tie_bar_spacing_mm: '560x560', screw_diameter_mm: 52, shot_volume_cm3: 520, injection_pressure_bar: 2100, motor_power_kw: 37 },
    { spec_id: '380T-A', screw_type: 'A', tonnage: 380, clamping_force_kn: 3800, tie_bar_spacing_mm: '680x680', screw_diameter_mm: 60, shot_volume_cm3: 900, injection_pressure_bar: 2200, motor_power_kw: 55 },
    { spec_id: '450T-A', screw_type: 'A', tonnage: 450, clamping_force_kn: 4500, tie_bar_spacing_mm: '760x760', screw_diameter_mm: 70, shot_volume_cm3: 1200, injection_pressure_bar: 2300, motor_power_kw: 75 },
    { spec_id: '470T-A', screw_type: 'A', tonnage: 470, clamping_force_kn: 4700, tie_bar_spacing_mm: '780x780', screw_diameter_mm: 72, shot_volume_cm3: 1350, injection_pressure_bar: 2350, motor_power_kw: 90 },
    { spec_id: '800T-A', screw_type: 'A', tonnage: 800, clamping_force_kn: 8000, tie_bar_spacing_mm: '1000x1000', screw_diameter_mm: 90, shot_volume_cm3: 2500, injection_pressure_bar: 2500, motor_power_kw: 160 }
  ]);
  
  console.log('Creating mold locations...');
  await MoldLocation.bulkCreate([
    { name: 'Zone A - Rack 1', zone: 'A', rack: '1', shelf: 'A', capacity: 20, current_count: 5 },
    { name: 'Zone A - Rack 2', zone: 'A', rack: '2', shelf: 'A', capacity: 20, current_count: 3 },
    { name: 'Zone B - Rack 1', zone: 'B', rack: '1', shelf: 'A', capacity: 15, current_count: 8 },
    { name: 'Zone B - Rack 2', zone: 'B', rack: '2', shelf: 'B', capacity: 15, current_count: 2 }
  ]);
  
  console.log('Creating machines...');
  await Machine.bulkCreate([
    { name: 'HTF-90', model: 'Mars', serial_number: 'M090001', manufacturer: 'Haitian', series: 'Mars', tonnage: 90, status: 'running', location: 'Production Hall A', installation_date: '2023-01-15' },
    { name: 'HTF-120', model: 'Mars', serial_number: 'M120001', manufacturer: 'Haitian', series: 'Mars', tonnage: 120, status: 'idle', location: 'Production Hall A', installation_date: '2023-02-20' },
    { name: 'HTF-160', model: 'Mars', serial_number: 'M160001', manufacturer: 'Haitian', series: 'Mars', tonnage: 160, status: 'idle', location: 'Production Hall A', installation_date: '2022-06-10' },
    { name: 'HTF-200', model: 'Mars', serial_number: 'M200001', manufacturer: 'Haitian', series: 'Mars', tonnage: 200, status: 'running', location: 'Production Hall A', installation_date: '2022-08-15' },
    { name: 'HTF-250', model: 'Mars', serial_number: 'M250001', manufacturer: 'Haitian', series: 'Mars', tonnage: 250, status: 'maintenance', location: 'Production Hall B', installation_date: '2021-05-10' },
    { name: 'HTF-280', model: 'Mars', serial_number: 'M280001', manufacturer: 'Haitian', series: 'Mars', tonnage: 280, status: 'running', location: 'Production Hall B', installation_date: '2021-03-20' },
    { name: 'HTF-320', model: 'Mars', serial_number: 'M320001', manufacturer: 'Haitian', series: 'Mars', tonnage: 320, status: 'running', location: 'Production Hall B', installation_date: '2021-06-15' },
    { name: 'HTF-350', model: 'Mars', serial_number: 'M350001', manufacturer: 'Haitian', series: 'Mars', tonnage: 350, status: 'maintenance', location: 'Production Hall B', installation_date: '2020-11-05' },
    { name: 'HTF-400', model: 'Mars', serial_number: 'M400001', manufacturer: 'Haitian', series: 'Mars', tonnage: 400, status: 'idle', location: 'Production Hall C', installation_date: '2022-01-10' },
    { name: 'HTF-450', model: 'Mars', serial_number: 'M450001', manufacturer: 'Haitian', series: 'Mars', tonnage: 450, status: 'running', location: 'Production Hall C', installation_date: '2022-04-20' },
    { name: 'HTF-500', model: 'Mars', serial_number: 'M500001', manufacturer: 'Haitian', series: 'Mars', tonnage: 500, status: 'idle', location: 'Production Hall C', installation_date: '2022-08-15' },
    { name: 'HTF-650', model: 'Mars', serial_number: 'M650001', manufacturer: 'Haitian', series: 'Mars', tonnage: 650, status: 'running', location: 'Production Hall C', installation_date: '2023-01-05' },
    { name: 'HTF-800', model: 'Mars', serial_number: 'M800001', manufacturer: 'Haitian', series: 'Mars', tonnage: 800, status: 'running', location: 'Production Hall C', installation_date: '2023-05-01' },
    { name: 'ZH-120', model: 'Zhafir', serial_number: 'Z120001', manufacturer: 'Zhafir', series: 'Zhafir', tonnage: 120, status: 'running', location: 'Production Hall D', installation_date: '2023-03-10' },
    { name: 'ZH-180', model: 'Zhafir', serial_number: 'Z180001', manufacturer: 'Zhafir', series: 'Zhafir', tonnage: 180, status: 'idle', location: 'Production Hall D', installation_date: '2022-09-15' },
    { name: 'ZH-280', model: 'Zhafir', serial_number: 'Z280001', manufacturer: 'Zhafir', series: 'Zhafir', tonnage: 280, status: 'running', location: 'Production Hall D', installation_date: '2022-11-20' },
    { name: 'EL-90', model: 'El', serial_number: 'E090001', manufacturer: 'Engel', series: 'El', tonnage: 90, status: 'idle', location: 'Production Hall E', installation_date: '2023-04-01' },
    { name: 'EL-150', model: 'El', serial_number: 'E150001', manufacturer: 'Engel', series: 'El', tonnage: 150, status: 'maintenance', location: 'Production Hall E', installation_date: '2022-07-10' },
    { name: 'EL-250', model: 'El', serial_number: 'E250001', manufacturer: 'Engel', series: 'El', tonnage: 250, status: 'running', location: 'Production Hall E', installation_date: '2022-12-05' },
    { name: 'EL-400', model: 'El', serial_number: 'E400001', manufacturer: 'Engel', series: 'El', tonnage: 400, status: 'idle', location: 'Production Hall E', installation_date: '2023-02-15' }
  ]);
  
  console.log('Creating molds...');
  await Mold.bulkCreate([
    { code: 'MOLD-001', product_name: 'Cap Container', material: 'PP', dimensions: '45x30x25', cavities: 4, weight_kg: 2.5, status: 'active', location_id: 1, machine_tonnage_min: 90, machine_tonnage_max: 160 },
    { code: 'MOLD-002', product_name: 'Handle Part', material: 'ABS', dimensions: '80x40x15', cavities: 2, weight_kg: 1.2, status: 'active', location_id: 1, machine_tonnage_min: 160, machine_tonnage_max: 280 },
    { code: 'MOLD-003', product_name: 'Bottle Cap', material: 'PP', dimensions: '30x30x10', cavities: 8, weight_kg: 0.5, status: 'active', location_id: 2, machine_tonnage_min: 90, machine_tonnage_max: 160 },
    { code: 'MOLD-004', product_name: 'Housing Box', material: 'PC', dimensions: '120x80x40', cavities: 1, weight_kg: 5.0, status: 'in_storage', location_id: 3, machine_tonnage_min: 280, machine_tonnage_max: 500 },
    { code: 'MOLD-005', product_name: 'Gear Wheel', material: 'POM', dimensions: '50x50x20', cavities: 6, weight_kg: 0.8, status: 'active', location_id: 2, machine_tonnage_min: 160, machine_tonnage_max: 280 },
    { code: 'MOLD-006', product_name: 'Bracket', material: 'PA', dimensions: '100x60x10', cavities: 2, weight_kg: 1.5, status: 'in_maintenance', location_id: 4, machine_tonnage_min: 280, machine_tonnage_max: 500 },
    { code: 'MOLD-007', product_name: 'Phone Case', material: 'ABS', dimensions: '70x140x8', cavities: 1, weight_kg: 0.3, status: 'active', location_id: 1, machine_tonnage_min: 90, machine_tonnage_max: 160 },
    { code: 'MOLD-008', product_name: 'Bottle Body', material: 'PET', dimensions: '60x60x200', cavities: 2, weight_kg: 1.8, status: 'active', location_id: 1, machine_tonnage_min: 250, machine_tonnage_max: 400 },
    { code: 'MOLD-009', product_name: 'Toy Block', material: 'ABS', dimensions: '25x25x25', cavities: 12, weight_kg: 0.2, status: 'active', location_id: 2, machine_tonnage_min: 120, machine_tonnage_max: 200 },
    { code: 'MOLD-010', product_name: 'Pipe Fitting', material: 'PVC', dimensions: '40x40x30', cavities: 4, weight_kg: 0.6, status: 'active', location_id: 2, machine_tonnage_min: 160, machine_tonnage_max: 280 },
    { code: 'MOLD-011', product_name: 'Chair Seat', material: 'PP', dimensions: '450x450x50', cavities: 1, weight_kg: 3.5, status: 'active', location_id: 3, machine_tonnage_min: 350, machine_tonnage_max: 500 },
    { code: 'MOLD-012', product_name: 'Lid Cover', material: 'PE', dimensions: '100x100x15', cavities: 3, weight_kg: 0.9, status: 'active', location_id: 3, machine_tonnage_min: 200, machine_tonnage_max: 350 },
    { code: 'MOLD-013', product_name: 'Automotive Panel', material: 'ABS', dimensions: '500x300x20', cavities: 1, weight_kg: 4.2, status: 'in_storage', location_id: 3, machine_tonnage_min: 400, machine_tonnage_max: 650 },
    { code: 'MOLD-014', product_name: 'Medical Syringe', material: 'PP', dimensions: '15x15x60', cavities: 8, weight_kg: 0.15, status: 'active', location_id: 4, machine_tonnage_min: 90, machine_tonnage_max: 150 },
    { code: 'MOLD-015', product_name: 'Electrical Box', material: 'PC', dimensions: '200x150x80', cavities: 1, weight_kg: 2.8, status: 'active', location_id: 4, machine_tonnage_min: 280, machine_tonnage_max: 450 },
    { code: 'MOLD-016', product_name: 'Spoon Set', material: 'PS', dimensions: '180x40x10', cavities: 6, weight_kg: 0.25, status: 'active', location_id: 1, machine_tonnage_min: 120, machine_tonnage_max: 200 },
    { code: 'MOLD-017', product_name: 'Wheel Hub', material: 'PA', dimensions: '80x80x40', cavities: 2, weight_kg: 1.1, status: 'in_maintenance', location_id: 2, machine_tonnage_min: 200, machine_tonnage_max: 320 },
    { code: 'MOLD-018', product_name: 'Storage Bin', material: 'PP', dimensions: '400x300x250', cavities: 1, weight_kg: 5.5, status: 'active', location_id: 3, machine_tonnage_min: 450, machine_tonnage_max: 650 },
    { code: 'MOLD-019', product_name: 'Button Fastener', material: 'ABS', dimensions: '20x20x5', cavities: 16, weight_kg: 0.08, status: 'active', location_id: 4, machine_tonnage_min: 90, machine_tonnage_max: 120 },
    { code: 'MOLD-020', product_name: 'Large Container', material: 'PE', dimensions: '600x400x300', cavities: 1, weight_kg: 8.0, status: 'active', location_id: 3, machine_tonnage_min: 600, machine_tonnage_max: 800 }
  ]);
  
  console.log('Creating optimal parameters...');
  const materials = ['PP', 'ABS', 'PA', 'PC', 'PE', 'PVC', 'PS', 'POM'];
  const params = [];
  
  materials.forEach(material => {
    params.push({
      machine_model: 'Mars',
      material,
      tonnage_min: 90,
      tonnage_max: 160,
      injection_temp_min: material === 'PP' ? 190 : material === 'ABS' ? 210 : material === 'PA' ? 240 : 200,
      injection_temp_max: material === 'PP' ? 250 : material === 'ABS' ? 270 : material === 'PA' ? 290 : 260,
      mold_temp_min: 20,
      mold_temp_max: material === 'PA' ? 80 : 50,
      injection_speed: 50,
      holding_pressure: 100,
      cooling_time: 10
    });
    
    params.push({
      machine_model: 'Mars',
      material,
      tonnage_min: 160,
      tonnage_max: 350,
      injection_temp_min: material === 'PP' ? 200 : material === 'ABS' ? 220 : material === 'PA' ? 250 : 210,
      injection_temp_max: material === 'PP' ? 260 : material === 'ABS' ? 280 : material === 'PA' ? 300 : 270,
      mold_temp_min: 25,
      mold_temp_max: material === 'PA' ? 85 : 55,
      injection_speed: 55,
      holding_pressure: 110,
      cooling_time: 12
    });
    
    params.push({
      machine_model: 'Mars',
      material,
      tonnage_min: 350,
      tonnage_max: 800,
      injection_temp_min: material === 'PP' ? 210 : material === 'ABS' ? 230 : material === 'PA' ? 260 : 220,
      injection_temp_max: material === 'PP' ? 270 : material === 'ABS' ? 290 : material === 'PA' ? 310 : 280,
      mold_temp_min: 30,
      mold_temp_max: material === 'PA' ? 90 : 60,
      injection_speed: 60,
      holding_pressure: 120,
      cooling_time: 15
    });
  });
  
  await OptimalParameter.bulkCreate(params);
  
  console.log('Creating production logs...');
  const now = new Date();
  const oneHourAgo = new Date(now - 3600000);
  const twoHoursAgo = new Date(now - 7200000);
  const threeHoursAgo = new Date(now - 10800000);
  const yesterday = new Date(now - 86400000);
  
  await ProductionLog.bulkCreate([
    { machine_id: 1, mold_id: 1, operator_id: 3, start_time: threeHoursAgo, end_time: twoHoursAgo, quantity_produced: 1500, quantity_rejected: 25, material_used: 'PP', notes: 'Morning shift', status: 'completed' },
    { machine_id: 2, mold_id: 3, operator_id: 3, start_time: twoHoursAgo, end_time: oneHourAgo, quantity_produced: 2800, quantity_rejected: 42, material_used: 'PP', notes: 'Fast cycle', status: 'completed' },
    { machine_id: 3, mold_id: 5, operator_id: 3, start_time: oneHourAgo, end_time: null, quantity_produced: 800, quantity_rejected: 10, material_used: 'POM', notes: 'Ongoing production', status: 'running' },
    { machine_id: 4, mold_id: 7, operator_id: 3, start_time: oneHourAgo, end_time: null, quantity_produced: 450, quantity_rejected: 5, material_used: 'ABS', notes: 'Small batch', status: 'running' },
    { machine_id: 5, mold_id: 2, operator_id: 3, start_time: yesterday, end_time: yesterday, quantity_produced: 3500, quantity_rejected: 80, material_used: 'ABS', notes: 'Completed yesterday', status: 'completed' },
    { machine_id: 1, mold_id: 9, operator_id: 3, start_time: now, end_time: null, quantity_produced: 200, quantity_rejected: 2, material_used: 'ABS', notes: 'Just started', status: 'running' },
    { machine_id: 6, mold_id: 10, operator_id: 3, start_time: twoHoursAgo, end_time: oneHourAgo, quantity_produced: 1200, quantity_rejected: 15, material_used: 'PVC', notes: 'Good quality', status: 'completed' },
    { machine_id: 7, mold_id: 11, operator_id: 3, start_time: oneHourAgo, end_time: null, quantity_produced: 300, quantity_rejected: 8, material_used: 'PP', notes: 'Large part', status: 'running' },
  ]);
  
  console.log('Database initialized successfully!');
  console.log('\nLogin credentials:');
  console.log('  Admin: admin / admin123');
  console.log('  Engineer: engineer / engineer123');
  console.log('  Operator: operator1 / operator123');
}

initDatabase().catch(console.error);