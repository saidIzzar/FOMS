import { useState, useEffect } from 'react';
import { moldsAPI, rayounsAPI } from '../services/api';
import { useCrud } from '../hooks/useCrud';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Search, Box as BoxIcon, MapPin, Edit2, Trash2, FileSpreadsheet } from 'lucide-react';
import CrudModal from '../components/CrudModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { exportToCSV } from '../utils/export';

const STATUS_COLORS = {
  active: '#22c55e',
  in_storage: '#facc15',
  in_maintenance: '#38bdf8',
  retired: '#64748b'
};

const MATERIAL_OPTIONS = [
  { value: 'ABS', label: 'ABS' },
  { value: 'PP', label: 'PP' },
  { value: 'PC', label: 'PC' },
  { value: 'PE', label: 'PE' },
  { value: 'PVC', label: 'PVC' },
  { value: 'PS', label: 'PS' },
  { value: 'POM', label: 'POM' },
  { value: 'PA', label: 'PA (Nylon)' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'in_storage', label: 'In Storage' },
  { value: 'in_maintenance', label: 'In Maintenance' },
  { value: 'retired', label: 'Retired' }
];

const OLD_MOLD_FIELDS = [
  { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'e.g., MOLD-A12' },
  { name: 'product_name', label: 'Product Name', type: 'text', required: true },
  { name: 'material', label: 'Material', type: 'select', options: MATERIAL_OPTIONS, required: true },
  { name: 'cavities', label: 'Cavities', type: 'number', min: 1, max: 32, defaultValue: 1 },
  { name: 'machine_tonnage_min', label: 'Min Tonnage (T)', type: 'number', min: 50, max: 1000, defaultValue: 150 },
  { name: 'machine_tonnage_max', label: 'Max Tonnage (T)', type: 'number', min: 50, max: 1000, defaultValue: 350 },
  { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
];

export default function Molds() {
  const { data: molds, loading, fetchAll, create, update, remove } = useCrud(moldsAPI);
  const { success, error } = useNotifications();
  const { t } = useLanguage();
  const [rayouns, setRayouns] = useState([]);
  const [rayounTree, setRayounTree] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRayounId, setSelectedRayounId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });

  useEffect(() => {
    fetchAll();
    fetchRayouns();
  }, [fetchAll]);

  const fetchRayouns = async () => {
    try {
      const [flatRes, treeRes] = await Promise.all([
        rayounsAPI.getAll(),
        rayounsAPI.getTree()
      ]);
      if (flatRes?.data) setRayouns(flatRes.data);
      if (treeRes?.data) setRayounTree(treeRes.data);
    } catch (err) {
      console.error('Error fetching rayouns:', err);
    }
  };

  const getRayounOptions = () => rayouns.map(r => ({ value: r.id, label: `Rayoun ${r.name}` }));

  const getBoxOptions = (rayounId) => {
    const rayoun = rayounTree.find(r => r.id === parseInt(rayounId));
    if (!rayoun?.boxes) return [];
    return rayoun.boxes.map(b => ({ value: b.id, label: b.box_number }));
  };

  const createFields = [
    { name: 'mold_code', label: 'Code', type: 'text', required: true, placeholder: 'e.g., MOLD-A12' },
    { name: 'steel_type', label: 'Steel Type', type: 'text', placeholder: 'e.g., P20, H13' },
    { name: 'length_mm', label: 'Length (mm)', type: 'number', required: true, defaultValue: 300 },
    { name: 'width_mm', label: 'Width (mm)', type: 'number', required: true, defaultValue: 250 },
    { name: 'height_mm', label: 'Height (mm)', type: 'number', required: true, defaultValue: 150 },
    { name: 'weight_kg', label: 'Weight (kg)', type: 'number', required: true, defaultValue: 120 },
    { name: 'required_tonnage', label: 'Tonnage (T)', type: 'number', required: true, defaultValue: 90 },
    { name: 'required_shot_volume', label: 'Shot Volume (cm³)', type: 'number', required: true, defaultValue: 80 },
    { name: 'cavities', label: 'Cavities', type: 'number', min: 1, max: 32, defaultValue: 1 },
    { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
    { name: 'rayoun_id', label: 'Rayoun', type: 'select', options: getRayounOptions(), required: false },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'Optional location' },
  ];

  const usedFields = editingItem ? createFields : createFields;

  const handleCreate = async (formData) => {
    try {
      await create(formData);
      success('Mold created');
      setModalOpen(false);
    } catch (err) {
      error('Failed to create');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await update(editingItem.id, formData);
      success('Mold updated');
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      error('Failed to update');
    }
  };

  const handleDelete = async () => {
    try {
      await remove(deleteDialog.item.id);
      success('Mold deleted');
      setDeleteDialog({ open: false, item: null });
    } catch (err) {
      error('Failed to delete');
    }
  };

  const filteredMolds = (molds || []).filter(m => {
    if (!m) return false;
    const search = (m.mold_code || m.code || m.steel_type || '').toLowerCase();
    return search.includes(searchTerm.toLowerCase()) && (statusFilter === 'all' || m.status === statusFilter);
  });

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Molds</h1>
          <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Mold management and tracking</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => exportToCSV(molds, 'molds', ['Code', 'Status'])} style={{ padding: '0.5rem 1rem', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', color: '#f1f5f9', cursor: 'pointer' }}>
            <FileSpreadsheet size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />CSV
          </button>
          <button onClick={() => setModalOpen(true)} style={{ padding: '0.5rem 1rem', background: '#38bdf8', border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>
            <Plus size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Add Mold
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search molds..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '0.75rem 1rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', color: '#f1f5f9' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.75rem 1rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', color: '#f1f5f9' }}
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {filteredMolds.map(mold => (
          <div key={mold.id} style={{ background: 'linear-gradient(145deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontWeight: 600, color: '#f1f5f9' }}>{mold.mold_code || mold.code}</h3>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{mold.steel_type || mold.material}</p>
              </div>
              <span style={{ padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', background: (STATUS_COLORS[mold.status] || '#64748b') + '20', color: STATUS_COLORS[mold.status] || '#64748b' }}>
                {mold.status}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
              <span>Cavities: {mold.cavities || 1}</span>
              <span>Tonnage: {mold.required_tonnage || mold.machine_tonnage_min || '?'}T</span>
              {mold.box_code && <span>Box: {mold.box_code}</span>}
              {mold.rayoun_name && <span>Rayoun: {mold.rayoun_name}</span>}
              {mold.location && <span style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={12} />{mold.location}</span>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => { setEditingItem(mold); setModalOpen(true); }} style={{ flex: 1, padding: '0.5rem', background: 'rgba(56,189,248,0.2)', color: '#38bdf8', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <Edit2 size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />Edit
              </button>
              <button onClick={() => setDeleteDialog({ open: true, item: mold })} style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMolds.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <BoxIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No molds found</p>
        </div>
      )}

      <CrudModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        title={editingItem ? 'Edit Mold' : 'Add Mold'}
        item={editingItem}
        onSubmit={editingItem ? handleUpdate : handleCreate}
        fields={usedFields}
        loading={loading}
        size="lg"
      />

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Mold"
        message={`Delete ${deleteDialog.item?.mold_code}?`}
        confirmText="Delete"
        type="danger"
        loading={loading}
      />
    </div>
  );
}