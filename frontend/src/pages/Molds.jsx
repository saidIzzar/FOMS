import { useState, useEffect } from 'react';
import { moldsAPI, rayounsAPI } from '../services/api';
import { useCrud } from '../hooks/useCrud';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Search, Box, Layers, MapPin, Gauge, TrendingUp, Edit2, Trash2, Download, FileSpreadsheet, Archive } from 'lucide-react';
import CrudModal from '../components/CrudModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { exportToCSV, exportToPDF } from '../utils/export';

const STATUS_COLORS = {
  active: '#22c55e',
  in_storage: '#facc15',
  in_maintenance: '#38bdf8',
  retired: '#64748b'
};

export default function Molds() {
  const { data: molds, loading, fetchAll, create, update, remove } = useCrud(moldsAPI);
  const { success, error } = useNotifications();
  const { t } = useLanguage();
  const [machines, setMachines] = useState([]);
  const [rayouns, setRayouns] = useState([]);
  const [rayounTree, setRayounTree] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRayounId, setSelectedRayounId] = useState(null);
  const [selectedBoxId, setSelectedBoxId] = useState(null);

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
      if (flatRes.data) {
        setRayouns(flatRes.data);
      }
      if (treeRes.data) {
        setRayounTree(treeRes.data);
      }
    } catch (err) {
      console.error('Error fetching rayouns:', err);
    }
  };

  const getRayounOptions = () => {
    return rayouns.map(r => ({ value: r.id, label: `Rayoun ${r.name}` }));
  };

  const getBoxOptions = (rayounId) => {
    const rayoun = rayounTree.find(r => r.id === parseInt(rayounId));
    if (!rayoun || !rayoun.boxes) return [];
    return rayoun.boxes.map(b => ({
      value: b.id,
      label: b.box_number || b.name
    }));
  };

  const handleRayounChange = (rayounId) => {
    setSelectedRayounId(rayounId);
    setSelectedBoxId(null);
  };

  const moldFields = [
    { name: 'mold_code', label: t('common.code'), type: 'text', required: true, placeholder: 'e.g., MOLD-A12' },
    { name: 'steel_type', label: t('molds.steelType') || 'Steel Type', type: 'text', placeholder: 'e.g., P20, H13' },
    { name: 'length_mm', label: 'Length (mm)', type: 'number', required: true, defaultValue: 300 },
    { name: 'width_mm', label: 'Width (mm)', type: 'number', required: true, defaultValue: 250 },
    { name: 'height_mm', label: 'Height (mm)', type: 'number', required: true, defaultValue: 150 },
    { name: 'weight_kg', label: 'Weight (kg)', type: 'number', required: true, defaultValue: 120 },
    { name: 'required_tonnage', label: t('common.tonnage'), type: 'number', required: true, defaultValue: 90 },
    { name: 'required_shot_volume', label: 'Shot Volume (cm³)', type: 'number', required: true, defaultValue: 80 },
    { name: 'cavities', label: t('common.cavities'), type: 'number', min: 1, max: 32, defaultValue: 1 },
    { name: 'status', label: t('common.status'), type: 'select', options: [
      { value: 'active', label: t('status.active') },
      { value: 'in_storage', label: t('status.in_storage') },
      { value: 'in_maintenance', label: t('status.in_maintenance') },
      { value: 'retired', label: t('status.retired') }
    ], required: true },
    {
      name: 'rayoun_id',
      label: t('nav.rayoun') || 'Rayoun',
      type: 'select',
      options: getRayounOptions(),
      required: false,
      onChange: handleRayounChange
    },
    {
      name: 'box_id',
      label: t('molds.box') || 'Box',
      type: 'select',
      options: selectedRayounId ? getBoxOptions(selectedRayounId) : [],
      required: false,
      disabled: !selectedRayounId
    },
  ];

  const filteredMolds = molds.filter(mold => {
    const matchesSearch = (mold.mold_code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (mold.steel_type?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || mold.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusCount = (status) => molds.filter(m => m.status === status).length;

  const handleCreate = async (formData) => {
    try {
      const moldData = {
        mold_code: formData.mold_code,
        steel_type: formData.steel_type,
        length_mm: parseFloat(formData.length_mm),
        width_mm: parseFloat(formData.width_mm),
        height_mm: parseFloat(formData.height_mm),
        weight_kg: parseFloat(formData.weight_kg),
        required_tonnage: parseInt(formData.required_tonnage),
        required_shot_volume: parseFloat(formData.required_shot_volume),
        cavities: parseInt(formData.cavities) || 1,
        status: formData.status,
        rayoun_id: formData.rayoun_id || null,
        box_id: formData.box_id || null,
      };
      await create(moldData);
      success('Mold created successfully');
      setModalOpen(false);
      setSelectedRayounId(null);
      setSelectedBoxId(null);
    } catch (err) {
      error('Failed to create mold');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const moldData = {
        mold_code: formData.mold_code,
        steel_type: formData.steel_type,
        length_mm: parseFloat(formData.length_mm),
        width_mm: parseFloat(formData.width_mm),
        height_mm: parseFloat(formData.height_mm),
        weight_kg: parseFloat(formData.weight_kg),
        required_tonnage: parseInt(formData.required_tonnage),
        required_shot_volume: parseFloat(formData.required_shot_volume),
        cavities: parseInt(formData.cavities) || 1,
        status: formData.status,
        rayoun_id: formData.rayoun_id || null,
        box_id: formData.box_id || null,
      };
      await update(editingItem.id, moldData);
      success('Mold updated successfully');
      setModalOpen(false);
      setEditingItem(null);
      setSelectedRayounId(null);
      setSelectedBoxId(null);
    } catch (err) {
      error('Failed to update mold');
    }
  };

  const handleDelete = async () => {
    try {
      await remove(deleteDialog.item.id);
      success('Mold deleted successfully');
      setDeleteDialog({ open: false, item: null });
    } catch (err) {
      error('Failed to delete mold');
    }
  };

  if (loading && molds.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
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
          <h1 className="text-3xl font-bold text-gradient">Molds</h1>
          <p className="text-on-surface-variant mt-1">Mold library and inventory management</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(molds, 'molds', ['Code', 'Product Name', 'Material', 'Cavities', 'Tonnage', 'Status', 'Location'])}
            className="btn-secondary flex items-center gap-2"
          >
            <FileSpreadsheet size={16} />
            CSV
          </button>
          <button
            onClick={() => exportToPDF(molds, 'molds', 'Molds Report', [
              { key: 'code', label: 'Code' },
              { key: 'product_name', label: 'Product Name' },
              { key: 'material', label: 'Material' },
              { key: 'cavities', label: 'Cavities' },
              { key: 'status', label: 'Status' }
            ])}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={16} />
            PDF
          </button>
          <button
            onClick={() => { setEditingItem(null); setModalOpen(true); setSelectedRayounId(null); setSelectedBoxId(null); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Mold
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`glass-card text-left transition-all hover:scale-[1.02] ${statusFilter === 'all' ? 'border-primary/50 ring-1 ring-primary/30' : ''}`}
        >
          <p className="text-2xl font-bold text-on-surface">{molds.length}</p>
          <p className="text-sm text-on-surface-variant">Total</p>
        </button>
        {Object.keys(STATUS_COLORS).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`glass-card text-left transition-all hover:scale-[1.02] ${statusFilter === status ? 'border-primary/50 ring-1 ring-primary/30' : ''}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }}></div>
              <p className="text-2xl font-bold text-on-surface">{getStatusCount(status)}</p>
            </div>
            <p className="text-sm text-on-surface-variant">{status}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <label className="text-sm text-on-surface-variant font-medium">
          <Search size={16} className="inline mr-2" />
          Search:
        </label>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input
            type="text"
            placeholder="Search molds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full ps-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMolds.map((mold, idx) => (
          <div
            key={mold.id}
            className="glass-card p-4 group"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-secondary/20 to-green-600/20 rounded-xl">
                <Box className="text-secondary" size={24} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { 
                    setEditingItem(mold); 
                    setModalOpen(true); 
                    setSelectedRayounId(mold.rayoun_id);
                    setSelectedBoxId(mold.box_id);
                  }}
                  className="p-1.5 bg-surface/50 rounded-lg hover:bg-primary/20 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setDeleteDialog({ open: true, item: mold })}
                  className="p-1.5 bg-surface/50 rounded-lg hover:bg-error/20 text-on-surface-variant hover:text-error transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-medium mb-2 inline-block"
              style={{ backgroundColor: STATUS_COLORS[mold.status] + '20', color: STATUS_COLORS[mold.status] }}>
              {mold.status}
            </span>

            <h3 className="text-lg font-semibold text-on-surface mb-1">{mold.mold_code}</h3>
            <p className="text-sm text-on-surface-variant mb-4">{mold.steel_type || 'No Data'}</p>

            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div className="bg-surface/50 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 text-on-surface-variant mb-1">
                  <Layers size={12} />
                  <span className="text-xs">Cavities</span>
                </div>
                <p className="text-on-surface font-semibold">{mold.cavities || 1}</p>
              </div>
              <div className="bg-surface/50 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 text-on-surface-variant mb-1">
                  <Box size={12} />
                  <span className="text-xs">Steel Type</span>
                </div>
                <p className="text-on-surface font-semibold">{mold.steel_type || '-'}</p>
              </div>
              <div className="bg-surface/50 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 text-on-surface-variant mb-1">
                  <Gauge size={12} />
                  <span className="text-xs">Tonnage</span>
                </div>
                <p className="text-on-surface font-semibold">{mold.required_tonnage}T</p>
              </div>
              <div className="bg-surface/50 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 text-on-surface-variant mb-1">
                  <TrendingUp size={12} />
                  <span className="text-xs">Cycles</span>
                </div>
                <p className="text-on-surface font-semibold">{mold.total_cycles?.toLocaleString() || 0}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant flex items-center gap-1">
                  <MapPin size={12} />
                  {mold.location || 'No Location'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMolds.length === 0 && (
        <div className="glass-card text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center">
            <Box size={40} className="text-on-surface-variant" />
          </div>
          <p className="text-on-surface-variant text-lg">No molds found</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary mt-4">
            Add Mold
          </button>
        </div>
      )}

      <CrudModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        title={editingItem ? 'Edit Mold' : 'Add Mold'}
        item={editingItem}
        onSubmit={editingItem ? handleUpdate : handleCreate}
        fields={moldFields}
        loading={loading}
        size="lg"
      />

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete"
        message={`Are you sure you want to delete "${deleteDialog.item?.code}"?`}
        confirmText="Delete"
        type="danger"
        loading={loading}
      />
    </div>
  );
}