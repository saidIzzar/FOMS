export const theme = {
  colors: {
    primary: '#38bdf8',
    primaryDark: '#0284c7',
    primaryLight: '#7dd3fc',
    secondary: '#22c55e',
    secondaryDark: '#16a34a',
    tertiary: '#a855f7',
    warning: '#facc15',
    error: '#ef4444',
    success: '#22c55e',
    danger: '#ef4444',
    
    surface: '#0f172a',
    surfaceElevated: '#1e293b',
    surfaceHigh: '#334155',
    surfaceHighest: '#475569',
    
    onSurface: '#f1f5f9',
    onSurfaceVariant: '#94a3b8',
    onSurfaceMuted: '#64748b',
    
    border: 'rgba(255, 255, 255, 0.05)',
    borderLight: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(56, 189, 248, 0.15)',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
    dark: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    card: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
    glass: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
  },
  
  shadows: {
    soft: '0 4px 16px rgba(0, 0, 0, 0.2)',
    glow: '0 0 16px rgba(56, 189, 248, 0.12)',
    card: '0 6px 24px rgba(0, 0, 0, 0.25)',
    modal: '0 20px 40px -12px rgba(0, 0, 0, 0.4)',
  },
  
  layout: {
    sidebarWidth: '18rem',
    sidebarCollapsed: '4.5rem',
    headerHeight: '4rem',
    borderRadius: '10px',
    borderRadiusLg: '14px',
    borderRadiusXl: '16px',
  },
  
  status: {
    running: { bg: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', dot: '#22c55e' },
    idle: { bg: 'rgba(250, 204, 21, 0.12)', color: '#facc15', dot: '#facc15' },
    maintenance: { bg: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', dot: '#38bdf8' },
    broken: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', dot: '#ef4444' },
    active: { bg: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', dot: '#22c55e' },
    in_storage: { bg: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', dot: '#94a3b8' },
    in_maintenance: { bg: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', dot: '#38bdf8' },
    pending: { bg: 'rgba(250, 204, 21, 0.12)', color: '#facc15', dot: '#facc15' },
    in_progress: { bg: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', dot: '#38bdf8' },
    completed: { bg: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', dot: '#22c55e' },
  },
  
  transitions: {
    fast: '0.15s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
    smooth: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  fonts: {
    sans: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
};

export const getStatusStyle = (status) => theme.status[status] || theme.status.idle;
