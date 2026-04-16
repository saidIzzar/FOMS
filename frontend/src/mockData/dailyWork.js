export const dailyWork = [
  {
    id: 1,
    machine_id: 1,
    mold_id: 1,
    operation_type: "mold_change",
    start_time: "2026-04-13T08:00:00",
    end_time: "2026-04-13T08:35:00",
    operators: [1, 2],
    notes: "Changed from MOLD-C08 to MOLD-A12 for new production batch",
    quantity_produced: null,
    quantity_rejected: null,
    status: "completed"
  },
  {
    id: 2,
    machine_id: 1,
    mold_id: 1,
    operation_type: "start_production",
    start_time: "2026-04-13T08:35:00",
    end_time: null,
    operators: [1, 2],
    notes: "Started production of Electrical Switch Cover",
    quantity_produced: 1250,
    quantity_rejected: 12,
    status: "running"
  },
  {
    id: 3,
    machine_id: 3,
    mold_id: 3,
    operation_type: "start_production",
    start_time: "2026-04-13T06:00:00",
    end_time: null,
    operators: [6, 8],
    notes: "Medical device housing production - high precision batch",
    quantity_produced: 450,
    quantity_rejected: 3,
    status: "running"
  },
  {
    id: 4,
    machine_id: 5,
    mold_id: 4,
    operation_type: "start_production",
    start_time: "2026-04-13T07:30:00",
    end_time: null,
    operators: [2],
    notes: "Consumer electronics case production",
    quantity_produced: 890,
    quantity_rejected: 8,
    status: "running"
  },
  {
    id: 5,
    machine_id: 7,
    mold_id: 2,
    operation_type: "start_production",
    start_time: "2026-04-13T09:00:00",
    end_time: null,
    operators: [6],
    notes: "Automotive dashboard panel - urgent order",
    quantity_produced: 320,
    quantity_rejected: 15,
    status: "running"
  },
  {
    id: 6,
    machine_id: 4,
    mold_id: null,
    operation_type: "setup",
    start_time: "2026-04-13T10:00:00",
    end_time: null,
    operators: [7],
    notes: "Scheduled maintenance - replacing worn components",
    quantity_produced: null,
    quantity_rejected: null,
    status: "in_progress"
  },
  {
    id: 7,
    machine_id: 2,
    mold_id: null,
    operation_type: "setup",
    start_time: "2026-04-13T11:00:00",
    end_time: null,
    operators: [],
    notes: "Waiting for mold assignment",
    quantity_produced: null,
    quantity_rejected: null,
    status: "idle"
  },
  {
    id: 8,
    machine_id: 6,
    mold_id: null,
    operation_type: "stop_production",
    start_time: "2026-04-12T22:00:00",
    end_time: "2026-04-12T22:15:00",
    operators: [1],
    notes: "End of night shift - machine stopped",
    quantity_produced: 1800,
    quantity_rejected: 22,
    status: "completed"
  },
  {
    id: 9,
    machine_id: 8,
    mold_id: null,
    operation_type: "setup",
    start_time: "2026-04-13T10:30:00",
    end_time: null,
    operators: [7],
    notes: "EMERGENCY - Hydraulic system failure - awaiting repair",
    quantity_produced: null,
    quantity_rejected: null,
    status: "maintenance"
  },
  {
    id: 10,
    machine_id: 1,
    mold_id: 1,
    operation_type: "stop_production",
    start_time: "2026-04-12T18:00:00",
    end_time: "2026-04-12T18:20:00",
    operators: [2],
    notes: "End of day shift",
    quantity_produced: 3200,
    quantity_rejected: 45,
    status: "completed"
  }
];

export const operationTypes = [
  { value: 'setup', label: 'Setup', description: 'Machine setup and preparation' },
  { value: 'mold_change', label: 'Mold Change', description: 'Changing the mold on machine' },
  { value: 'start_production', label: 'Start Production', description: 'Start production run' },
  { value: 'stop_production', label: 'Stop Production', description: 'Stop production run' },
  { value: 'maintenance', label: 'Maintenance', description: 'Maintenance work' },
  { value: 'quality_check', label: 'Quality Check', description: 'Quality inspection' }
];

export const getWorkById = (id) => dailyWork.find(w => w.id === parseInt(id));
export const getWorkByMachine = (machineId) => dailyWork.filter(w => w.machine_id === machineId);
export const getActiveWork = () => dailyWork.filter(w => w.status === 'running' || w.status === 'in_progress');

export const createWork = (work) => {
  const newWork = { 
    ...work, 
    id: Math.max(...dailyWork.map(w => w.id)) + 1,
    status: 'running'
  };
  dailyWork.push(newWork);
  return newWork;
};

export const updateWork = (id, data) => {
  const index = dailyWork.findIndex(w => w.id === parseInt(id));
  if (index !== -1) {
    dailyWork[index] = { ...dailyWork[index], ...data };
    return dailyWork[index];
  }
  return null;
};

export const deleteWork = (id) => {
  const index = dailyWork.findIndex(w => w.id === parseInt(id));
  if (index !== -1) {
    dailyWork.splice(index, 1);
    return true;
  }
  return false;
};

export default dailyWork;