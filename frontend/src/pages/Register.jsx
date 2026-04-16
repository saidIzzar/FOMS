import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Factory, Lock, User, Mail, Sparkles, ArrowLeft } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'operator'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await register(formData);
      navigate('/login', { state: { message: t('auth.registrationSuccess') } });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-tertiary/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary via-blue-500 to-tertiary rounded-3xl mb-4 shadow-xl shadow-primary/30 animate-float">
            <Factory size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">FOMS</h1>
          <p className="text-on-surface-variant mt-2 text-sm">{t('auth.createAccount') || 'Create a New Account'}</p>
        </div>

        <div className="glass-card p-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6">
            <ArrowLeft size={16} />
            {t('auth.backToLogin') || 'Back to Login'}
          </Link>
          
          {error && (
            <div className="mb-5 p-4 bg-error/10 border border-error/30 rounded-xl text-error text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-error"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4 md:col-span-1">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">{t('auth.username')}</label>
                <div className="relative">
                  <User className="absolute start-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="input-field w-full text-sm ps-10"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">{t('auth.email') || 'Email'}</label>
                <div className="relative">
                  <Mail className="absolute start-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field w-full text-sm ps-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">{t('auth.password')}</label>
                <div className="relative">
                  <Lock className="absolute start-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field w-full text-sm ps-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 md:col-span-1">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">{t('users.fields.firstName') || 'First Name'}</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="input-field w-full text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">{t('users.fields.lastName') || 'Last Name'}</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input-field w-full text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">{t('users.fields.role') || 'Role'}</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field w-full text-sm appearance-none"
                >
                  <option value="operator">{t('users.roles.operator')}</option>
                  <option value="engineer">{t('users.roles.engineer') || 'Engineer'}</option>
                  <option value="admin">{t('users.roles.admin')}</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-4 md:col-span-2 text-base font-semibold"
            >
              {loading ? t('common.loading') : t('auth.register') || 'Register Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
