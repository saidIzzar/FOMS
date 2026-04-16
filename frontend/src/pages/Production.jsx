import { useState, useEffect, useMemo } from 'react';
import { productionAPI, machinesAPI, moldsAPI, operatorsAPI } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { Plus, Package, Play, Square, Clock, User, Calendar, Download, FileSpreadsheet, RefreshCw, CheckCircle, Wrench, Timer, Loader } from 'lucide-react';
import CrudModal from '../components/CrudModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { SearchableMoldSelect } from '../components/SearchableMoldSelect';
import { exportToCSV } from '../utils/export';
import { theme } from '../styles/theme';

const STATUS_COLORS = {
  created: '#94a3b8',
  mold_mounted: '#f59e0b',
  running: '#22c55e',
  paused: '#f97316',
  mold_changed: '#38bdf8',
  finished: '#64748b',
  idle: '#facc15',
  in_progress: '#38bdf8',
  completed: '#64748b',
  maintenance: '#a855f7'
};

const STATUS_LABELS = {
  created: 'Created',
  mold_mounted: 'Mounted',
  running: 'Running',
  paused: 'Paused',
  mold_changed: 'Changed',
  finished: 'Finished',
  idle: 'Idle',
  in_progress: 'In Progress',
  completed: 'Completed',
  maintenance: 'Maintenance'
};

const GLASS_CARD_STYLE = {
  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '14px',
  padding: '1.25rem'
};

const DEFAULT_MACHINE = { machine_code: 'Unknown', spec: { tonnage: 0 } };
const DEFAULT_MOLD = { mold_code: 'Unknown', steel_type: '' };
const DEFAULT_OPERATOR = { name: 'Unassigned' };

const formatTime = (ts) => {
  if (!ts) return '-';
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
};

const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '-';
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins} min`;
};

export default function Production() {
  const { success, error } = useNotifications();
  const [work, setWork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState([]);
  const [molds, setMolds] = useState([]);
  const [operators, setOperators] = useState([]);
  const [errorState, setErrorState] = useState(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [changeMoldDialog, setChangeMoldDialog] = useState({ open: false, runId: null });
  const [selectedNewMold, setSelectedNewMold] = useState('');
  const [finishDialog, setFinishDialog] = useState({ open: false, runId: null });
  const [finishTime, setFinishTime] = useState('');
  const [finishQuantity, setFinishQuantity] = useState(0);
  const [finishMaterial, setFinishMaterial] = useState('');
  const [moldModalOpen, setMoldModalOpen] = useState(false);
  const [selectedMoldCode, setSelectedMoldCode] = useState('');
  const [saving, setSaving] = useState(false);

  // Safe data lookups with defaults
  const machineMap = useMemo(() => {
    const map = {};
    (machines || []).forEach(m => { map[m.id] = m; });
    return map;
  }, [machines]);

  const moldMap = useMemo(() => {
    const map = {};
    (molds || []).forEach(m => { map[m.id] = m; });
    return map;
  }, [molds]);

  const operatorMap = useMemo(() => {
    const map = {};
    (operators || []).forEach(o => { map[o.id] = o; });
    return map;
  }, [operators]);

  const fetchAll = async () => {
    setLoading(true);
    setErrorState(null);
    try {
      const [workRes, machinesRes, moldsRes, operatorsRes] = await Promise.all([
        productionAPI.getAll(),
        machinesAPI.getAll(),
        moldsAPI.getAll(),
        operatorsAPI.getAll()
      ]);
      setWork(workRes?.data || []);
      setMachines(machinesRes?.data || []);
      setMolds(moldsRes?.data || []);
      setOperators(operatorsRes?.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setErrorState(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async (formData) => {
    try {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const submitData = {
        machine_id: parseInt(formData.machine_id),
        mold_id: parseInt(formData.mold_id),
        operator_id: formData.operator_id ? parseInt(formData.operator_id) : null,
        material_type: formData.material_type || null,
        start_time: now,
        target_quantity: formData.target_quantity ? parseInt(formData.target_quantity) : null,
        quantity_produced: 0,
        quantity_rejected: 0,
        status: 'running'
      };
      await productionAPI.create(submitData);
      success('Production started successfully');
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      error('Failed to start production');
    }
  };

  const handleDelete = async () => {
    try {
      await productionAPI.delete(deleteDialog?.item?.id);
      success('Production entry deleted');
      setDeleteDialog({ open: false, item: null });
      fetchAll();
    } catch (err) {
      error('Failed to delete');
    }
  };

  const handleMountMold = async (runId) => {
    try {
      await productionAPI.mountMold(runId);
      success('Mold mounted successfully');
      fetchAll();
    } catch (err) {
      error('Failed to mount mold');
    }
  };

  const handleChangeMold = async () => {
    if (!selectedNewMold) {
      error('Please select a mold');
      return;
    }
    try {
      await productionAPI.changeMold(changeMoldDialog.runId, parseInt(selectedNewMold));
      success('Mold changed successfully');
      setChangeMoldDialog({ open: false, runId: null });
      setSelectedNewMold('');
      fetchAll();
    } catch (err) {
      error('Failed to change mold');
    }
  };

  const handleFinish = async () => {
    try {
      const finishData = {
        finish_time: finishTime || new Date().toISOString().replace('T', ' ').substring(0, 19),
        quantity_produced: parseInt(finishQuantity) || 0,
        quantity_rejected: 0,
        material_type: finishMaterial || undefined
      };
      await productionAPI.finish(finishDialog.runId, finishData);
      success('Production completed');
      setFinishDialog({ open: false, runId: null });
      setFinishTime('');
      setFinishQuantity(0);
      setFinishMaterial('');
      fetchAll();
    } catch (err) {
      error('Failed to finish production');
    }
  };

  const activeProduction = work?.filter(w => ['running', 'mold_mounted', 'created', 'paused', 'mold_changed'].includes(w?.status)) || [];
  const completedProduction = work?.filter(w => w?.status === 'finished' || w?.status === 'completed').slice(0, 20) || [];

  const preparedFields = [
    { 
      name: 'machine_id', 
      label: 'Machine', 
      type: 'select', 
      required: true,
      options: (machines || []).map(m => ({ value: m.id, label: `${m.machine_code || 'Unknown'} (${m.spec?.tonnage || '?'}T)` })) 
    },
    { 
      name: 'mold_id', 
      label: 'Mold', 
      type: 'custom', 
      required: true 
    },
    { 
      name: 'operator_id', 
      label: 'Operator', 
      type: 'select',
      options: [{ value: '', label: 'Select Operator' }, ...(operators || []).map(o => ({ value: o.id, label: o.name || 'Unknown' }))] 
    },
    {
      name: 'material_type',
      label: 'Material',
      type: 'select',
      options: [
        { value: '', label: 'Select Material' },
        { value: 'PP', label: 'PP (Polypropylene)' },
        { value: 'ABS', label: 'ABS' },
        { value: 'PC', label: 'PC (Polycarbonate)' },
        { value: 'PE', label: 'PE (Polyethylene)' },
        { value: 'PA', label: 'PA (Nylon)' },
        { value: 'PVC', label: 'PVC' },
        { value: 'PS', label: 'PS (Polystyrene)' },
        { value: 'POM', label: 'POM (Acetal)' },
      ]
    },
    {
      name: 'target_quantity',
      label: 'Target Quantity',
      type: 'number',
      placeholder: 'Enter target quantity',
      min: 1
    },
  ];

  const customComponents = {
    mold_id: ({ value, onChange, formData }) => (
      <SearchableMoldSelect
        value={value}
        onChange={onChange}
        molds={molds}
        onAddNew={(code) => { setSelectedMoldCode(code); setMoldModalOpen(true); }}
        placeholder="Search mold..."
      />
    )
  };

  const handleCreateMold = async (moldData) => {
    try {
      const created = await moldsAPI.create(moldData);
      await fetchAll();
      setMoldModalOpen(false);
      setSelectedMoldCode('');
      setModalOpen(false);
    } catch (err) {
      console.error('Error creating mold:', err);
    }
  };

  const moldFields = [
    { name: 'mold_code', label: 'Mold Code', type: 'text', required: true, placeholder: 'M-001' },
    { name: 'steel_type', label: 'Steel Type', type: 'select', required: true, options: [
      { value: '', label: 'Select Steel' },
      { value: 'P20', label: 'P20' },
      { value: 'H13', label: 'H13' },
      { value: 'S136', label: 'S136' },
      { value: '718H', label: '718H' },
      { value: 'NAK80', label: 'NAK80' },
    ]},
    { name: 'length_mm', label: 'Length (mm)', type: 'number', required: true, placeholder: '300' },
    { name: 'width_mm', label: 'Width (mm)', type: 'number', required: true, placeholder: '250' },
    { name: 'height_mm', label: 'Height (mm)', type: 'number', required: true, placeholder: '150' },
    { name: 'weight_kg', label: 'Weight (kg)', type: 'number', required: true, placeholder: '120' },
    { name: 'required_tonnage', label: 'Required Tonnage', type: 'number', required: true, placeholder: '90' },
    { name: 'required_shot_volume', label: 'Shot Volume (g)', type: 'number', placeholder: '80' },
    { name: 'cavities', label: 'Cavities', type: 'number', placeholder: '4' },
  ];

  const ProductionCard = ({ item }) => {
    const machine = machineMap[item?.machine_id] || DEFAULT_MACHINE;
    const mold = moldMap[item?.mold_id] || DEFAULT_MOLD;
    const operator = operatorMap[item?.operator_id] || null;
    
    const isMounted = !!item?.mold_mount_time;
    const hasChanged = !!item?.mold_change_time;
    const isCompleted = item?.status === 'finished' || item?.status === 'completed';
    const isRunning = item?.status === 'running' || item?.status === 'mold_mounted';

    const totalProd = item?.total_production_minutes || 0;
    const netProd = item?.net_production_minutes || 0;
    
    const isCompatible = item?.is_mold_compatible;
    const moldTonnage = item?.mold_required_tonnage || mold?.required_tonnage;
    const machineTonnage = item?.machine_tonnage || machine?.spec?.tonnage;

    const getTimelineSteps = () => {
      const steps = [
        { key: 'created', label: 'Created', done: true },
        { key: 'mold_mounted', label: 'Mounted', done: isMounted },
        { key: 'running', label: 'Running', done: isRunning },
        { key: 'finished', label: 'Finished', done: isCompleted }
      ];
      return steps;
    };

    return (
      <div style={{
        background: theme.gradients?.card || 'rgba(30, 41, 59, 0.9)',
        borderRadius: theme.layout?.borderRadiusLg || '14px',
        border: `1px solid ${theme.colors?.border || 'rgba(255,255,255,0.05)'}`,
        padding: '1.25rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: theme.colors?.onSurface || '#f1f5f9' }}>
                {machine?.machine_code || `Machine #${item?.machine_id}`}
</h4>
              <span style={{ 
                fontSize: '0.75rem', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '0.25rem',
                background: (theme.colors?.primary || '#38bdf8') + '20',
                color: theme.colors?.primary || '#38bdf8' 
              }}>
                {machineTonnage || machine?.spec?.tonnage || '?'}T
              </span>
              {item?.material_type && (
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '0.25rem',
                  background: '#f59e0b' + '30',
                  color: '#f59e0b',
                  fontWeight: 600
                }}>
                  {item.material_type}
                </span>
              )}
              {isCompatible === false && (
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '0.25rem',
                  background: '#ef4444' + '30',
                  color: '#ef4444',
                  fontWeight: 600
                }}>
                  {moldTonnage}T vs {machineTonnage}T
                </span>
              )}
              {isCompatible === true && (
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '0.25rem',
                  background: '#22c55e' + '30',
                  color: '#22c55e',
                  fontWeight: 600
                }}>
                  [OK] Compatible
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.875rem', color: theme.colors?.onSurfaceVariant || '#94a3b8' }}>
              {mold?.mold_code || `Mold #${item?.mold_id}`} 
              {moldTonnage && <span style={{ fontSize: '0.75rem', color: theme.colors?.onSurfaceMuted }}> ({moldTonnage}T)</span>}
            </p>
            {operator && (
              <p style={{ fontSize: '0.8rem', color: theme.colors?.secondary || '#22c55e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <User size={12} /> {operator?.name}
              </p>
            )}
            {item?.date && (
              <p style={{ fontSize: '0.7rem', color: theme.colors?.onSurfaceMuted || '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={10} /> {item.date}
              </p>
            )}
          </div>
          <div style={{ 
            padding: '0.25rem 0.75rem', 
            borderRadius: '1rem',
            background: (STATUS_COLORS[item?.status] || '#64748b') + '20',
            color: STATUS_COLORS[item?.status] || '#64748b',
            fontSize: '0.8rem',
            fontWeight: 500
          }}>
            {STATUS_LABELS[item?.status] || item?.status || 'Unknown'}
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '0.25rem', 
          marginBottom: '1rem',
          padding: '0.5rem',
          background: 'rgba(30, 41, 59, 0.4)',
          borderRadius: '0.5rem',
          overflowX: 'auto'
        }}>
          {getTimelineSteps().map((step, idx) => (
            <div key={step.key} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              flex: 1,
              minWidth: 'fit-content'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: step.done ? (theme.colors?.secondary || '#22c55e') : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                color: step.done ? '#fff' : 'rgba(255,255,255,0.3)'
              }}>
                {step.done ? '✓' : idx + 1}
              </div>
              <span style={{ 
                fontSize: '0.65rem', 
                color: step.done ? (theme.colors?.onSurface || '#f1f5f9') : (theme.colors?.onSurfaceMuted || '#64748b')
              }}>
                {step.label}
              </span>
              {idx < getTimelineSteps().length - 1 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  background: step.done ? (theme.colors?.secondary || '#22c55e') : 'rgba(255,255,255,0.1)',
                  marginLeft: '0.25rem',
                  minWidth: '20px'
                }} />
              )}
            </div>
          ))}
        </div>

        <div style={{
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '0.75rem',
          fontSize: '0.8rem',
          color: theme.colors?.onSurfaceVariant || '#94a3b8',
          marginBottom: '1rem',
          padding: '0.75rem',
          background: 'rgba(30, 41, 59, 0.3)',
          borderRadius: theme.layout?.borderRadius || '10px'
        }}>
          <div>
            <span style={{ opacity: 0.7 }}>Started:</span>
            <div style={{ color: theme.colors?.onSurface || '#f1f5f9' }}>{formatTime(item?.start_time)}</div>
          </div>
          <div>
            <span style={{ opacity: 0.7 }}>Finished:</span>
            <div style={{ color: theme.colors?.onSurface || '#f1f5f9' }}>{formatTime(item?.finish_time) || '-'}</div>
          </div>
          <div>
            <span style={{ opacity: 0.7 }}>Mold Mount:</span>
            <div style={{ color: isMounted ? (theme.colors?.secondary || '#22c55e') : (theme.colors?.onSurfaceVariant || '#94a3b8') }}>
              {formatTime(item?.mold_mount_time) || 'Pending'}
            </div>
          </div>
          <div>
            <span style={{ opacity: 0.7 }}>Mold Change:</span>
            <div style={{ color: hasChanged ? (theme.colors?.warning || '#facc15') : (theme.colors?.onSurfaceVariant || '#94a3b8') }}>
              {formatTime(item?.mold_change_time) || '-'}
            </div>
          </div>
        </div>

        {(totalProd > 0 || (item?.total_change_minutes || 0) > 0) && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1rem'
          }}>
            {totalProd > 0 && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: (theme.colors?.primary || '#38bdf8') + '20',
                borderRadius: theme.layout?.borderRadius || '10px',
                fontSize: '0.8rem',
                color: theme.colors?.primary || '#38bdf8'
              }}>
                <Clock size={14} />
                <span>Total: <strong>{formatDuration(totalProd)}</strong></span>
              </div>
            )}
            {netProd > 0 && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: (theme.colors?.secondary || '#22c55e') + '20',
                borderRadius: theme.layout?.borderRadius || '10px',
                fontSize: '0.8rem',
                color: theme.colors?.secondary || '#22c55e'
              }}>
                <CheckCircle size={14} />
                <span>Net: <strong>{formatDuration(netProd)}</strong></span>
              </div>
            )}
            {(item?.total_change_minutes || 0) > 0 && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: (theme.colors?.tertiary || '#a855f7') + '20',
                borderRadius: theme.layout?.borderRadius || '10px',
                fontSize: '0.8rem',
                color: theme.colors?.tertiary || '#a855f7'
              }}>
                <Timer size={14} />
                <span>Change: <strong>{formatDuration(item?.total_change_minutes)}</strong></span>
              </div>
            )}
          </div>
        )}

        {!isCompleted && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {!isMounted && (
              <button
                onClick={() => handleMountMold(item?.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  background: (theme.colors?.secondary || '#22c55e') + '20',
                  border: 'none',
                  borderRadius: theme.layout?.borderRadius || '10px',
                  color: theme.colors?.secondary || '#22c55e',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                <Wrench size={14} /> Mount Mold
              </button>
            )}
            <button
              onClick={() => setChangeMoldDialog({ open: true, runId: item?.id })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.75rem',
                background: theme.colors?.warning + '20',
                border: 'none',
                borderRadius: theme.layout?.borderRadius,
                color: theme.colors?.warning,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} /> Change Mold
            </button>
            <button
              onClick={() => {
                setFinishDialog({ open: true, runId: item?.id });
                setFinishTime(new Date().toISOString().replace('T', ' ').substring(0, 19));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.75rem',
                background: theme.colors?.error + '20',
                border: 'none',
                borderRadius: theme.layout?.borderRadius,
                color: theme.colors?.error,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <Square size={14} /> Finish
            </button>
            <button
              onClick={() => setDeleteDialog({ open: true, item })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.75rem',
                background: 'transparent',
                border: `1px solid ${theme.colors?.error}40`,
                borderRadius: theme.layout?.borderRadius,
                color: theme.colors?.error,
                fontSize: '0.8rem',
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem' }}>
        <Loader size={32} style={{ color: theme.colors?.primary, animation: 'spin 1s linear infinite' }} />
        <p style={{ color: theme.colors?.onSurfaceVariant }}>Loading production data...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (errorState) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: theme.colors?.error }}>Error: {errorState}</p>
        <button 
          onClick={fetchAll}
          style={{
            padding: '0.5rem 1rem',
            background: theme.colors?.primary,
            border: 'none',
            borderRadius: theme.layout?.borderRadius,
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: theme.colors?.onSurface }}>Daily Work</h1>
          <p style={{ color: theme.colors?.onSurfaceVariant, marginTop: '0.25rem' }}>Production operations and time tracking</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => exportToCSV(work || [], 'production', ['Machine', 'Mold', 'Start', 'Finish', 'Duration', 'Status'])}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(30, 41, 59, 0.6)',
              border: `1px solid ${theme.colors?.borderLight}`,
              borderRadius: theme.layout?.borderRadius,
              color: theme.colors?.onSurface,
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={16} /> CSV
          </button>
          <button 
            onClick={() => { setEditingItem(null); setModalOpen(true); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: theme.colors?.primary,
              border: 'none',
              borderRadius: theme.layout?.borderRadius,
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <Plus size={18} /> Start Production
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ ...GLASS_CARD_STYLE, padding: '1rem', borderLeft: `4px solid ${theme.colors?.secondary}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: theme.colors?.secondary + '20', borderRadius: '0.75rem' }}>
              <Play size={20} style={{ color: theme.colors?.secondary }} />
            </div>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: theme.colors?.onSurface }}>{activeProduction.length}</p>
              <p style={{ fontSize: '0.875rem', color: theme.colors?.onSurfaceVariant }}>Active</p>
            </div>
          </div>
        </div>

        <div style={{ ...GLASS_CARD_STYLE, padding: '1rem', borderLeft: `4px solid ${theme.colors?.primary}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: theme.colors?.primary + '20', borderRadius: '0.75rem' }}>
              <CheckCircle size={20} style={{ color: theme.colors?.primary }} />
            </div>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: theme.colors?.onSurface }}>{completedProduction.length}</p>
              <p style={{ fontSize: '0.875rem', color: theme.colors?.onSurfaceVariant }}>Finished</p>
            </div>
          </div>
        </div>

        <div style={{ ...GLASS_CARD_STYLE, padding: '1rem', borderLeft: `4px solid ${theme.colors?.warning}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: theme.colors?.warning + '20', borderRadius: '0.75rem' }}>
              <Package size={20} style={{ color: theme.colors?.warning }} />
            </div>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: theme.colors?.onSurface }}>
                {work.reduce((acc, w) => acc + (w.quantity_produced || 0), 0).toLocaleString()}
              </p>
              <p style={{ fontSize: '0.875rem', color: theme.colors?.onSurfaceVariant }}>Output</p>
            </div>
          </div>
        </div>

        <div style={{ ...GLASS_CARD_STYLE, padding: '1rem', borderLeft: `4px solid ${machines.length > 0 ? theme.colors?.tertiary : '#64748b'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: (machines.length > 0 ? theme.colors?.tertiary : '#64748b') + '20', borderRadius: '0.75rem' }}>
              <Timer size={20} style={{ color: machines.length > 0 ? theme.colors?.tertiary : '#64748b' }} />
            </div>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: theme.colors?.onSurface }}>
                {formatDuration(work.reduce((acc, w) => acc + (w.total_change_minutes || 0), 0))}
              </p>
              <p style={{ fontSize: '0.875rem', color: theme.colors?.onSurfaceVariant }}>Change Time</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ ...GLASS_CARD_STYLE, padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Play size={20} style={{ color: theme.colors?.secondary }} />
            Active Operations
          </h3>
          {activeProduction.length > 0 ? (
            <div>
              {activeProduction.map(item => (
                <ProductionCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: theme.colors?.onSurfaceVariant }}>
              <Clock size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No active operations</p>
            </div>
          )}
        </div>

        <div style={{ ...GLASS_CARD_STYLE, padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} style={{ color: theme.colors?.primary }} />
            Recent History
          </h3>
          {completedProduction.length > 0 ? (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {completedProduction.map(item => {
                const machine = machineMap[item?.machine_id] || DEFAULT_MACHINE;
                const mold = moldMap[item?.mold_id] || DEFAULT_MOLD;
                return (
                  <div key={item.id} style={{ 
                    padding: '0.75rem', 
                    marginBottom: '0.5rem',
                    background: 'rgba(30, 41, 59, 0.3)', 
                    borderRadius: theme.layout?.borderRadius,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ fontWeight: 500, color: theme.colors?.onSurface }}>{machine.machine_code || `Machine #${item.machine_id}`}</p>
                      <p style={{ fontSize: '0.8rem', color: theme.colors?.onSurfaceVariant }}>{mold.mold_code || `Mold #${item.mold_id}`}</p>
                      <p style={{ fontSize: '0.75rem', color: theme.colors?.onSurfaceVariant }}>
                        {formatTime(item.start_time)} → {formatTime(item.finish_time)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 500, color: theme.colors?.onSurface }}>{item.quantity_produced || 0}</p>
                      {(item?.total_change_minutes || 0) > 0 && (
                        <p style={{ fontSize: '0.75rem', color: theme.colors?.tertiary }}>{formatDuration(item?.total_change_minutes)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: theme.colors?.onSurfaceVariant }}>
              <Calendar size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No completed operations</p>
            </div>
          )}
        </div>
      </div>

      <CrudModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Start Production"
        item={null}
        onSubmit={handleCreate}
        fields={preparedFields}
        customComponents={customComponents}
        loading={loading}
        size="md"
      />

      <CrudModal
        isOpen={moldModalOpen}
        onClose={() => { setMoldModalOpen(false); setSelectedMoldCode(''); }}
        title="Add New Mold"
        item={null}
        onSubmit={handleCreateMold}
        fields={moldFields}
        loading={saving}
        size="lg"
      />

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Production"
        message="Are you sure you want to delete this production entry?"
        confirmText="Delete"
        type="danger"
        loading={saving}
      />

      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: changeMoldDialog.open ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: theme.colors?.surface,
          borderRadius: theme.layout?.borderRadiusLg,
          padding: '1.5rem',
          width: '400px',
          maxWidth: '90%'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Change Mold</h3>
          <select
            value={selectedNewMold}
            onChange={(e) => setSelectedNewMold(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(30, 41, 59, 0.6)',
              border: `1px solid ${theme.colors?.borderLight}`,
              borderRadius: theme.layout?.borderRadius,
              color: theme.colors?.onSurface,
              marginBottom: '1rem'
            }}
          >
            <option value="">Select new mold</option>
            {molds.filter(m => m.is_active).map(m => (
              <option key={m.id} value={m.id}>{m.mold_code} ({m.steel_type})</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setChangeMoldDialog({ open: false, runId: null })}
              style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: theme.colors?.onSurfaceVariant, cursor: 'pointer' }}
            >Cancel</button>
            <button
              onClick={handleChangeMold}
              style={{ padding: '0.5rem 1rem', background: theme.colors?.warning, border: 'none', borderRadius: theme.layout?.borderRadius, color: '#fff', cursor: 'pointer' }}
            >Change</button>
          </div>
        </div>
      </div>

      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: finishDialog.open ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: theme.colors?.surface,
          borderRadius: theme.layout?.borderRadiusLg,
          padding: '1.5rem',
          width: '400px',
          maxWidth: '90%'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Finish Production</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: theme.colors?.onSurfaceVariant }}>Finish Time</label>
            <input
              type="text"
              value={finishTime}
              onChange={(e) => setFinishTime(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(30, 41, 59, 0.6)',
                border: `1px solid ${theme.colors?.borderLight}`,
                borderRadius: theme.layout?.borderRadius,
                color: theme.colors?.onSurface
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: theme.colors?.onSurfaceVariant }}>Quantity Produced</label>
            <input
              type="number"
              value={finishQuantity}
              onChange={(e) => setFinishQuantity(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(30, 41, 59, 0.6)',
                border: `1px solid ${theme.colors?.borderLight}`,
                borderRadius: theme.layout?.borderRadius,
                color: theme.colors?.onSurface
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setFinishDialog({ open: false, runId: null })}
              style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: theme.colors?.onSurfaceVariant, cursor: 'pointer' }}
            >Cancel</button>
            <button
              onClick={handleFinish}
              style={{ padding: '0.5rem 1rem', background: theme.colors?.error, border: 'none', borderRadius: theme.layout?.borderRadius, color: '#fff', cursor: 'pointer' }}
            >Finish</button>
          </div>
        </div>
      </div>
    </div>
  );
}