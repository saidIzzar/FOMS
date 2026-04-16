import { useState, useEffect } from 'react';
import { theme, getStatusStyle } from '../../../styles/theme';
import { moldsAPI } from '../../../services/api';
import { Modal, Button, Input, Select, Badge, LoadingSpinner, EmptyState } from '../../ui';
import { Plus, Search, Edit, Trash2, Box } from 'lucide-react';

const initialForm = {
  code: '',
  product_name: '',
  material: '',
  dimensions: '',
  cavities: '',
  weight_kg: '',
  status: 'active',
  location_id: '',
  machine_tonnage_min: '',
  machine_tonnage_max: '',
  notes: '',
};

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'in_storage', label: 'In Storage' },
  { value: 'in_maintenance', label: 'In Maintenance' },
  { value: 'retired', label: 'Retired' },
];

export default function MoldList() {
  const [molds, setMolds] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  useEffect(() => {
    fetchMolds();
    fetchLocations();
  }, []);

  const fetchMolds = async () => {
    try {
      const res = await moldsAPI.getAll();
      setMolds(res.data);
    } catch (err) {
      console.error('Failed to fetch molds:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await moldsAPI.getLocations?.() || { data: [] };
      setLocations(res.data || []);
    } catch (err) {
      setLocations([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await moldsAPI.update(editId, formData);
      } else {
        await moldsAPI.create(formData);
      }
      setModalOpen(false);
      setFormData(initialForm);
      setEditId(null);
      fetchMolds();
    } catch (err) {
      console.error('Failed to save mold:', err);
    }
  };

  const handleEdit = (mold) => {
    setEditId(mold.id);
    setFormData({
      code: mold.code || '',
      product_name: mold.product_name || '',
      material: mold.material || '',
      dimensions: mold.dimensions || '',
      cavities: mold.cavities || '',
      weight_kg: mold.weight_kg || '',
      status: mold.status || 'active',
      location_id: mold.location_id || '',
      machine_tonnage_min: mold.machine_tonnage_min || '',
      machine_tonnage_max: mold.machine_tonnage_max || '',
      notes: mold.notes || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await moldsAPI.delete(deleteModal.id);
      setDeleteModal({ open: false, id: null });
      fetchMolds();
    } catch (err) {
      console.error('Failed to delete mold:', err);
    }
  };

  const filteredMolds = molds.filter((m) => {
    const matchesSearch =
      m.code?.toLowerCase().includes(search.toLowerCase()) ||
      m.product_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.colors.onSurface }}>Molds</h1>
        <Button icon={Plus} onClick={() => { setEditId(null); setFormData(initialForm); setModalOpen(true); }}>
          Add Mold
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.colors.onSurfaceVariant }} />
          <input
            type="text"
            placeholder="Search molds..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(30, 41, 59, 0.6)',
              border: `1px solid ${theme.colors.borderLight}`,
              borderRadius: theme.layout.borderRadius,
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              color: theme.colors.onSurface,
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: `1px solid ${theme.colors.borderLight}`,
            borderRadius: theme.layout.borderRadius,
            padding: '0.75rem 2.5rem 0.75rem 1rem',
            color: theme.colors.onSurface,
            fontSize: '0.875rem',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '1rem',
          }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="in_storage">In Storage</option>
          <option value="in_maintenance">In Maintenance</option>
        </select>
      </div>

      {filteredMolds.length === 0 ? (
        <EmptyState icon={Box} title="No molds found" description="Add your first mold to get started." action={
          <Button icon={Plus} onClick={() => setModalOpen(true)}>Add Mold</Button>
        } />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
          {filteredMolds.map((mold) => (
            <div
              key={mold.id}
              style={{
                background: theme.gradients.card,
                borderRadius: theme.layout.borderRadiusLg,
                border: `1px solid ${theme.colors.border}`,
                padding: '1.5rem',
                transition: theme.transitions.smooth,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.colors.onSurface }}>{mold.code}</h3>
                  <p style={{ fontSize: '0.8rem', color: theme.colors.onSurfaceVariant }}>{mold.product_name}</p>
                </div>
                <Badge variant={mold.status === 'active' ? 'success' : mold.status === 'in_storage' ? 'neutral' : 'info'}>
                  {mold.status?.replace('_', ' ')}
                </Badge>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', color: theme.colors.onSurfaceVariant }}>
                <div><span style={{ opacity: 0.7 }}>Material:</span> {mold.material}</div>
                <div><span style={{ opacity: 0.7 }}>Cavities:</span> {mold.cavities}</div>
                <div><span style={{ opacity: 0.7 }}>Dimensions:</span> {mold.dimensions}</div>
                <div><span style={{ opacity: 0.7 }}>Cycles:</span> {mold.total_cycles?.toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${theme.colors.border}` }}>
                <Button size="sm" variant="ghost" icon={Edit} onClick={() => handleEdit(mold)}>Edit</Button>
                <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setDeleteModal({ open: true, id: mold.id })} style={{ color: theme.colors.error }}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Mold' : 'Add Mold'} size="lg">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Mold Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
            <Input label="Product Name" value={formData.product_name} onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} required />
            <Input label="Material" value={formData.material} onChange={(e) => setFormData({ ...formData, material: e.target.value })} />
            <Input label="Dimensions" value={formData.dimensions} onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })} placeholder="e.g. 100x50x25" />
            <Input label="Cavities" type="number" value={formData.cavities} onChange={(e) => setFormData({ ...formData, cavities: e.target.value })} />
            <Input label="Weight (kg)" type="number" step="0.01" value={formData.weight_kg} onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })} />
            <Select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={STATUS_OPTIONS} />
            <Input label="Min Tonnage" type="number" value={formData.machine_tonnage_min} onChange={(e) => setFormData({ ...formData, machine_tonnage_min: e.target.value })} />
            <Input label="Max Tonnage" type="number" value={formData.machine_tonnage_max} onChange={(e) => setFormData({ ...formData, machine_tonnage_max: e.target.value })} />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: theme.colors.onSurfaceVariant, marginBottom: '0.5rem' }}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{
                width: '100%',
                background: 'rgba(30, 41, 59, 0.6)',
                border: `1px solid ${theme.colors.borderLight}`,
                borderRadius: theme.layout.borderRadius,
                padding: '0.75rem 1rem',
                color: theme.colors.onSurface,
                fontSize: '0.875rem',
                minHeight: '80px',
                resize: 'vertical',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Mold</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })} title="Delete Mold">
        <p style={{ color: theme.colors.onSurfaceVariant, marginBottom: '1.5rem' }}>Are you sure you want to delete this mold? This action cannot be undone.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteModal({ open: false, id: null })}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
