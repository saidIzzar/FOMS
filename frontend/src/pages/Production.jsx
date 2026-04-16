import { useState, useEffect } from 'react';
import { productionAPI, machinesAPI, moldsAPI, usersAPI } from '../services/api';
import { useCrud } from '../hooks/useCrud';
import { useNotifications } from '../context/NotificationContext';
import { Plus, Package, Play, Square, Settings, Clock, User, Calendar, FileText, Edit2, Trash2, X, CheckCircle, AlertCircle, Sparkles, ChevronRight, Zap, Download, FileSpreadsheet } from 'lucide-react';
import CrudModal from '../components/CrudModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { calculateCompatibility, getBestMachine } from '../utils/compatibility';
import { exportToCSV, exportToPDF } from '../utils/export';

const OPERATION_TYPES = [
  { value: 'setup', label: 'Setup', icon: Settings, color: '#38bdf8' },
  { value: 'mold_change', label: 'Mold Change', icon: Package, color: '#facc15' },
  { value: 'start_production', label: 'Start Production', icon: Play, color: '#22c55e' },
  { value: 'stop_production', label: 'Stop Production', icon: Square, color: '#ef4444' },
  { value: 'maintenance', label: 'Maintenance', icon: Settings, color: '#a855f7' },
  { value: 'quality_check', label: 'Quality Check', icon: CheckCircle, color: '#ec4899' }
];

const STATUS_COLORS = {
  running: '#22c55e',
  idle: '#facc15',
  in_progress: '#38bdf8',
  completed: '#64748b',
  maintenance: '#a855f7'
};

const STATUS_LABELS = {
  running: 'Running',
  idle: 'Idle',
  in_progress: 'In Progress',
  completed: 'Completed',
  maintenance: 'Maintenance'
};

const workFields = [
  { name: 'machine_id', label: 'Machine', type: 'select', required: true, options: [] },
  { name: 'mold_id', label: 'Mold', type: 'select', options: [] },
  { name: 'operation_type', label: 'Operation Type', type: 'select', required: true, options: OPERATION_TYPES },
  { name: 'start_time', label: 'Start Time', type: 'text', required: true, placeholder: 'YYYY-MM-DDTHH:MM:SS' },
  { name: 'end_time', label: 'End Time', type: 'text', placeholder: 'YYYY-MM-DDTHH:MM:SS (leave empty for ongoing)' },
  { name: 'operator_id', label: 'Operator', type: 'select', required: true, options: [] },
  { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Add any notes...' },
  { name: 'quantity_produced', label: 'Quantity Produced', type: 'number', min: 0, defaultValue: 0 },
  { name: 'quantity_rejected', label: 'Quantity Rejected', type: 'number', min: 0, defaultValue: 0 },
];

export default function Production() {
  const { success, error } = useNotifications();
  const { data: work, loading, fetchAll, create, update, remove } = useCrud(productionAPI);
  const [machines, setMachines] = useState([]);
  const [molds, setMolds] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  
  const [selectedMold, setSelectedMold] = useState(null);
  const [compatibleMachines, setCompatibleMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);

  useEffect(() => {
    fetchAll();
    loadOptions();
  }, [fetchAll]);

  const loadOptions = async () => {
    try {
      const [machinesRes, moldsRes, usersRes] = await Promise.all([
        machinesAPI.getAll(),
        moldsAPI.getAll(),
        usersAPI.getAll()
      ]);
      setMachines(machinesRes.data);
      setMolds(moldsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error loading options:', err);
    }
  };

  const handleMoldSelection = (moldId) => {
    if (!moldId) {
      setSelectedMold(null);
      setCompatibleMachines([]);
      setSelectedMachine(null);
      return;
    }
    const mold = molds.find(m => m.id === parseInt(moldId));
    setSelectedMold(mold);
    const compatible = calculateCompatibility(mold, machines);
    setCompatibleMachines(compatible);
    setSelectedMachine(null);
  };

  const handleAutoAssign = () => {
    const best = getBestMachine(selectedMold, machines);
    if (best) {
      setSelectedMachine(best.id.toString());
      success(`Auto-assigned ${best.name} (Best match: ${best.compatibilityScore}%)`);
    }
  };

  const getOperationInfo = (type) => OPERATION_TYPES.find(t => t.value === type) || OPERATION_TYPES[0];

  const getMachineDisplay = (log) => {
    if (log.machine) return log.machine;
    const machine = machines.find(m => m.id === log.machine_id);
    return machine || { name: `Machine #${log.machine_id}`, tonnage: 0 };
  };
  
  const getMoldDisplay = (log) => {
    if (log.mold) return log.mold;
    const mold = molds.find(m => m.id === log.mold_id);
    return mold || { code: 'No mold' };
  };
  
  const getOperatorDisplay = (log) => {
    if (log.operator) {
      const op = log.operator;
      return `${op.first_name || op.username} ${op.last_name || ''}`.trim();
    }
    if (log.operator_id) {
      const user = users.find(u => u.id === log.operator_id);
      return user ? `${user.first_name || user.username} ${user.last_name || ''}`.trim() : `Operator #${log.operator_id}`;
    }
    return 'Unassigned';
  };

  const activeProduction = work.filter(l => l.status === 'running' || l.status === 'in_progress');
  const completedProduction = work.filter(l => l.status === 'completed').slice(0, 20);

  const handleCreate = async (formData) => {
    try {
      const submitData = {
        ...formData,
        machine_id: parseInt(formData.machine_id),
        mold_id: formData.mold_id ? parseInt(formData.mold_id) : null,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
        operator_id: formData.operator_id ? parseInt(formData.operator_id) : null,
        quantity_produced: parseInt(formData.quantity_produced) || 0,
        quantity_rejected: parseInt(formData.quantity_rejected) || 0,
        material_used: formData.material_used || '',
        status: 'running'
      };
      await create(submitData);
      success('Work entry created successfully');
      setModalOpen(false);
    } catch (err) {
      error('Failed to create work entry');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const submitData = {
        ...formData,
        machine_id: parseInt(formData.machine_id),
        mold_id: formData.mold_id ? parseInt(formData.mold_id) : null,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
        operator_id: formData.operator_id ? parseInt(formData.operator_id) : null,
        quantity_produced: parseInt(formData.quantity_produced) || 0,
        quantity_rejected: parseInt(formData.quantity_rejected) || 0,
        material_used: formData.material_used || ''
      };
      await update(editingItem.id, submitData);
      success('Work entry updated successfully');
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      error('Failed to update work entry');
    }
  };

  const handleDelete = async () => {
    try {
      await remove(deleteDialog.item.id);
      success('Work entry deleted successfully');
      setDeleteDialog({ open: false, item: null });
    } catch (err) {
      error('Failed to delete work entry');
    }
  };

  const CompatibilitySection = ({ value, onChange, formData }) => {
    const moldId = formData?.mold_id;
    const [autoAssigned, setAutoAssigned] = useState(false);
    
    useEffect(() => {
      if (moldId && !autoAssigned) {
        const mold = molds.find(m => m.id === parseInt(moldId));
        if (mold) {
          const compatible = calculateCompatibility(mold, machines);
          const best = compatible.find(m => m.status !== 'maintenance' && m.status !== 'broken');
          if (best) {
            onChange(best.id.toString());
            setAutoAssigned(true);
          }
        }
      }
    }, [moldId]);

    useEffect(() => {
      if (!moldId) {
        setAutoAssigned(false);
      }
    }, [moldId]);

    if (!moldId) {
      return (
        <div className="p-4 bg-surface/50 border border-dashed border-white/20 rounded-xl">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Sparkles size={18} className="text-primary" />
            <span className="text-sm">Select a mold above to see compatible machines</span>
          </div>
        </div>
      );
    }
    
    const mold = molds.find(m => m.id === parseInt(moldId));
    const compatible = mold ? calculateCompatibility(mold, machines) : [];

    if (compatible.length === 0) {
      return (
        <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl">
          <p className="text-warning text-sm">No compatible machines found for this mold.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <span className="text-sm font-medium text-on-surface">Compatible Machines</span>
          </div>
          <button
            type="button"
            onClick={() => {
              const best = compatible.find(m => m.status !== 'maintenance' && m.status !== 'broken');
              if (best) {
                onChange(best.id.toString());
              }
            }}
            className="btn-secondary flex items-center gap-2 text-xs py-1.5 px-3"
          >
            <Zap size={12} />
            Auto Assign
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
          {compatible.slice(0, 5).map(machine => (
            <div
              key={machine.id}
              onClick={() => onChange(machine.id.toString())}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                formData?.machine_id === machine.id.toString()
                  ? 'border-primary bg-primary/10'
                  : machine.isOptimal
                    ? 'border-secondary/50 bg-secondary/5 hover:border-secondary'
                    : 'border-transparent bg-surface hover:bg-surface/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {machine.isOptimal && <span>⭐</span>}
                  {machine.isRecommended && !machine.isOptimal && <span>🟢</span>}
                  {machine.isNotOptimal && !machine.isRecommended && <span>⚠️</span>}
                  <div>
                    <p className="font-medium text-on-surface text-sm">{machine.name}</p>
                    <p className="text-xs text-on-surface-variant">{machine.tonnage}T • {machine.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${
                    machine.isOptimal ? 'text-secondary' :
                    machine.isRecommended ? 'text-primary' : 'text-warning'
                  }`}>
                    {machine.compatibilityScore}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const preparedFields = [
    { 
      name: 'mold_id', 
      label: 'Mold', 
      type: 'select', 
      required: true,
      options: molds.filter(m => m.is_active).map(m => ({ value: m.id, label: `${m.mold_code} - ${m.steel_type} (${m.cavities} cavities)` })) 
    },
    { 
      name: '_compatibility',
      label: 'Compatible Machines',
      type: 'custom'
    },
    { 
      name: 'machine_id', 
      label: 'Machine', 
      type: 'select', 
      required: true, 
      options: machines.map(m => ({ value: m.id, label: `${m.machine_code} - ${m.spec?.tonnage || 'N/A'}T (${m.branch?.name || 'N/A'})` })) 
    },
    { 
      name: 'operation_type', 
      label: 'Operation Type', 
      type: 'select', 
      required: true, 
      options: OPERATION_TYPES 
    },
    { name: 'start_time', label: 'Start Time', type: 'datetime-local', required: true, defaultValue: new Date().toISOString().slice(0, 16) },
    { name: 'end_time', label: 'End Time', type: 'datetime-local', placeholder: 'Optional' },
    { 
      name: 'operator_id', 
      label: 'Operator', 
      type: 'select', 
      required: true,
      options: users.filter(u => u.role === 'operator').map(u => ({ value: u.id, label: `${u.first_name || u.username} ${u.last_name || ''}` })) 
    },
    { name: 'material_used', label: 'Material', type: 'text', placeholder: 'e.g. PP, ABS' },
    { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Add any notes...' },
    { name: 'quantity_produced', label: 'Quantity Produced', type: 'number', min: 0, defaultValue: 0 },
    { name: 'quantity_rejected', label: 'Quantity Rejected', type: 'number', min: 0, defaultValue: 0 },
  ];

  if (loading && work.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="glass-card p-4">
              <div className="skeleton h-8 w-24 mb-2 rounded"></div>
              <div className="skeleton h-4 w-32 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Daily Work</h1>
          <p className="text-on-surface-variant mt-1">Production operations and tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => exportToCSV(work, 'production', ['Machine', 'Mold', 'Operation', 'Start Time', 'End Time', 'Quantity', 'Status'])}
            className="btn-secondary flex items-center gap-2"
          >
            <FileSpreadsheet size={16} />
            CSV
          </button>
          <button 
            onClick={() => exportToPDF(work, 'production', 'Production Report', [
              { key: 'machine_id', label: 'Machine' },
              { key: 'mold_id', label: 'Mold' },
              { key: 'operation_type', label: 'Operation' },
              { key: 'start_time', label: 'Start Time' },
              { key: 'quantity_produced', label: 'Quantity' }
            ])}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={16} />
            PDF
          </button>
          <button 
            onClick={() => { setEditingItem(null); setModalOpen(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Work Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card border-l-4 border-l-secondary hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/20 rounded-xl">
              <Play size={22} className="text-secondary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-on-surface">{activeProduction.length}</p>
              <p className="text-sm text-on-surface-variant">Active</p>
            </div>
          </div>
        </div>

        <div className="glass-card border-l-4 border-l-primary hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Clock size={22} className="text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-on-surface">{completedProduction.length}</p>
              <p className="text-sm text-on-surface-variant">Completed Today</p>
            </div>
          </div>
        </div>

        <div className="glass-card border-l-4 border-l-warning hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/20 rounded-xl">
              <Package size={22} className="text-warning" />
            </div>
            <div>
              <p className="text-3xl font-bold text-on-surface">
                {work.reduce((acc, l) => acc + (l.quantity_produced || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-on-surface-variant">Total Output</p>
            </div>
          </div>
        </div>

        <div className="glass-card border-l-4 border-l-error hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-error/20 rounded-xl">
              <FileText size={22} className="text-error" />
            </div>
            <div>
              <p className="text-3xl font-bold text-on-surface">
                {work.reduce((acc, l) => acc + (l.quantity_rejected || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-on-surface-variant">Defects</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card">
          <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <Play size={20} className="text-secondary" />
            Active Operations
          </h3>
          {activeProduction.length > 0 ? (
            <div className="space-y-3">
              {activeProduction.map(log => {
                const opInfo = getOperationInfo(log.operation_type);
                const machine = getMachineDisplay(log);
                const mold = getMoldDisplay(log);
                const operator = getOperatorDisplay(log);
                return (
                  <div key={log.id} className="p-4 bg-surface/50 rounded-xl flex items-center justify-between hover:bg-surface/70 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl" style={{ backgroundColor: opInfo.color + '20' }}>
                        <opInfo.icon size={18} style={{ color: opInfo.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-on-surface-variant">#{log.id}</span>
                          <p className="font-medium text-on-surface">{machine.name}</p>
                          <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">{machine.tonnage}T</span>
                        </div>
                        <p className="text-sm text-on-surface-variant">{mold.code} - {mold.product_name}</p>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                          <User size={10} />
                          {operator}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm text-on-surface-variant">
                          {new Date(log.start_time).toLocaleString()}
                        </p>
                        <p className="text-xs text-secondary flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                          Running
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                        <button
                          onClick={() => { setEditingItem(log); setModalOpen(true); }}
                          className="p-1.5 rounded-lg hover:bg-primary/20 text-on-surface-variant hover:text-primary"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ open: true, item: log })}
                          className="p-1.5 rounded-lg hover:bg-error/20 text-on-surface-variant hover:text-error"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 bg-surface/50 rounded-full flex items-center justify-center">
                <Clock size={32} className="text-on-surface-variant" />
              </div>
              <p className="text-on-surface-variant">No active operations</p>
            </div>
          )}
        </div>

        <div className="glass-card">
          <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            Recent History
          </h3>
          {completedProduction.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {completedProduction.map(log => {
                const opInfo = getOperationInfo(log.operation_type);
                const machine = getMachineDisplay(log);
                const mold = getMoldDisplay(log);
                const operator = getOperatorDisplay(log);
                const startTime = new Date(log.start_time);
                const endTime = log.end_time ? new Date(log.end_time) : null;
                const duration = endTime ? Math.round((endTime - startTime) / 60000) : 0;
                return (
                  <div key={log.id} className="flex items-start gap-3 p-3.5 bg-surface/50 rounded-lg hover:bg-surface/70 transition-colors group">
                    <div className="w-2.5 h-2.5 rounded-full mt-2" style={{ backgroundColor: opInfo.color }}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-on-surface-variant mr-2">#{log.id}</span>
                          <p className="font-medium text-on-surface">{machine.name}</p>
                          <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded ml-2">{machine.tonnage}T</span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-surface/50 rounded-lg text-on-surface-variant">{duration} min</span>
                      </div>
                      <p className="text-sm text-on-surface-variant">{mold.code} - {mold.product_name}</p>
                      <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-2">
                        <User size={10} />
                        {operator}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {startTime.toLocaleString()} - {endTime ? endTime.toLocaleString() : 'Now'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-on-surface">{log.quantity_produced || 0} units</p>
                      {log.quantity_rejected > 0 && (
                        <p className="text-xs text-error">{log.quantity_rejected} rejected</p>
                      )}
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 mt-2 transition-opacity">
                        <button
                          onClick={() => { setEditingItem(log); setModalOpen(true); }}
                          className="p-1 rounded hover:bg-primary/20 text-on-surface-variant hover:text-primary"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ open: true, item: log })}
                          className="p-1 rounded hover:bg-error/20 text-error"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 bg-surface/50 rounded-full flex items-center justify-center">
                <FileText size={32} className="text-on-surface-variant" />
              </div>
              <p className="text-on-surface-variant">No completed operations</p>
            </div>
          )}
        </div>
      </div>

      {work.length === 0 && (
        <div className="glass-card text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Package size={40} className="text-on-surface-variant" />
          </div>
          <p className="text-on-surface-variant text-lg">No work entries found</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary mt-4">
            Add First Work Entry
          </button>
        </div>
      )}

      <CrudModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        title={editingItem ? 'Edit Work Entry' : 'Add Work Entry'}
        item={editingItem}
        onSubmit={editingItem ? handleUpdate : handleCreate}
        fields={preparedFields}
        loading={loading}
        size="lg"
        customComponents={{
          _compatibility: CompatibilitySection
        }}
      />

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Work Entry"
        message="Are you sure you want to delete this work entry? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        loading={loading}
      />
    </div>
  );
}