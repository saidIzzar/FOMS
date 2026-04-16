import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { theme } from '../../styles/theme';
import {
  Factory, Box, Activity, Calendar, CheckCircle, Brain,
  Users, Settings, ChevronLeft, ChevronRight, Wrench,
  Package, BarChart3, Gauge, AlertTriangle
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Gauge, labelKey: 'dashboard' },
  { path: '/machines', icon: Factory, labelKey: 'machines' },
  { path: '/molds', icon: Box, labelKey: 'molds' },
  { path: '/rayoun', icon: Package, labelKey: 'rayoun' },
  { path: '/production', icon: Activity, labelKey: 'production' },
  { path: '/parameter-check', icon: CheckCircle, labelKey: 'parameterCheck' },
  { path: '/maintenance', icon: Wrench, labelKey: 'maintenanceTitle' },
  { path: '/materials', icon: Package, labelKey: 'materials' },
  { path: '/locations', icon: BarChart3, labelKey: 'locations' },
  { path: '/ai-services', icon: Brain, labelKey: 'aiServices' },
  { path: '/reports', icon: AlertTriangle, labelKey: 'reports' },
  { path: '/users', icon: Users, labelKey: 'users' },
  { path: '/settings', icon: Settings, labelKey: 'settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const { t, language } = useLanguage();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', collapsed);
  }, [collapsed]);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const isRtl = language === 'ar';

  return (
    <aside
      style={{
        position: 'fixed',
        left: isRtl ? 'auto' : 0,
        right: isRtl ? 0 : 'auto',
        top: 0,
        height: '100vh',
        width: collapsed ? theme.layout.sidebarCollapsed : theme.layout.sidebarWidth,
        background: theme.gradients.glass,
        borderRight: isRtl ? 'none' : `1px solid ${theme.colors.border}`,
        borderLeft: isRtl ? `1px solid ${theme.colors.border}` : 'none',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        backdropFilter: 'blur(20px)',
        boxShadow: isRtl ? '-4px 0 30px rgba(0, 0, 0, 0.3)' : '4px 0 30px rgba(0, 0, 0, 0.3)',
        transition: theme.transitions.smooth,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '1.5rem',
          borderBottom: `1px solid ${theme.colors.border}`,
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          minHeight: '4rem',
        }}
      >
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '12px',
            background: theme.gradients.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Factory size={20} color="#0f172a" />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <h1
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: theme.colors.onSurface,
                whiteSpace: 'nowrap',
              }}
            >
              FOMS
            </h1>
            <p
              style={{
                fontSize: '0.7rem',
                color: theme.colors.onSurfaceVariant,
                whiteSpace: 'nowrap',
              }}
            >
              Industrial OS v3.1
            </p>
          </div>
        )}
      </div>

      <nav
        style={{
          flex: 1,
          padding: '1rem',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? t(item.labelKey) : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: collapsed ? '0.875rem center' : '0.875rem 1.125rem',
                borderRadius: '14px',
                color: isActive ? theme.colors.primary : theme.colors.onSurfaceVariant,
                textDecoration: 'none',
                transition: theme.transitions.normal,
                fontSize: '0.9rem',
                fontWeight: 500,
                marginBottom: '0.375rem',
                position: 'relative',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)'
                  : 'transparent',
                border: isActive
                  ? `1px solid rgba(56, 189, 248, 0.2)`
                  : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = theme.colors.onSurface;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = theme.colors.onSurfaceVariant;
                }
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    [isRtl ? 'right' : 'left']: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: '60%',
                    background: theme.colors.primary,
                    borderRadius: isRtl ? '4px 0 0 4px' : '0 4px 4px 0',
                  }}
                />
              )}
              <Icon
                size={20}
                style={{
                  flexShrink: 0,
                  color: isActive ? theme.colors.primary : 'inherit',
                }}
              />
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{t(item.labelKey)}</span>}
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          padding: '1rem',
          borderTop: `1px solid ${theme.colors.border}`,
        }}
      >
        <button
          onClick={toggleSidebar}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.onSurfaceVariant,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: theme.transitions.normal,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = theme.colors.border;
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span style={{ fontSize: '0.8rem' }}>{t('common.collapse')}</span>}
        </button>
      </div>
    </aside>
  );
}
