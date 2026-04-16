import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import LanguageSelector from '../../components/LanguageSelector';
import { Bell, Search, User, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isRtl = language === 'ar';

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        [isRtl ? 'left' : 'right']: 0,
        [isRtl ? 'right' : 'left']: '18rem',
        height: theme.layout.headerHeight,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: isRtl ? 'space-between' : 'space-between',
        flexDirection: isRtl ? 'row-reverse' : 'row',
        padding: '0 1.5rem',
        zIndex: 30,
        transition: theme.transitions.smooth,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(30, 41, 59, 0.6)',
          border: `1px solid ${theme.colors.borderLight}`,
          borderRadius: '12px',
          padding: '0.5rem 1rem',
          width: '320px',
        }}
      >
        <Search size={18} color={theme.colors.onSurfaceVariant} />
        <input
          type="text"
          placeholder="Search machines, molds, operators..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: theme.colors.onSurface,
            fontSize: '0.875rem',
            width: '100%',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          style={{
            position: 'relative',
            padding: '0.625rem',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.onSurfaceVariant,
            cursor: 'pointer',
            transition: theme.transitions.normal,
          }}
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              background: theme.colors.error,
              borderRadius: '50%',
              border: '2px solid rgba(15, 23, 42, 0.8)',
            }}
          />
        </button>

        <LanguageSelector />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.375rem 0.75rem',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${theme.colors.border}`,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '10px',
              background: theme.gradients.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={16} color="#0f172a" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: theme.colors.onSurface,
              }}
            >
              {user?.username || 'Admin'}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                color: theme.colors.onSurfaceVariant,
                textTransform: 'capitalize',
              }}
            >
              {user?.role || 'Administrator'}
            </span>
          </div>
          <ChevronDown size={16} color={theme.colors.onSurfaceVariant} />
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: '0.625rem',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: theme.colors.error,
            cursor: 'pointer',
            transition: theme.transitions.normal,
          }}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
