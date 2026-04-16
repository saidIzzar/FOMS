import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { theme } from '../styles/theme';
import { 
  LayoutDashboard, Factory, Box, Package, Wrench, 
  PackagePlus, CheckCircle, Brain, FileText, Users, Settings, 
  LogOut, Bell, Search, ChevronLeft, ChevronRight, X,
  Globe, Layers
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, labelKey: 'dashboard' },
  { path: '/machines', icon: Factory, labelKey: 'machines' },
  { path: '/molds', icon: Box, labelKey: 'molds' },
  { path: '/rayoun', icon: Layers, labelKey: 'rayoun' },
  { path: '/production', icon: Package, labelKey: 'dailyWork' },
  { path: '/maintenance', icon: Wrench, labelKey: 'maintenanceTitle' },
  { path: '/materials', icon: PackagePlus, labelKey: 'materials' },
  { path: '/parameter-check', icon: CheckCircle, labelKey: 'parameterCheck' },
  { path: '/ai-services', icon: Brain, labelKey: 'aiServices' },
  { path: '/reports', icon: FileText, labelKey: 'reports' },
  { path: '/users', icon: Users, labelKey: 'users' },
  { path: '/settings', icon: Settings, labelKey: 'settings' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar', JSON.stringify(collapsed));
  }, [collapsed]);

  const isRTL = language === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarWidth = collapsed ? 74 : 260;
  const isDesktop = !isMobile;

  return (
    <div dir={direction} style={{ display: 'flex', minHeight: '100vh', background: theme.colors.surface, color: theme.colors.onSurface }}>
      <motion.aside
        ref={sidebarRef}
        animate={{ width: sidebarWidth }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="sidebar-transition card-rtl-transition"
        style={{
          position: 'fixed',
          [isRTL ? 'right' : 'left']: 0,
          left: isRTL ? 'auto' : 0,
          right: isRTL ? 0 : 'auto',
          top: 0,
          height: '100vh',
          background: theme.gradients.glass,
          borderRight: isRTL ? 'none' : `1px solid ${theme.colors.border}`,
          borderLeft: isRTL ? `1px solid ${theme.colors.border}` : 'none',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          backdropFilter: 'blur(20px)',
          boxShadow: isRTL ? '-4px 0 30px rgba(0, 0, 0, 0.3)' : '4px 0 30px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '1.25rem',
          height: '64px',
          borderBottom: `1px solid ${theme.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          overflow: 'hidden',
        }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '12px',
            background: theme.gradients.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Factory size={20} color="#0f172a" />
          </div>
          {!collapsed && !isMobile && (
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ flex: 1 }}
            >
              <h1 style={{ fontSize: '1.125rem', fontWeight: 700 }}>FOMS</h1>
              <p style={{ fontSize: '0.7rem', color: theme.colors.onSurfaceVariant }}>Industrial OS v3.1</p>
            </motion.div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '0.75rem', overflowY: 'auto' }}>
          {navItems.map(({ path, icon: Icon, labelKey }) => (
            <NavLink
              key={path}
              to={path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.875rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '14px',
                color: isActive ? theme.colors.primary : theme.colors.onSurfaceVariant,
                textDecoration: 'none',
                marginBottom: '0.25rem',
                background: isActive ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)' : 'transparent',
                border: isActive ? `1px solid ${theme.colors.borderHover}` : '1px solid transparent',
                transition: 'all 0.2s ease',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} style={{ flexShrink: 0 }} />
                  {!collapsed && !isMobile && (
                    <motion.span
                      initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap' }}
                    >
                      {t(labelKey)}
                    </motion.span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {isDesktop && (
          <div style={{ padding: '0.75rem', borderTop: `1px solid ${theme.colors.border}` }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                background: collapsed 
                  ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${collapsed ? theme.colors.primary : theme.colors.border}`,
                color: collapsed ? theme.colors.primary : theme.colors.onSurfaceVariant,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
              }}
            >
              {collapsed ? (
                isRTL ? <ChevronLeft size={20} style={{ transform: 'scaleX(-1)' }} /> : <ChevronRight size={20} />
              ) : (
                <>
                  {isRTL ? <ChevronRight size={20} style={{ transform: 'scaleX(-1)' }} /> : <ChevronLeft size={20} />}
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                    {isRTL ? 'طي' : 'Collapse'}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </motion.aside>

      <motion.div 
        animate={{ 
          [isRTL ? 'marginRight' : 'marginLeft']: sidebarWidth
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="layout-rtl-transition"
        style={{ 
          flex: 1, 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          [isRTL ? 'marginLeft' : 'marginRight']: 0,
        }}
      >
        <header style={{
          height: '64px',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${theme.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {!isMobile && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'rgba(30, 41, 59, 0.6)',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '12px',
                padding: '0.5rem 1rem',
                width: 'clamp(200px, 30vw, 400px)',
                flexDirection: isRTL ? 'row-reverse' : 'row',
              }}>
                <Search 
                  size={18} 
                  color={theme.colors.onSurfaceVariant} 
                  style={{ transform: isRTL ? 'scaleX(-1)' : 'scaleX(1)' }}
                />
                <input
                  type="text"
                  placeholder={isRTL ? 'البحث...' : 'Search resources...'}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'white',
                    fontSize: '0.875rem',
                    width: '100%',
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={toggleLanguage}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
                border: `1px solid ${theme.colors.primary}`,
                color: theme.colors.primary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                transition: 'all 0.2s ease',
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)',
              }}
              title={language === 'ar' ? 'Switch to English' : 'تغيير إلى العربية'}
            >
              <Globe size={16} />
              <span style={{ 
                background: theme.colors.surface, 
                padding: '0.15rem 0.4rem', 
                borderRadius: '6px',
                minWidth: '24px',
                textAlign: 'center',
              }}>
                {language === 'ar' ? 'EN' : 'عربي'}
              </span>
            </button>
            
            <button style={{
              padding: '0.5rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.onSurfaceVariant,
              cursor: 'pointer',
            }}>
              <Bell size={18} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${theme.colors.border}`,
              cursor: 'pointer',
            }}>
              <div style={{
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: '8px',
                background: theme.gradients.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#0f172a',
              }}>
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              {!isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user?.username || 'Admin'}</span>
                  <span style={{ fontSize: '0.65rem', color: theme.colors.onSurfaceVariant, textTransform: 'capitalize' }}>{user?.role || 'operator'}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              style={{
                height: '36px',
                width: '36px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: theme.colors.error,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: isMobile ? '1rem' : '1.5rem', position: 'relative' }}>
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}
