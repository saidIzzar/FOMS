export const maintenance = [
  {
    id: 1,
    machine_id: 4,
    description: "Scheduled preventive maintenance - replace worn hydraulic seals",
    type: "preventive",
    status: "in_progress",
    scheduled_date: "2026-04-13",
    start_time: "2026-04-13T10:00:00",
    end_time: null,
    assigned_to: [7],
    priority: "medium",
    notes: "Expected completion: 16:00",
    cost: 2500
  },
  {
    id: 2,
    machine_id: 8,
    description: "Emergency repair - hydraulic system failure",
    type: "corrective",
    status: "scheduled",
    scheduled_date: "2026-04-13",
    start_time: null,
    end_time: null,
    assigned_to: [7],
    priority: "high",
    notes: "Parts ordered - estimated arrival 14:00",
    cost: 8500
  },
  {
    id: 3,
    machine_id: 1,
    description: "Monthly calibration check",
    type: "preventive",
    status: "scheduled",
    scheduled_date: "2026-04-15",
    start_time: null,
    end_time: null,
    assigned_to: [7],
    priority: "low",
    notes: "Standard monthly maintenance",
    cost: 500
  },
  {
    id: 4,
    machine_id: 2,
    description: "Temperature sensor replacement",
    type: "corrective",
    status: "completed",
    scheduled_date: "2026-04-10",
    start_time: "2026-04-10T09:00:00",
    end_time: "2026-04-10T11:30:00",
    assigned_to: [7],
    priority: "medium",
    notes: "Sensor replaced, calibration verified",
    cost: 1200
  },
  {
    id: 5,
    machine_id: 3,
    description: "Annual inspection and certification",
    type: "preventive",
    status: "completed",
    scheduled_date: "2026-04-08",
    start_time: "2026-04-08T08:00:00",
    end_time: "2026-04-08T16:00:00",
    assigned_to: [7, 4],
    priority: "high",
    notes: "All systems certified, passed inspection",
    cost: 3500
  },
  {
    id: 6,
    machine_id: 6,
    description: "Nozzle cleaning and inspection",
    type: "preventive",
    status: "scheduled",
    scheduled_date: "2026-04-18",
    start_time: null,
    end_time: null,
    assigned_to: [7],
    priority: "low",
    notes: "Standard cleaning schedule",
    cost: 300
  }
];

export const maintenanceTypes = [
  { value: 'preventive', label: 'Preventive', description: 'Scheduled maintenance to prevent issues' },
  { value: 'corrective', label: 'Corrective', description: 'Repair to fix existing problems' },
  { value: 'predictive', label: 'Predictive', description: 'Based on data analysis' },
  { value: 'inspection', label: 'Inspection', description: 'Regular inspection and testing' }
];

export const maintenancePriorities = [
  { value: 'low', label: 'Low', color: '#22c55e' },
  { value: 'medium', label: 'Medium', color: '#facc15' },
  { value: 'high', label: 'High', color: '#ef4444' }
];

export const getMaintenanceById = (id) => maintenance.find(m => m.id === parseInt(id));
export const getMaintenanceByMachine = (machineId) => maintenance.filter(m => m.machine_id === machineId);
export const getMaintenanceByStatus = (status) => maintenance.filter(m => m.status === status);

export const createMaintenance = (item) => {
  const newItem = { 
    ...item, 
    id: Math.max(...maintenance.map(m => m.id)) + 1,
    status: 'scheduled'
  };
  maintenance.push(newItem);
  return newItem;
};

export const updateMaintenance = (id, data) => {
  const index = maintenance.findIndex(m => m.id === parseInt(id));
  if (index !== -1) {
    maintenance[index] = { ...maintenance[index], ...data };
    return maintenance[index];
  }
  return null;
};

export const deleteMaintenance = (id) => {
  const index = maintenance.findIndex(m => m.id === parseInt(id));
  if (index !== -1) {
    maintenance.splice(index, 1);
    return true;
  }
  return false;
};

export default maintenance;