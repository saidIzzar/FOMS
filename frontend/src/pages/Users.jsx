import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { useCrud } from '../hooks/useCrud';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Users as UsersIcon, Crown, Wrench, UserCheck, Edit2, Trash2 } from 'lucide-react';
import CrudModal from '../components/CrudModal';
import ConfirmDialog from '../components/ConfirmDialog';

const ROLE_CONFIG = {
  admin: { color: '#ef4444', bg: '#ef444420', label: 'Admin', icon: Crown },
  engineer: { color: '#38bdf8', bg: '#38bdf820', label: 'Engineer', icon: Wrench },
  operator: { color: '#22c55e', bg: '#22c55e20', label: 'Operator', icon: UserCheck }
};

const ROLE_OPTIONS = Object.entries(ROLE_CONFIG).map(([value, config]) => ({ value, label: config.label }));

const DEPARTMENTS = [
  'Production', 'Maintenance', 'Quality', 'Engineering', 'Management', 'IT', 'Warehouse'
];

const userFields = [
  { name: 'username', label: 'Username', type: 'text', required: true, placeholder: 'e.g., john.doe' },
  { name: 'first_name', label: 'First Name', type: 'text', required: true, placeholder: 'e.g., John' },
  { name: 'last_name', label: 'Last Name', type: 'text', required: true, placeholder: 'e.g., Doe' },
  { name: 'email', label: 'Email', type: 'text', placeholder: 'e.g., john.doe@foms.com' },
  { name: 'phone', label: 'Phone', type: 'text', placeholder: 'e.g., +966501234567' },
  { name: 'role', label: 'Role', type: 'select', options: ROLE_OPTIONS, required: true },
  { name: 'department', label: 'Department', type: 'select', options: DEPARTMENTS.map(d => ({ value: d, label: d })) },
  { name: 'position', label: 'Position', type: 'text', placeholder: 'e.g., Machine Operator' },
  { name: 'is_active', label: 'Active', type: 'checkbox', checkboxLabel: 'User account is active', defaultValue: true },
];

export default function Users() {
  const { user: currentUser } = useAuth();
  const { success, error } = useNotifications();
  const { data: users, loading, fetchAll, create, update, remove } = useCrud(usersAPI);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });

  const canManageUsers = currentUser?.role === 'admin';

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleStats = () => ({
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    engineers: users.filter(u => u.role === 'engineer').length,
    operators: users.filter(u => u.role === 'operator').length,
    active: users.filter(u => u.is_active).length
  });

  const stats = getRoleStats();

  const handleCreate = async (formData) => {
    try {
      await create(formData);
      success('User created successfully');
      setModalOpen(false);
    } catch (err) {
      error('Failed to create user');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await update(editingItem.id, formData);
      success('User updated successfully');
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      error('Failed to update user');
    }
  };

  const handleDelete = async () => {
    try {
      await remove(deleteDialog.item.id);
      success('User deleted successfully');
      setDeleteDialog({ open: false, item: null });
    } catch (err) {
      error('Failed to delete user');
    }
  };

  if (loading && users.length === 0) {
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
          <h1 className="text-3xl font-bold text-gradient">Users</h1>
          <p className="text-on-surface-variant mt-1">User management and access control</p>
        </div>
        {canManageUsers && (
          <button 
            onClick={() => { setEditingItem(null); setModalOpen(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add User
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className={`glass-card cursor-pointer transition-all hover:scale-[1.02] ${roleFilter === 'all' ? 'border-primary/50 ring-1 ring-primary/30' : ''}`}
          onClick={() => setRoleFilter('all')}>
          <p className="text-2xl font-bold text-on-surface">{stats.total}</p>
          <p className="text-sm text-on-surface-variant">Total</p>
        </div>
        {Object.entries(ROLE_CONFIG).map(([role, config]) => (
          <div key={role} className={`glass-card cursor-pointer transition-all hover:scale-[1.02] ${roleFilter === role ? 'border-primary/50 ring-1 ring-primary/30' : ''}`}
            onClick={() => setRoleFilter(role)}>
            <div className="flex items-center gap-2 mb-1">
              <config.icon size={14} style={{ color: config.color }} />
              <p className="text-2xl font-bold text-on-surface">{stats[role + 's'] || 0}</p>
            </div>
            <p className="text-sm text-on-surface-variant">{config.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full ps-11"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-4 px-5 text-sm font-medium text-on-surface-variant">User</th>
              <th className="text-left py-4 px-5 text-sm font-medium text-on-surface-variant">Role</th>
              <th className="text-left py-4 px-5 text-sm font-medium text-on-surface-variant">Department</th>
              <th className="text-left py-4 px-5 text-sm font-medium text-on-surface-variant">Position</th>
              <th className="text-left py-4 px-5 text-sm font-medium text-on-surface-variant">Status</th>
              {canManageUsers && <th className="text-right py-4 px-5 text-sm font-medium text-on-surface-variant">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.operator;
              return (
                <tr key={user.id} className="border-b border-white/5 hover:bg-surface/50 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: roleConfig.bg, color: roleConfig.color }}>
                        {(user.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-on-surface-variant">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 inline-flex" 
                      style={{ backgroundColor: roleConfig.bg, color: roleConfig.color }}>
                      <roleConfig.icon size={12} />
                      {roleConfig.label}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-on-surface-variant">{user.department || '-'}</td>
                  <td className="py-4 px-5 text-on-surface-variant">{user.position || '-'}</td>
                  <td className="py-4 px-5">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-secondary/20 text-secondary' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {canManageUsers && (
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingItem(user); setModalOpen(true); }}
                          className="p-2 rounded-lg hover:bg-primary/20 text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ open: true, item: user })}
                          className="p-2 rounded-lg hover:bg-error/20 text-on-surface-variant hover:text-error transition-colors"
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="glass-card text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <UsersIcon size={40} className="text-on-surface-variant" />
          </div>
          <p className="text-on-surface-variant text-lg">No users found</p>
          {canManageUsers && (
            <button onClick={() => setModalOpen(true)} className="btn-primary mt-4">
              Add First User
            </button>
          )}
        </div>
      )}

      <CrudModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        title={editingItem ? 'Edit User' : 'Add New User'}
        item={editingItem}
        onSubmit={editingItem ? handleUpdate : handleCreate}
        fields={userFields}
        loading={loading}
        size="md"
      />

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteDialog.item?.first_name} ${deleteDialog.item?.last_name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={loading}
      />
    </div>
  );
}