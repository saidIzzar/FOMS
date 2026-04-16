export const machines = [
  { id: 1, name: "HTF-90", model: "Mars", serial_number: "M090001", manufacturer: "Haitian", series: "Mars", tonnage: 90, status: "running", location: "Production Hall A", installation_date: "2023-01-15", cycle_time: 15, injection_temp: 210, mold_temp: 45, holding_pressure: 90, efficiency: 88, total_production: 45000, last_maintenance: "2026-03-15", next_maintenance: "2026-04-15" },
  { id: 2, name: "HTF-120", model: "Mars", serial_number: "M120001", manufacturer: "Haitian", series: "Mars", tonnage: 120, status: "idle", location: "Production Hall A", installation_date: "2023-02-20", cycle_time: 18, injection_temp: 215, mold_temp: 50, holding_pressure: 95, efficiency: 70, total_production: 32000, last_maintenance: "2026-03-20", next_maintenance: "2026-04-20" },
  { id: 3, name: "HTF-160", model: "Mars", serial_number: "M160001", manufacturer: "Haitian", series: "Mars", tonnage: 160, status: "idle", location: "Production Hall A", installation_date: "2022-06-10", cycle_time: 20, injection_temp: 220, mold_temp: 55, holding_pressure: 100, efficiency: 72, total_production: 38000, last_maintenance: "2026-03-18", next_maintenance: "2026-04-18" },
  { id: 4, name: "HTF-200", model: "Mars", serial_number: "M200001", manufacturer: "Haitian", series: "Mars", tonnage: 200, status: "running", location: "Production Hall A", installation_date: "2022-08-15", cycle_time: 22, injection_temp: 225, mold_temp: 58, holding_pressure: 105, efficiency: 85, total_production: 48000, last_maintenance: "2026-04-01", next_maintenance: "2026-05-01" },
  { id: 5, name: "HTF-250", model: "Mars", serial_number: "M250001", manufacturer: "Haitian", series: "Mars", tonnage: 250, status: "maintenance", location: "Production Hall B", installation_date: "2021-05-10", cycle_time: 24, injection_temp: 230, mold_temp: 60, holding_pressure: 110, efficiency: 0, total_production: 52000, last_maintenance: "2026-04-10", next_maintenance: "2026-05-10" },
  { id: 6, name: "HTF-280", model: "Mars", serial_number: "M280001", manufacturer: "Haitian", series: "Mars", tonnage: 280, status: "running", location: "Production Hall B", installation_date: "2021-03-20", cycle_time: 18, injection_temp: 220, mold_temp: 60, holding_pressure: 120, efficiency: 90, total_production: 65000, last_maintenance: "2026-03-25", next_maintenance: "2026-04-25" },
  { id: 7, name: "HTF-320", model: "Mars", serial_number: "M320001", manufacturer: "Haitian", series: "Mars", tonnage: 320, status: "running", location: "Production Hall B", installation_date: "2021-06-15", cycle_time: 25, injection_temp: 235, mold_temp: 65, holding_pressure: 115, efficiency: 87, total_production: 42000, last_maintenance: "2026-04-05", next_maintenance: "2026-05-05" },
  { id: 8, name: "HTF-350", model: "Mars", serial_number: "M350001", manufacturer: "Haitian", series: "Mars", tonnage: 350, status: "maintenance", location: "Production Hall B", installation_date: "2020-11-05", cycle_time: 26, injection_temp: 240, mold_temp: 70, holding_pressure: 120, efficiency: 0, total_production: 75000, last_maintenance: "2026-04-08", next_maintenance: "2026-05-08" },
  { id: 9, name: "HTF-400", model: "Mars", serial_number: "M400001", manufacturer: "Haitian", series: "Mars", tonnage: 400, status: "idle", location: "Production Hall C", installation_date: "2022-01-10", cycle_time: 28, injection_temp: 245, mold_temp: 72, holding_pressure: 125, efficiency: 65, total_production: 35000, last_maintenance: "2026-03-28", next_maintenance: "2026-04-28" },
  { id: 10, name: "HTF-450", model: "Mars", serial_number: "M450001", manufacturer: "Haitian", series: "Mars", tonnage: 450, status: "running", location: "Production Hall C", installation_date: "2022-04-20", cycle_time: 30, injection_temp: 250, mold_temp: 75, holding_pressure: 130, efficiency: 82, total_production: 28000, last_maintenance: "2026-04-02", next_maintenance: "2026-05-02" },
  { id: 11, name: "HTF-500", model: "Mars", serial_number: "M500001", manufacturer: "Haitian", series: "Mars", tonnage: 500, status: "idle", location: "Production Hall C", installation_date: "2022-08-15", cycle_time: 32, injection_temp: 255, mold_temp: 80, holding_pressure: 135, efficiency: 68, total_production: 22000, last_maintenance: "2026-03-30", next_maintenance: "2026-04-30" },
  { id: 12, name: "HTF-650", model: "Mars", serial_number: "M650001", manufacturer: "Haitian", series: "Mars", tonnage: 650, status: "running", location: "Production Hall C", installation_date: "2023-01-05", cycle_time: 35, injection_temp: 260, mold_temp: 85, holding_pressure: 140, efficiency: 79, total_production: 15000, last_maintenance: "2026-04-06", next_maintenance: "2026-05-06" },
  { id: 13, name: "HTF-800", model: "Mars", serial_number: "M800001", manufacturer: "Haitian", series: "Mars", tonnage: 800, status: "running", location: "Production Hall C", installation_date: "2023-05-01", cycle_time: 40, injection_temp: 270, mold_temp: 90, holding_pressure: 150, efficiency: 75, total_production: 8000, last_maintenance: "2026-04-01", next_maintenance: "2026-05-01" },
  { id: 14, name: "ZH-120", model: "Zhafir", serial_number: "Z120001", manufacturer: "Zhafir", series: "Zhafir", tonnage: 120, status: "running", location: "Production Hall D", installation_date: "2023-03-10", cycle_time: 16, injection_temp: 215, mold_temp: 48, holding_pressure: 95, efficiency: 89, total_production: 38000, last_maintenance: "2026-04-03", next_maintenance: "2026-05-03" },
  { id: 15, name: "ZH-180", model: "Zhafir", serial_number: "Z180001", manufacturer: "Zhafir", series: "Zhafir", tonnage: 180, status: "idle", location: "Production Hall D", installation_date: "2022-09-15", cycle_time: 19, injection_temp: 222, mold_temp: 55, holding_pressure: 105, efficiency: 71, total_production: 41000, last_maintenance: "2026-03-22", next_maintenance: "2026-04-22" },
  { id: 16, name: "ZH-280", model: "Zhafir", serial_number: "Z280001", manufacturer: "Zhafir", series: "Zhafir", tonnage: 280, status: "running", location: "Production Hall D", installation_date: "2022-11-20", cycle_time: 17, injection_temp: 228, mold_temp: 62, holding_pressure: 118, efficiency: 91, total_production: 55000, last_maintenance: "2026-04-07", next_maintenance: "2026-05-07" },
  { id: 17, name: "EL-90", model: "El", serial_number: "E090001", manufacturer: "Engel", series: "El", tonnage: 90, status: "idle", location: "Production Hall E", installation_date: "2023-04-01", cycle_time: 14, injection_temp: 205, mold_temp: 42, holding_pressure: 85, efficiency: 66, total_production: 28000, last_maintenance: "2026-03-25", next_maintenance: "2026-04-25" },
  { id: 18, name: "EL-150", model: "El", serial_number: "E150001", manufacturer: "Engel", series: "El", tonnage: 150, status: "maintenance", location: "Production Hall E", installation_date: "2022-07-10", cycle_time: 21, injection_temp: 218, mold_temp: 52, holding_pressure: 100, efficiency: 0, total_production: 46000, last_maintenance: "2026-04-09", next_maintenance: "2026-05-09" },
  { id: 19, name: "EL-250", model: "El", serial_number: "E250001", manufacturer: "Engel", series: "El", tonnage: 250, status: "running", location: "Production Hall E", installation_date: "2022-12-05", cycle_time: 23, injection_temp: 232, mold_temp: 60, holding_pressure: 112, efficiency: 86, total_production: 36000, last_maintenance: "2026-04-04", next_maintenance: "2026-05-04" },
  { id: 20, name: "EL-400", model: "El", serial_number: "E400001", manufacturer: "Engel", series: "El", tonnage: 400, status: "idle", location: "Production Hall E", installation_date: "2023-02-15", cycle_time: 29, injection_temp: 248, mold_temp: 75, holding_pressure: 128, efficiency: 64, total_production: 19000, last_maintenance: "2026-03-29", next_maintenance: "2026-04-29" }
];

export const getMachineById = (id) => machines.find(m => m.id === parseInt(id));
export const getMachinesByStatus = (status) => machines.filter(m => m.status === status);

export const createMachine = (machine) => {
  const newMachine = { ...machine, id: Math.max(...machines.map(m => m.id)) + 1 };
  machines.push(newMachine);
  return newMachine;
};

export const updateMachine = (id, data) => {
  const index = machines.findIndex(m => m.id === parseInt(id));
  if (index !== -1) {
    machines[index] = { ...machines[index], ...data };
    return machines[index];
  }
  return null;
};

export const deleteMachine = (id) => {
  const index = machines.findIndex(m => m.id === parseInt(id));
  if (index !== -1) {
    machines.splice(index, 1);
    return true;
  }
  return false;
};

export default machines;