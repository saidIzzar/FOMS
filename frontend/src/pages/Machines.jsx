import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { theme, getStatusStyle } from '../styles/theme';
import { machinesAPI, branchesAPI, machineSpecsAPI } from '../services/api';
import { Modal, Button, Input, Select, Badge, LoadingSpinner, EmptyState } from '../components/ui';
import { Plus, Search, Edit, Trash2, Factory, Download, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, exportToPDF } from '../utils/export';

const MACHINE_CLASS_OPTIONS = [
  { value: '90T', label: '90T' },
  { value: '120T', label: '120T' },
  { value: '160T', label: '160T' },
  { value: '200T', label: '200T' },
  { value: '250T', label: '250T' },
  { value: '280T', label: '280T' },
  { value: '380T', label: '380T' },
  { value: '450T', label: '450T' },
  { value: '470T', label: '470T' },
  { value: '800T', label: '800T' },
];

const initialForm = {
  machine_class: '',
  quantity: 1,
  status: 'idle',
  location: '',
};

const STATUS_OPTIONS = [
  { value: 'running', label: 'Running' },
  { value: 'idle', label: 'Idle' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'broken', label: 'Broken' },
];

const STATUS_OPTIONS_KEYS = [
  { value: 'running', key: 'status.running' },
  { value: 'idle', key: 'status.idle' },
  { value: 'maintenance', key: 'status.maintenance' },
  { value: 'broken', key: 'status.broken' },
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

export default function Machines() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [branches, setBranches] = useState([]);
  const [machineSpecs, setMachineSpecs] = useState([]);

  useEffect(() => {
    fetchMachines();
    fetchBranches();
    fetchMachineSpecs();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await branchesAPI.getAll();
      setBranches(res.data);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  };

  const fetchMachineSpecs = async () => {
    try {
      const res = await machineSpecsAPI.getAll();
      setMachineSpecs(res.data);
    } catch (err) {
      console.error('Failed to fetch machine specs:', err);
    }
  };

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
      const selectedSpec = machineSpecs.find(s => s.machine_class === formData.machine_class);
      const selectedBranch = branches[0];
      
      if (editId) {
        await machinesAPI.update(editId, { status: formData.status });
      } else {
        if (!selectedSpec || !selectedBranch) {
          console.error('Missing spec or branch');
          setSubmitting(false);
          return;
        }

        const quantity = formData.quantity || 1;
        
        for (let i = 0; i < quantity; i++) {
          const machineData = {
            branch_id: selectedBranch.id,
            spec_id: selectedSpec.id,
            status: formData.status,
          };
          await machinesAPI.create(machineData);
        }
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
      machine_class: machine.spec?.machine_class || '',
      quantity: 1,
      status: machine.status || 'idle',
      location: machine.branch?.name || '',
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            icon={FileSpreadsheet} 
            variant="secondary"
            onClick={() => exportToCSV(machines, 'machines', ['Name', 'Model', 'Serial', 'Tonnage', 'Status', 'Location', 'Efficiency'])}
          >
            CSV
          </Button>
          <Button 
            icon={Download} 
            variant="secondary"
            onClick={() => exportToPDF(machines, 'machines', 'Machines Report', [
              { key: 'name', label: 'Name' },
              { key: 'model', label: 'Model' },
              { key: 'tonnage', label: 'Tonnage' },
              { key: 'status', label: 'Status' },
              { key: 'location', label: 'Location' }
            ])}
          >
            PDF
          </Button>
          <Button icon={Plus} onClick={() => { setEditId(null); setFormData(initialForm); setModalOpen(true); }}>
            Add Machine
          </Button>
        </div>
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
          <option value="">All</option>
          <option value="running">Running</option>
          <option value="idle">Idle</option>
          <option value="maintenance">Maintenance</option>
          <option value="broken">Broken</option>
        </select>
      </div>

      {filteredMachines.length === 0 ? (
        <EmptyState icon={Factory} title="No machines found" description="Add your first machine to get started" action={
          <Button icon={Plus} onClick={() => setModalOpen(true)}>Add Machine</Button>
        } />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
          {filteredMachines.map((machine) => (
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
                  <Link to={`/machines/${machine.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.colors.onSurface }}>{machine.machine_code}</h3>
                  </Link>
                  <p style={{ fontSize: '0.8rem', color: theme.colors.onSurfaceVariant }}>{machine.spec?.machine_class || 'N/A'} - {machine.branch?.name || 'No Branch'}</p>
                </div>
                <Badge variant={machine.status === 'running' ? 'success' : machine.status === 'idle' ? 'warning' : machine.status === 'maintenance' ? 'info' : 'danger'}>
                  {machine.status}
                </Badge>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', color: theme.colors.onSurfaceVariant }}>
                <div><span style={{ opacity: 0.7 }}>Serial:</span> {machine.serial_number || 'N/A'}</div>
                <div><span style={{ opacity: 0.7 }}>Tonnage:</span> {machine.spec?.tonnage || 'N/A'}T</div>
                <div><span style={{ opacity: 0.7 }}>Location:</span> {machine.branch?.location || 'N/A'}</div>
                <div><span style={{ opacity: 0.7 }}>Status:</span> {machine.status}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${theme.colors.border}` }}>
                <Button size="sm" variant="ghost" icon={Edit} onClick={() => handleEdit(machine)}>Edit</Button>
                <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setDeleteModal({ open: true, id: machine.id })} style={{ color: theme.colors.error }}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Machine' : 'Add Machine'} size="md">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Select 
              label="Machine Class" 
              value={formData.machine_class} 
              onChange={(e) => setFormData({ ...formData, machine_class: e.target.value })} 
              options={machineSpecs.map(s => ({ value: s.machine_class, label: s.machine_class }))}
              required 
              disabled={!!editId}
            />
            {!editId && (
              <Input 
                label="Quantity" 
                type="number" 
                min="1" 
                value={formData.quantity} 
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} 
                required 
              />
            )}
            <Select 
              label="Status" 
              value={formData.status} 
              onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
              options={[{ value: 'running', label: 'Running' }, { value: 'idle', label: 'Idle' }, { value: 'maintenance', label: 'Maintenance' }, { value: 'broken', label: 'Broken' }]} 
            />
            <Input 
              label="Location" 
              value={formData.location} 
              onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
              disabled
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Loading...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })} title="Delete">
        <p style={{ color: theme.colors.onSurfaceVariant, marginBottom: '1.5rem' }}>Are you sure you want to delete?</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteModal({ open: false, id: null })}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
