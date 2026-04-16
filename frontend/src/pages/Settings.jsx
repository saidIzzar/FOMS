import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, User, Globe, Bell, Moon, Sun, Shield, Key } from 'lucide-react';

const LANGUAGES = [
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' }
];

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    language: user?.language || 'ar',
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    department: user?.department || '',
    position: user?.position || ''
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Settings</h1>
        <p className="text-on-surface-variant mt-1">System and profile settings</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'preferences', label: 'Preferences', icon: Bell },
          { id: 'security', label: 'Security', icon: Shield }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'bg-surface/50 text-on-surface-variant hover:text-on-surface hover:bg-surface/70'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary/20 rounded-xl">
                <User className="text-primary" size={22} />
              </div>
              <h3 className="text-lg font-semibold">Profile Settings</h3>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-on-surface-variant mb-2">First Name</label>
                  <input
                    type="text"
                    value={settings.first_name}
                    onChange={(e) => setSettings({...settings, first_name: e.target.value})}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-2">Last Name</label>
                  <input
                    type="text"
                    value={settings.last_name}
                    onChange={(e) => setSettings({...settings, last_name: e.target.value})}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-on-surface-variant mb-2">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({...settings, email: e.target.value})}
                  className="input-field w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-on-surface-variant mb-2">Department</label>
                  <input
                    type="text"
                    value={settings.department}
                    onChange={(e) => setSettings({...settings, department: e.target.value})}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-2">Position</label>
                  <input
                    type="text"
                    value={settings.position}
                    onChange={(e) => setSettings({...settings, position: e.target.value})}
                    className="input-field w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-tertiary/20 rounded-xl">
                <Globe className="text-tertiary" size={22} />
              </div>
              <h3 className="text-lg font-semibold">Language & Region</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-on-surface-variant mb-2">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({...settings, language: e.target.value})}
                  className="input-field w-full"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-surface/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="text-on-surface-variant" size={20} />
                    <span className="text-on-surface">Email Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-elevated peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-surface/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="text-on-surface-variant" size={20} />
                    <span className="text-on-surface">Push Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-elevated peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-5">Display Preferences</h3>
            <div className="space-y-4">
              <div className="p-4 bg-surface/50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sun size={20} className="text-warning" />
                  <div>
                    <p className="text-on-surface">Light Mode</p>
                    <p className="text-xs text-on-surface-variant">Currently not available</p>
                  </div>
                </div>
                <div className="w-11 h-6 bg-surface-elevated rounded-full relative">
                  <div className="absolute end-0.5 top-0.5 w-5 h-5 bg-gray-500 rounded-full"></div>
                </div>
              </div>

              <div className="p-4 bg-surface/50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon size={20} className="text-primary" />
                  <div>
                    <p className="text-on-surface">Dark Mode</p>
                    <p className="text-xs text-on-surface-variant">Active</p>
                  </div>
                </div>
                <div className="w-11 h-6 bg-primary rounded-full relative">
                  <div className="absolute start-0.5 top-0.5 w-5 h-5 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-5">Data & Privacy</h3>
            <div className="space-y-4">
              <div className="p-4 bg-surface/50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-on-surface">Analytics</p>
                  <p className="text-xs text-on-surface-variant">Help improve the system</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-elevated peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="p-4 bg-surface/50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-on-surface">Usage Data</p>
                  <p className="text-xs text-on-surface-variant">Share usage data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-elevated peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-error/20 rounded-xl">
                <Key className="text-error" size={22} />
              </div>
              <h3 className="text-lg font-semibold">Change Password</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-on-surface-variant mb-2">Current Password</label>
                <input type="password" className="input-field w-full" placeholder="Enter current password" />
              </div>
              <div>
                <label className="block text-sm text-on-surface-variant mb-2">New Password</label>
                <input type="password" className="input-field w-full" placeholder="Enter new password" />
              </div>
              <div>
                <label className="block text-sm text-on-surface-variant mb-2">Confirm Password</label>
                <input type="password" className="input-field w-full" placeholder="Confirm new password" />
              </div>
              <button className="btn-secondary w-full">Update Password</button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-5">Security Settings</h3>
            <div className="space-y-4">
              <div className="p-4 bg-surface/50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-on-surface">Two-Factor Authentication</p>
                  <p className="text-xs text-on-surface-variant">Add an extra layer of security</p>
                </div>
                <button className="text-sm text-primary hover:underline">Enable</button>
              </div>

              <div className="p-4 bg-surface/50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-on-surface">Active Sessions</p>
                  <p className="text-xs text-on-surface-variant">Manage your logged in devices</p>
                </div>
                <button className="text-sm text-primary hover:underline">View</button>
              </div>

              <div className="p-4 bg-error/10 border border-error/20 rounded-xl">
                <p className="text-error font-medium">Danger Zone</p>
                <p className="text-xs text-on-surface-variant mt-1">Permanently delete your account</p>
                <button className="btn-danger mt-3 w-full">Delete Account</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-6 py-3"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}