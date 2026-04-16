import { useState, useEffect } from 'react';
import { materialsAPI } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { Plus, Package, Truck, Building2, Scale, Calendar, Edit2, Trash2 } from 'lucide-react';
import CrudModal from '../components/CrudModal';
import ConfirmDialog from '../components/ConfirmDialog';

const initialSuppliers = [
  { id: 1, name: 'Al-Riyadh Plastics', email: 'contact@riyadhplastics.com', phone: '+966112345678', address: 'Riyadh Industrial Zone' },
  { id: 2, name: 'Gulf Materials Co.', email: 'info@gulfmaterials.com', phone: '+966112345679', address: 'Jubail Industrial City' },
  { id: 3, name: 'Saudi Polymer Industries', email: 'sales@saudi-polymer.com', phone: '+966112345680', address: 'Dammam Second Industrial Area' },
];

const initialReceptions = [
  { id: 1, material_type: 'ABS', batch_number: 'ABS-2026-001', quantity_kg: 500, status: 'approved', supplier_id: 1, reception_date: '2026-04-13', notes: 'First batch of the month' },
  { id: 2, material_type: 'PP', batch_number: 'PP-2026-002', quantity_kg: 750, status: 'pending', supplier_id: 2, reception_date: '2026-04-12', notes: '' },
  { id: 3, material_type: 'PC', batch_number: 'PC-2026-001', quantity_kg: 300, status: 'approved', supplier_id: 3, reception_date: '2026-04-10', notes: 'High-grade polycarbonate' },
];

const MATERIAL_TYPES = [
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
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'quarantine', label: 'Quarantine' },
];

const supplierFields = [
  { name: 'name', label: 'Company Name', type: 'text', required: true, placeholder: 'e.g., Al-Riyadh Plastics' },
  { name: 'email', label: 'Email', type: 'text', required: true, placeholder: 'e.g., contact@company.com' },
  { name: 'phone', label: 'Phone', type: 'text', required: true, placeholder: 'e.g., +966501234567' },
  { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Full company address' },
];

const receptionFields = [
  { name: 'material_type', label: 'Material Type', type: 'select', required: true, options: MATERIAL_TYPES },
  { name: 'batch_number', label: 'Batch Number', type: 'text', required: true, placeholder: 'e.g., ABS-2026-001' },
  { name: 'quantity_kg', label: 'Quantity (kg)', type: 'number', required: true, min: 1, placeholder: 'e.g., 500' },
  { name: 'supplier_id', label: 'Supplier', type: 'select', required: true, options: [] },
  { name: 'reception_date', label: 'Reception Date', type: 'text', required: true, placeholder: 'YYYY-MM-DD' },
  { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, defaultValue: 'pending' },
  { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Any additional notes...' },
];

export default function Materials() {
  const { success, error } = useNotifications();
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [receptions, setReceptions] = useState(initialReceptions);
  const [activeTab, setActiveTab] = useState('receptions');
  const [loading, setLoading] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, type: '' });

  const getSupplierName = (id) => suppliers.find(s => s.id === id)?.name || 'Unknown';

  const handleCreateSupplier = async (formData) => {
    try {
      setLoading(true);
      const newSupplier = { ...formData, id: Date.now() };
      setSuppliers(prev => [...prev, newSupplier]);
      success('Supplier created successfully');
      setModalOpen(false);
    } catch (err) {
      error('Failed to create supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSupplier = async (formData) => {
    try {
      setLoading(true);
      setSuppliers(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...formData } : s));
      success('Supplier updated successfully');
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      error('Failed to update supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async () => {
    try {
      setSuppliers(prev => prev.filter(s => s.id !== deleteDialog.item.id));
      success('Supplier deleted successfully');
      setDeleteDialog({ open: false, item: null, type: '' });
    } catch (err) {
      error('Failed to delete supplier');
    }
  };

  const handleCreateReception = async (formData) => {
    try {
      setLoading(true);
      const newReception = { 
        ...formData, 
        id: Date.now(),
        quantity_kg: parseInt(formData.quantity_kg),
        supplier_id: parseInt(formData.supplier_id)
      };
      setReceptions(prev => [...prev, newReception]);
      success('Material reception created successfully');
      setModalOpen(false);
    } catch (err) {
      error('Failed to create reception');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReception = async (formData) => {
    try {
      setLoading(true);
      setReceptions(prev => prev.map(r => r.id === editingItem.id ? { 
        ...r, 
        ...formData,
        quantity_kg: parseInt(formData.quantity_kg),
        supplier_id: parseInt(formData.supplier_id)
      } : r));
      success('Reception updated successfully');
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      error('Failed to update reception');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReception = async () => {
    try {
      setReceptions(prev => prev.filter(r => r.id !== deleteDialog.item.id));
      success('Reception deleted successfully');
      setDeleteDialog({ open: false, item: null, type: '' });
    } catch (err) {
      error('Failed to delete reception');
    }
  };

  const openAddModal = (type) => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item, type) => {
    setEditingItem({ ...item, type });
    setModalOpen(true);
  };

  const currentFields = activeTab === 'suppliers' ? supplierFields : receptionFields.map(f => {
    if (f.name === 'supplier_id') {
      return { ...f, options: suppliers.map(s => ({ value: s.id, label: s.name })) };
    }
    return f;
  });

  const currentHandleCreate = activeTab === 'suppliers' ? handleCreateSupplier : handleCreateReception;
  const currentHandleUpdate = activeTab === 'suppliers' ? handleUpdateSupplier : handleUpdateReception;
  const currentHandleDelete = activeTab === 'suppliers' ? handleDeleteSupplier : handleDeleteReception;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Materials</h1>
          <p className="text-on-surface-variant mt-1">Material reception and supplier management</p>
        </div>
        <button 
          onClick={() => openAddModal(activeTab)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add {activeTab === 'suppliers' ? 'Supplier' : 'Reception'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 mb-2">
            <Package size={18} className="text-primary" />
            <span className="text-sm text-on-surface-variant">Receptions</span>
          </div>
          <p className="text-3xl font-bold text-on-surface">{receptions.length}</p>
        </div>
        <div className="glass-card hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 mb-2">
            <Building2 size={18} className="text-secondary" />
            <span className="text-sm text-on-surface-variant">Suppliers</span>
          </div>
          <p className="text-3xl font-bold text-on-surface">{suppliers.length}</p>
        </div>
        <div className="glass-card hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 mb-2">
            <Scale size={18} className="text-warning" />
            <span className="text-sm text-on-surface-variant">Total Stock</span>
          </div>
          <p className="text-3xl font-bold text-on-surface">{receptions.reduce((acc, r) => acc + (r.quantity_kg || 0), 0).toLocaleString()} kg</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('receptions')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'receptions' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-surface/50 text-on-surface-variant hover:text-on-surface'}`}
        >
          <Package size={16} className="inline me-2" />
          Receptions
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'suppliers' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-surface/50 text-on-surface-variant hover:text-on-surface'}`}
        >
          <Building2 size={16} className="inline me-2" />
          Suppliers
        </button>
      </div>

      {activeTab === 'receptions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <Package size={20} className="text-primary" />
              Material Receptions
            </h3>
            {receptions.length > 0 ? (
              <div className="space-y-3">
                {receptions.map(rec => (
                  <div key={rec.id} className="p-4 bg-surface/50 rounded-xl hover:bg-surface/70 transition-colors group">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                          <Package size={18} className="text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-on-surface">{rec.material_type}</p>
                          <p className="text-sm text-on-surface-variant">Batch: {rec.batch_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          rec.status === 'approved' ? 'bg-secondary/20 text-secondary' :
                          rec.status === 'pending' ? 'bg-warning/20 text-warning' :
                          rec.status === 'rejected' ? 'bg-error/20 text-error' :
                          'bg-tertiary/20 text-tertiary'
                        }`}>
                          {rec.status}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                          <button onClick={() => openEditModal(rec, 'reception')} className="p-1.5 rounded-lg hover:bg-primary/20 text-on-surface-variant">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeleteDialog({ open: true, item: rec, type: 'reception' })} className="p-1.5 rounded-lg hover:bg-error/20 text-on-surface-variant">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-on-surface-variant">
                      <span className="flex items-center gap-1.5">
                        <Scale size={14} />
                        {rec.quantity_kg} kg
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Building2 size={14} />
                        {getSupplierName(rec.supplier_id)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {rec.reception_date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant text-center py-4">No receptions</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <Building2 size={20} className="text-secondary" />
            Suppliers
          </h3>
          {suppliers.length > 0 ? (
            <div className="space-y-3">
              {suppliers.map(sup => (
                <div key={sup.id} className="p-4 bg-surface/50 rounded-xl hover:bg-surface/70 transition-colors group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-tertiary/10 rounded-lg">
                        <Truck size={18} className="text-tertiary" />
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">{sup.name}</p>
                        <p className="text-sm text-on-surface-variant">{sup.email}</p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                      <button onClick={() => openEditModal(sup, 'supplier')} className="p-1.5 rounded-lg hover:bg-primary/20 text-on-surface-variant">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteDialog({ open: true, item: sup, type: 'supplier' })} className="p-1.5 rounded-lg hover:bg-error/20 text-on-surface-variant">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {sup.phone}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-on-surface-variant text-center py-4">No suppliers</p>
          )}
        </div>
      )}

      {receptions.length === 0 && suppliers.length === 0 && (
        <div className="glass-card text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Package size={40} className="text-on-surface-variant" />
          </div>
          <p className="text-on-surface-variant text-lg">No materials data found</p>
          <button onClick={() => openAddModal(activeTab)} className="btn-primary mt-4">
            Add First {activeTab === 'suppliers' ? 'Supplier' : 'Reception'}
          </button>
        </div>
      )}

      <CrudModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        title={editingItem ? `Edit ${activeTab === 'suppliers' ? 'Supplier' : 'Reception'}` : `Add ${activeTab === 'suppliers' ? 'Supplier' : 'Reception'}`}
        item={editingItem}
        onSubmit={editingItem ? currentHandleUpdate : currentHandleCreate}
        fields={currentFields}
        loading={loading}
        size="md"
      />

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null, type: '' })}
        onConfirm={currentHandleDelete}
        title={`Delete ${deleteDialog.type === 'supplier' ? 'Supplier' : 'Reception'}`}
        message={`Are you sure you want to delete this ${deleteDialog.type === 'supplier' ? 'supplier' : 'reception'}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={loading}
      />
    </div>
  );
}