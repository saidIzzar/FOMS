import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Factory, Lock, User, Sparkles } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-tertiary/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary via-blue-500 to-tertiary rounded-3xl mb-5 shadow-2xl shadow-primary/30 animate-float">
            <Factory size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gradient">FOMS</h1>
          <p className="text-on-surface-variant mt-3 flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-primary" />
            {t('app.subtitle')}
          </p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold mb-6 text-center text-on-surface">{t('auth.welcomeBack')}</h2>
          
          {error && (
            <div className="mb-5 p-4 bg-error/10 border border-error/30 rounded-xl text-error text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-error"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">
                {t('auth.username')}
              </label>
              <div className="relative">
                <User className="absolute start-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field w-full ps-11"
                  placeholder={t('auth.username')}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute start-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full ps-11"
                  placeholder={t('auth.password')}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.loading')}
                </span>
              ) : t('auth.login')}
            </button>
            
            <div className="text-center">
              <span className="text-on-surface-variant text-sm">
                {t('auth.noAccount') || "Don't have an account?"}
              </span>
              <Link 
                to="/register" 
                className="text-primary hover:text-primary/80 font-medium text-sm ms-1"
              >
                {t('auth.registerNow') || "Register Now"}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}