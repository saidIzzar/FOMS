import { useState, useEffect } from 'react';
import { theme, getStatusStyle } from '../../../styles/theme';
import { machinesAPI } from '../../../services/api';
import { Modal, Button, Input, Select, Badge, LoadingSpinner, EmptyState } from '../../ui';
import { Plus, Search, Edit, Trash2, X, Filter, Factory } from 'lucide-react';

const initialForm = {
  name: '',
  model: '',
  serial_number: '',
  manufacturer: '',
  series: '',
  tonnage: '',
  status: 'idle',
  location: '',
  installation_date: '',
  injection_temp: 220,
  mold_temp: 25,
  cycle_time: 30,
  injection_speed: 50,
  holding_pressure: 100,
  cooling_time: 10,
  material: 'PP',
  notes: '',
};

const STATUS_OPTIONS = [
  { value: 'running', label: 'Running' },
  { value: 'idle', label: 'Idle' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'broken', label: 'Broken' },
];

const MATERIAL_OPTIONS = [
  { value: 'PP', label: 'PP (Polypropylene)' },
  { value: 'ABS', label: 'ABS' },
  { value: 'PA', label: 'PA (Nylon)' },
  { value: 'PC', label: 'PC (Polycarbonate)' },
  { value: 'PE', label: 'PE (Polyethylene)' },
  { value: 'PVC', label: 'PVC' },
  { value: 'PS', label: 'PS (Polystyrene)' },
  { value: 'POM', label: 'POM (Acetal)' },
];

export default function MachineList() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await machinesAPI.getAll();
      setMachines(res.data);
    } catch (err) {
      console.error('Failed to fetch machines:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await machinesAPI.update(editId, formData);
      } else {
        await machinesAPI.create(formData);
      }
      setModalOpen(false);
      setFormData(initialForm);
      setEditId(null);
      fetchMachines();
    } catch (err) {
      console.error('Failed to save machine:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (machine) => {
    setEditId(machine.id);
    setFormData({
      name: machine.name || '',
      model: machine.model || '',
      serial_number: machine.serial_number || '',
      manufacturer: machine.manufacturer || '',
      series: machine.series || '',
      tonnage: machine.tonnage || '',
      status: machine.status || 'idle',
      location: machine.location || '',
      installation_date: machine.installation_date || '',
      injection_temp: machine.injection_temp || 220,
      mold_temp: machine.mold_temp || 25,
      cycle_time: machine.cycle_time || 30,
      injection_speed: machine.injection_speed || 50,
      holding_pressure: machine.holding_pressure || 100,
      cooling_time: machine.cooling_time || 10,
      material: machine.material || 'PP',
      notes: machine.notes || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await machinesAPI.delete(deleteModal.id);
      setDeleteModal({ open: false, id: null });
      fetchMachines();
    } catch (err) {
      console.error('Failed to delete machine:', err);
    }
  };

  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.model?.toLowerCase().includes(search.toLowerCase()) ||
      m.serial_number?.toLowerCase().includes(search.toLowerCase());
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.colors.onSurface }}>Machines</h1>
        <Button icon={Plus} onClick={() => { setEditId(null); setFormData(initialForm); setModalOpen(true); }}>
          Add Machine
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.colors.onSurfaceVariant }} />
          <input
            type="text"
            placeholder="Search machines..."
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
          <option value="running">Running</option>
          <option value="idle">Idle</option>
          <option value="maintenance">Maintenance</option>
          <option value="broken">Broken</option>
        </select>
      </div>

      {filteredMachines.length === 0 ? (
        <EmptyState icon={Factory} title="No machines found" description="Add your first machine to get started." action={
          <Button icon={Plus} onClick={() => setModalOpen(true)}>Add Machine</Button>
        } />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
          {filteredMachines.map((machine) => {
            const statusStyle = getStatusStyle(machine.status);
            return (
              <div
                key={machine.id}
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
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.colors.onSurface }}>{machine.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: theme.colors.onSurfaceVariant }}>{machine.model} - {machine.manufacturer}</p>
                  </div>
                  <Badge variant={machine.status === 'running' ? 'success' : machine.status === 'idle' ? 'warning' : machine.status === 'maintenance' ? 'info' : 'danger'}>
                    {machine.status}
                  </Badge>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', color: theme.colors.onSurfaceVariant }}>
                  <div><span style={{ opacity: 0.7 }}>Serial:</span> {machine.serial_number}</div>
                  <div><span style={{ opacity: 0.7 }}>Tonnage:</span> {machine.tonnage}T</div>
                  <div><span style={{ opacity: 0.7 }}>Location:</span> {machine.location}</div>
                  <div><span style={{ opacity: 0.7 }}>Efficiency:</span> {machine.efficiency}%</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${theme.colors.border}` }}>
                  <Button size="sm" variant="ghost" icon={Edit} onClick={() => handleEdit(machine)}>Edit</Button>
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setDeleteModal({ open: true, id: machine.id })} style={{ color: theme.colors.error }}>Delete</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Machine' : 'Add Machine'} size="lg">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Machine Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <Input label="Model" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required />
            <Input label="Serial Number" value={formData.serial_number} onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })} />
            <Input label="Manufacturer" value={formData.manufacturer} onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} />
            <Input label="Series" value={formData.series} onChange={(e) => setFormData({ ...formData, series: e.target.value })} />
            <Input label="Tonnage" type="number" value={formData.tonnage} onChange={(e) => setFormData({ ...formData, tonnage: e.target.value })} />
            <Select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={STATUS_OPTIONS} />
            <Input label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            <Input label="Installation Date" type="date" value={formData.installation_date} onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })} />
            <Select label="Material" value={formData.material} onChange={(e) => setFormData({ ...formData, material: e.target.value })} options={MATERIAL_OPTIONS} />
            <Input label="Injection Temp (°C)" type="number" value={formData.injection_temp} onChange={(e) => setFormData({ ...formData, injection_temp: e.target.value })} />
            <Input label="Mold Temp (°C)" type="number" value={formData.mold_temp} onChange={(e) => setFormData({ ...formData, mold_temp: e.target.value })} />
            <Input label="Cycle Time (s)" type="number" value={formData.cycle_time} onChange={(e) => setFormData({ ...formData, cycle_time: e.target.value })} />
            <Input label="Injection Speed (%)" type="number" value={formData.injection_speed} onChange={(e) => setFormData({ ...formData, injection_speed: e.target.value })} />
            <Input label="Holding Pressure (bar)" type="number" value={formData.holding_pressure} onChange={(e) => setFormData({ ...formData, holding_pressure: e.target.value })} />
            <Input label="Cooling Time (s)" type="number" value={formData.cooling_time} onChange={(e) => setFormData({ ...formData, cooling_time: e.target.value })} />
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
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Machine'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })} title="Delete Machine">
        <p style={{ color: theme.colors.onSurfaceVariant, marginBottom: '1.5rem' }}>Are you sure you want to delete this machine? This action cannot be undone.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteModal({ open: false, id: null })}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
