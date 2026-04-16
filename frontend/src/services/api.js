import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

console.log('API_URL:', API_URL);

const api = axios.create({
  baseURL: `${API_URL}/v1`,
  headers: {
    'Content-Type': 'application/json'
  }
});

const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for logging
api.interceptors.response.use(
  response => {
    console.log('API Response:', response.config.url, response.data);
    return response;
  },
  error => {
    console.error('API Error:', error.config?.url, error.message);
    return Promise.reject(error);
  }
);

// Response interceptor for 401 handling
authApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const handleError = (error, fallbackData) => {
  console.warn('API Error, using fallback:', error.message);
  return { data: fallbackData };
};

export const authAPI = {
  login: (username, password) => authApi.post('/auth/token', { username, password }),
  refresh: () => authApi.post('/auth/token/refresh'),
  me: () => authApi.get('/auth/me'),
  updateProfile: (data) => authApi.patch('/auth/me', data),
  register: (data) => authApi.post('/auth/register', data)
};

export const branchesAPI = {
  getAll: () => api.get('/branches').catch(e => handleError(e, [
    { id: 1, name: 'Main Factory', location: 'Building A', is_active: true },
    { id: 2, name: 'Secondary Factory', location: 'Building B', is_active: true }
  ])),
  getById: (id) => api.get(`/branches/${id}`).catch(e => handleError(e, {})),
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.patch(`/branches/${id}`, data).catch(e => handleError(e, {})),
  delete: (id) => api.delete(`/branches/${id}`)
};

export const machineSpecsAPI = {
  getAll: () => api.get('/machine-specs').catch(e => handleError(e, [
    { id: 1, machine_class: '90T', tonnage: 90 },
    { id: 2, machine_class: '120T', tonnage: 120 },
    { id: 3, machine_class: '160T', tonnage: 160 },
    { id: 4, machine_class: '200T', tonnage: 200 },
    { id: 5, machine_class: '250T', tonnage: 250 },
    { id: 6, machine_class: '280T', tonnage: 280 },
    { id: 7, machine_class: '380T', tonnage: 380 },
    { id: 8, machine_class: '450T', tonnage: 450 },
    { id: 9, machine_class: '470T', tonnage: 470 },
    { id: 10, machine_class: '800T', tonnage: 800 }
  ]))
};

export const machinesAPI = {
  getAll: () => api.get('/machines').catch(e => handleError(e, [
    { id: 1, machine_code: '90T/1', branch_id: 1, spec_id: 1, serial_number: 'SN90-001', status: 'running', is_active: true, spec: { machine_class: '90T', tonnage: 90, ideal_cycle_time_sec: 10 }, branch: { id: 1, name: 'Main Factory' } },
    { id: 2, machine_code: '90T/2', branch_id: 1, spec_id: 1, serial_number: 'SN90-002', status: 'idle', is_active: true, spec: { machine_class: '90T', tonnage: 90, ideal_cycle_time_sec: 10 }, branch: { id: 1, name: 'Main Factory' } },
    { id: 3, machine_code: '120T/1', branch_id: 1, spec_id: 2, serial_number: 'SN120-001', status: 'running', is_active: true, spec: { machine_class: '120T', tonnage: 120, ideal_cycle_time_sec: 12 }, branch: { id: 1, name: 'Main Factory' } },
    { id: 4, machine_code: '120T/2', branch_id: 2, spec_id: 2, serial_number: 'SN120-002', status: 'maintenance', is_active: true, spec: { machine_class: '120T', tonnage: 120, ideal_cycle_time_sec: 12 }, branch: { id: 2, name: 'Secondary Factory' } },
    { id: 5, machine_code: '160T/1', branch_id: 1, spec_id: 3, serial_number: 'SN160-001', status: 'running', is_active: true, spec: { machine_class: '160T', tonnage: 160, ideal_cycle_time_sec: 14 }, branch: { id: 1, name: 'Main Factory' } },
  ])),
  getById: (id) => api.get(`/machines/${id}`).catch(e => handleError(e, {})),
  create: (data) => api.post('/machines', data),
  update: (id, data) => api.patch(`/machines/${id}`, data),
  delete: (id) => api.delete(`/machines/${id}`),
  getLogs: () => api.get('/machines/logs').catch(e => handleError(e, [])),
  saveReglage: (data) => api.post('/machines/save-reglage/', data),
  checkParameters: (data) => api.post('/machines/smart-check-parameters/', data),
  getOptimalParameters: () => api.get('/machines/optimal-parameters'),
  createOptimalParameter: (data) => api.post('/machines/optimal-parameters', data)
};

export const moldsAPI = {
  getAll: () => api.get('/molds').catch(e => handleError(e, [
    { id: 1, mold_code: 'M-001', length_mm: 300, width_mm: 250, height_mm: 150, weight_kg: 120, required_tonnage: 90, required_shot_volume: 80, cavities: 4, steel_type: 'P20', status: 'active', is_active: true },
    { id: 2, mold_code: 'M-002', length_mm: 350, width_mm: 300, height_mm: 180, weight_kg: 150, required_tonnage: 120, required_shot_volume: 120, cavities: 2, steel_type: 'H13', status: 'active', is_active: true },
    { id: 3, mold_code: 'M-003', length_mm: 400, width_mm: 350, height_mm: 200, weight_kg: 180, required_tonnage: 160, required_shot_volume: 180, cavities: 6, steel_type: 'P20', status: 'active', is_active: true },
    { id: 4, mold_code: 'M-004', length_mm: 450, width_mm: 400, height_mm: 220, weight_kg: 220, required_tonnage: 200, required_shot_volume: 250, cavities: 1, steel_type: 'S136', status: 'active', is_active: true },
    { id: 5, mold_code: 'M-005', length_mm: 500, width_mm: 450, height_mm: 250, weight_kg: 280, required_tonnage: 250, required_shot_volume: 350, cavities: 8, steel_type: 'P20', status: 'active', is_active: true },
  ])),
  getList: () => api.get('/molds/list').catch(e => handleError(e, [])),
  getById: (id) => api.get(`/molds/${id}`).catch(e => handleError(e, {})),
  create: (data) => api.post('/molds', data),
  update: (id, data) => api.patch(`/molds/${id}`, data).catch(e => handleError(e, {})),
  delete: (id) => api.delete(`/molds/${id}`),
  getLocations: () => api.get('/molds/locations').catch(e => handleError(e, [])),
  createLocation: (data) => api.post('/molds/locations', data)
};

export const usersAPI = {
  getAll: () => api.get('/accounts').catch(e => handleError(e, [])),
  getById: (id) => api.get(`/accounts/${id}`).catch(e => handleError(e, {})),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.patch(`/accounts/${id}`, data).catch(e => handleError(e, {})),
  delete: (id) => api.delete(`/accounts/${id}`)
};

export const maintenanceAPI = {
  getAll: () => api.get('/maintenance-records').catch(e => handleError(e, [
    {id: 1, machine_id: 1, machine_code: "90T/1", description: "Regular preventive maintenance", type: "preventive", status: "scheduled", scheduled_date: "2026-04-15", priority: "medium"},
    {id: 2, machine_id: 2, machine_code: "90T/2", description: "Corrective maintenance needed", type: "corrective", status: "in_progress", scheduled_date: "2026-04-14", priority: "high"},
    {id: 3, machine_id: 3, machine_code: "120T/1", description: "Inspection completed", type: "inspection", status: "completed", scheduled_date: "2026-04-13", priority: "low"},
  ])),
  getById: (id) => Promise.resolve({ data: {} }),
  create: (data) => api.post('/maintenance-records', data),
  update: (id, data) => Promise.resolve({ data: { id, ...data } }),
  delete: (id) => Promise.resolve({ data: {} })
};

export const productionAPI = {
  getAll: () => api.get('/production').catch(e => handleError(e, [])),
  getById: (id) => api.get(`/production/${id}`).catch(e => handleError(e, {})),
  create: (data) => api.post('/production', data),
  update: (id, data) => api.patch(`/production/${id}`, data),
  delete: (id) => api.delete(`/production/${id}`),
  
  mountMold: (runId) => api.post(`/production/${runId}/mount-mold`, {}),
  changeMold: (runId, newMoldId) => api.post(`/production/${runId}/change-mold`, { new_mold_id: newMoldId }),
  finish: (runId, data) => api.patch(`/production/${runId}/finish`, data)
};

export const operatorsAPI = {
  getAll: () => api.get('/operators').catch(e => handleError(e, [])),
  create: (data) => api.post('/operators', data),
  getById: (id) => api.get(`/operators/${id}`).catch(e => handleError(e, {}))
};

export const materialsAPI = {
  getAll: () => api.get('/materials').catch(e => handleError(e, [])),
  getById: (id) => api.get(`/materials/${id}`).catch(e => handleError(e, {})),
  getSuppliers: () => api.get('/materials').catch(e => handleError(e, [])),
  createSupplier: (data) => api.post('/materials', data),
  getReceptions: () => api.get('/materials/receptions').catch(e => handleError(e, [])),
  createReception: (data) => api.post('/materials/receptions', data),
  getTests: () => api.get('/materials/tests').catch(e => handleError(e, [])),
  createTest: (data) => api.post('/materials/tests', data)
};

export const aiAPI = {
  getRecommendations: (material, tonnage) => api.get('/ai/recommendations', { params: { material, tonnage } }).catch(e => handleError(e, { recommendations: [{ injection_speed: 85, holding_pressure: 120, cooling_time: 15, melt_temperature: 220 }] })),
  getMachineSuitability: (tonnage, material) => api.get('/ai/machine-suitability', { params: { tonnage, material } }).catch(e => handleError(e, { machines: [
    { id: 1, machine_code: '90T/1', tonnage: 90, compatibility_score: 95 },
    { id: 2, machine_code: '120T/1', tonnage: 120, compatibility_score: 88 }
  ] })),
  getMaintenancePrediction: (machineId) => api.get('/ai/maintenance-prediction', { params: { machine_id: machineId } }).catch(e => handleError(e, { 
    risk_level: 'low', 
    message: 'Machine is in good condition',
    days_since_maintenance: 30,
    next_maintenance: '2026-05-15'
  })),
  defectDetection: (data) => api.post('/ai/defect-detection', data).catch(e => handleError(e, { result: 'ok', defects: [] })),
  findCompatibleMachines: (moldId) => api.get('/ai/find-compatible-machines', { params: { mold_id: moldId } }).catch(e => handleError(e, { 
    compatible_machines: [
      { id: 1, machine_code: '90T/1', tonnage: 90, cycle_time: 10, status: 'running', compatibility_score: 95 },
      { id: 2, machine_code: '90T/2', tonnage: 90, cycle_time: 10, status: 'idle', compatibility_score: 90 },
      { id: 3, machine_code: '120T/1', tonnage: 120, cycle_time: 12, status: 'running', compatibility_score: 85 }
    ], 
    total_found: 3 
  }))
};

export const rayounsAPI = {
  getTree: () => api.get('/rayouns/tree').catch(e => handleError(e, [
    { id: 1, name: 'A', description: 'Rayoun A Storage', is_active: true, boxes: [
      { id: 1, box_number: 'A-01', rayoun_id: 1, position: 1, capacity: 20, status: 'available', molds: [] },
      { id: 2, box_number: 'A-02', rayoun_id: 1, position: 2, capacity: 20, status: 'available', molds: [] },
      { id: 3, box_number: 'A-03', rayoun_id: 1, position: 3, capacity: 20, status: 'available', molds: [] }
    ]},
    { id: 2, name: 'B', description: 'Rayoun B Storage', is_active: true, boxes: [
      { id: 4, box_number: 'B-01', rayoun_id: 2, position: 1, capacity: 20, status: 'available', molds: [] },
      { id: 5, box_number: 'B-02', rayoun_id: 2, position: 2, capacity: 20, status: 'available', molds: [] },
      { id: 6, box_number: 'B-03', rayoun_id: 2, position: 3, capacity: 20, status: 'available', molds: [] }
    ]},
    { id: 3, name: 'C', description: 'Rayoun C Storage', is_active: true, boxes: [
      { id: 7, box_number: 'C-01', rayoun_id: 3, position: 1, capacity: 20, status: 'available', molds: [] },
      { id: 8, box_number: 'C-02', rayoun_id: 3, position: 2, capacity: 20, status: 'available', molds: [] },
      { id: 9, box_number: 'C-03', rayoun_id: 3, position: 3, capacity: 20, status: 'available', molds: [] }
    ]}
  ])),
  getAll: () => api.get('/rayouns').catch(e => handleError(e, [
    { id: 1, name: 'A', description: 'Rayoun A', is_active: true },
    { id: 2, name: 'B', description: 'Rayoun B', is_active: true },
    { id: 3, name: 'C', description: 'Rayoun C', is_active: true }
  ])),
  getById: (id) => api.get(`/rayouns/${id}`).catch(e => handleError(e, {})),
  create: (data) => api.post('/rayouns', data),
  delete: (id) => api.delete(`/rayouns/${id}`),
  seed: () => api.post('/rayouns/seed').catch(e => handleError(e, { message: 'Seeded' })),
  seedAll: () => api.post('/seed-all').catch(e => handleError(e, { message: 'Seeded' })),
  
  assignMoldToBox: (moldId, boxId) => api.patch(`/molds/${moldId}`, { box_id: boxId }),
  removeMoldFromBox: (moldId) => api.patch(`/molds/${moldId}`, { box_id: null }),
  updateMoldLocation: (moldId, location) => api.patch(`/rayouns/molds/${moldId}/location`, { location }),
  assignMolds: () => api.post('/rayouns/assign-molds').catch(e => handleError(e, { message: 'Assigned' }))
};

export const boxesAPI = {
  getAll: () => api.get('/boxes').catch(e => handleError(e, [])),
  getByRayoun: (rayounId) => api.get(`/rayouns/${rayounId}/boxes`).catch(e => handleError(e, [])),
  getById: (id) => api.get(`/boxes/${id}`).catch(e => handleError(e, {})),
  create: (data) => api.post('/boxes', data),
  updateStatus: (id, status) => api.patch(`/boxes/${id}/status`, null, { params: { status } }),
  delete: (id) => api.delete(`/boxes/${id}`),
  seed: () => api.post('/boxes/seed')
};

export const compatibilityAPI = {
  check: (machineId, moldId) => api.post('/compatibility/check', { machine_id: machineId, mold_id: moldId }),
  getBestMachine: (moldId, branchId) => api.get(`/compatibility/best-machine/${moldId}?branch_id=${branchId || ''}`),
  getAllScores: (moldId) => api.get(`/compatibility/all-machines/${moldId}`),
  selectMachine: (moldId, strategy = 'score') => api.get(`/compatibility/select/${moldId}?strategy=${strategy}`)
};

export default api;
