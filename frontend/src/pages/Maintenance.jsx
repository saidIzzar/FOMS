import { useState, useEffect } from 'react';
import { maintenanceAPI, machinesAPI } from '../services/api';
import { useCrud } from '../hooks/useCrud';
import { useNotifications } from '../context/NotificationContext';
import { Plus, Wrench, Calendar, Clock, CheckCircle, XCircle, Edit2, Trash2, Download, FileSpreadsheet } from 'lucide-react';
import CrudModal from '../components/CrudModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { exportToCSV, exportToPDF } from '../utils/export';

const STATUS_CONFIG = {
  scheduled: { color: '#facc15', bg: '#facc1520', label: 'Scheduled', icon: Calendar },
  in_progress: { color: '#38bdf8', bg: '#38bdf820', label: 'In Progress', icon: Clock },
  completed: { color: '#22c55e', bg: '#22c55e20', label: 'Completed', icon: CheckCircle },
  cancelled: { color: '#64748b', bg: '#64748b20', label: 'Cancelled', icon: XCircle }
};

const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, config]) => ({ value, label: config.label }));

const TYPE_OPTIONS = [
  { value: 'preventive', label: 'Preventive' },
  { value: 'corrective', label: 'Corrective' },
  { value: 'predictive', label: 'Predictive' },
  { value: 'inspection', label: 'Inspection' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const maintenanceFields = [
  { name: 'machine_id', label: 'Machine', type: 'select', required: true, options: [] },
  { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe the maintenance work...' },
  { name: 'type', label: 'Type', type: 'select', options: TYPE_OPTIONS, required: true },
  { name: 'priority', label: 'Priority', type: 'select', options: PRIORITY_OPTIONS, required: true },
  { name: 'scheduled_date', label: 'Scheduled Date', type: 'date', required: true, defaultValue: new Date().toISOString().split('T')[0] },
  { name: 'assigned_to', label: 'Assigned To (JSON array)', type: 'text', placeholder: 'e.g., [7]' },
  { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes...' },
];

export default function Maintenance() {
  const { success, error } = useNotifications();
  const { data: maintenance, loading, fetchAll, create, update, remove } = useCrud(maintenanceAPI);
  const [machines, setMachines] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });

  useEffect(() => {
    fetchAll();
    loadMachines();
  }, [fetchAll]);

  const loadMachines = async () => {
    try {
      const res = await machinesAPI.getAll();
      setMachines(res.data);
    } catch (err) {
      console.error('Error loading machines:', err);
    }
  };

  const getMachineName = (id) => {
    const m = machines.find(m => m.id === id);
    return m ? `${m.machine_code} - ${m.spec?.tonnage || 'N/A'}T` : `Machine #${id}`;
  };

  const getStatusStats = () => ({
    total: maintenance.length,
    scheduled: maintenance.filter(l => l.status === 'scheduled').length,
    inProgress: maintenance.filter(l => l.status === 'in_progress').length,
    completed: maintenance.filter(l => l.status === 'completed').length
  });

  const stats = getStatusStats();

  const handleCreate = async (formData) => {
    try {
      await create({
        ...formData,
        machine_id: parseInt(formData.machine_id),
        assigned_to: formData.assigned_to ? JSON.parse(formData.assigned_to) : [],
        start_time: null,
        end_time: null,
        cost: 0
      });
      success('Maintenance scheduled successfully');
      setModalOpen(false);
    } catch (err) {
      error('Failed to create maintenance');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await update(editingItem.id, {
        ...formData,
        machine_id: parseInt(formData.machine_id),
        assigned_to: formData.assigned_to ? JSON.parse(formData.assigned_to) : []
      });
      success('Maintenance updated successfully');
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      error('Failed to update maintenance');
    }
  };

  const handleDelete = async () => {
    try {
      await remove(deleteDialog.item.id);
      success('Maintenance deleted successfully');
      setDeleteDialog({ open: false, item: null });
    } catch (err) {
      error('Failed to delete maintenance');
    }
  };

  const preparedFields = maintenanceFields.map(f => {
    if (f.name === 'machine_id') {
      return { ...f, options: machines.map(m => ({ value: m.id, label: `${m.machine_code} - ${m.spec?.tonnage || 'N/A'}T` })) };
    }
    return f;
  });

  if (loading && maintenance.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="glass-card p-4">
              <div className="skeleton h-8 w-16 mb-2 rounded"></div>
              <div className="skeleton h-4 w-24 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gradient">Maintenance</h1>
          <p className="text-on-surface-variant mt-1">Maintenance scheduling and tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => exportToCSV(data, 'maintenance', ['Machine', 'Type', 'Scheduled Date', 'Status', 'Technician', 'Cost'])}
            className="btn-secondary flex items-center gap-2"
          >
            <FileSpreadsheet size={16} />
            CSV
          </button>
          <button 
            onClick={() => exportToPDF(data, 'maintenance', 'Maintenance Report', [
              { key: 'machine_id', label: 'Machine' },
              { key: 'maintenance_type', label: 'Type' },
              { key: 'scheduled_date', label: 'Scheduled Date' },
              { key: 'status', label: 'Status' },
              { key: 'technician', label: 'Technician' }
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
            Schedule Maintenance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 mb-2">
            <Wrench size={18} className="text-primary" />
            <span className="text-sm text-on-surface-variant">Total</span>
          </div>
          <p className="text-3xl font-bold text-on-surface">{stats.total}</p>
        </div>
        <div className="glass-card hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={18} style={{ color: STATUS_CONFIG.scheduled.color }} />
            <span className="text-sm text-on-surface-variant">Scheduled</span>
          </div>
          <p className="text-3xl font-bold text-on-surface">{stats.scheduled}</p>
        </div>
        <div className="glass-card hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={18} style={{ color: STATUS_CONFIG.in_progress.color }} />
            <span className="text-sm text-on-surface-variant">In Progress</span>
          </div>
          <p className="text-3xl font-bold text-on-surface">{stats.inProgress}</p>
        </div>
        <div className="glass-card hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle size={18} style={{ color: STATUS_CONFIG.completed.color }} />
            <span className="text-sm text-on-surface-variant">Completed</span>
          </div>
          <p className="text-3xl font-bold text-on-surface">{stats.completed}</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
          <Wrench size={20} className="text-primary" />
          Maintenance Schedule
        </h3>
        {maintenance.length > 0 ? (
          <div className="space-y-3">
            {maintenance.map(log => {
              const statusConfig = STATUS_CONFIG[log.status] || STATUS_CONFIG.scheduled;
              const StatusIcon = statusConfig.icon;
              return (
                <div key={log.id} className="p-5 bg-surface/50 rounded-xl flex justify-between items-center hover:bg-surface/70 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl" style={{ backgroundColor: statusConfig.bg }}>
                      <StatusIcon size={20} style={{ color: statusConfig.color }} />
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">{getMachineName(log.machine_id)}</p>
                      <p className="text-sm text-on-surface-variant mt-1">{log.description}</p>
                      {log.type && (
                        <span className="text-xs text-on-surface-variant mt-1 inline-block px-2 py-0.5 bg-surface rounded">
                          {log.type} • {log.priority} priority
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="px-3 py-1.5 rounded-full text-xs font-medium" 
                        style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
                        {statusConfig.label}
                      </span>
                      <p className="text-sm text-on-surface-variant mt-2">
                        {log.scheduled_date}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                      <button
                        onClick={() => { setEditingItem(log); setModalOpen(true); }}
                        className="p-2 rounded-lg hover:bg-primary/20 text-on-surface-variant hover:text-primary"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteDialog({ open: true, item: log })}
                        className="p-2 rounded-lg hover:bg-error/20 text-on-surface-variant hover:text-error"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Wrench size={40} className="text-on-surface-variant" />
            </div>
            <p className="text-on-surface-variant text-lg">No maintenance scheduled</p>
            <button onClick={() => setModalOpen(true)} className="btn-primary mt-4">
              Schedule First Maintenance
            </button>
          </div>
        )}
      </div>

      <CrudModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        title={editingItem ? 'Edit Maintenance' : 'Schedule Maintenance'}
        item={editingItem}
        onSubmit={editingItem ? handleUpdate : handleCreate}
        fields={preparedFields}
        loading={loading}
        size="lg"
      />

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Maintenance"
        message="Are you sure you want to delete this maintenance schedule? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        loading={loading}
      />
    </div>
  );
}