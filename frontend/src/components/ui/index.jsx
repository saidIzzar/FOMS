import { useEffect } from 'react';
import { X } from 'lucide-react';
import { theme } from '../../styles/theme';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: '24rem',
    md: '32rem',
    lg: '48rem',
    xl: '64rem',
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1rem',
        animation: 'fade-in 0.2s ease-out',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.gradients.card,
          borderRadius: theme.layout.borderRadiusXl,
          border: `1px solid ${theme.colors.borderLight}`,
          width: '100%',
          maxWidth: sizes[size],
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: theme.shadows.modal,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.colors.onSurface }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              color: theme.colors.onSurfaceVariant,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: theme.transitions.normal,
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled,
  fullWidth,
  onClick,
  type = 'button',
  ...props
}) {
  const variants = {
    primary: {
      background: theme.gradients.primary,
      color: '#0f172a',
      border: 'none',
    },
    secondary: {
      background: 'rgba(56, 189, 248, 0.1)',
      color: theme.colors.primary,
      border: `1px solid rgba(56, 189, 248, 0.2)`,
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      border: 'none',
    },
    ghost: {
      background: 'transparent',
      color: theme.colors.onSurfaceVariant,
      border: 'none',
    },
  };

  const sizes = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.8rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '0.875rem' },
    lg: { padding: '1rem 1.75rem', fontSize: '1rem' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        ...sizes[size],
        fontWeight: 600,
        borderRadius: theme.layout.borderRadius,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: theme.transitions.normal,
        width: fullWidth ? '100%' : 'auto',
        ...props.style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = theme.shadows.glow;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function Input({ label, error, helpText, icon: Icon, ...props }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: theme.colors.onSurfaceVariant,
            marginBottom: '0.5rem',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.colors.onSurfaceVariant,
              pointerEvents: 'none',
            }}
          >
            <Icon size={18} />
          </div>
        )}
        <input
          {...props}
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: `1px solid ${error ? theme.colors.error : theme.colors.borderLight}`,
            borderRadius: theme.layout.borderRadius,
            padding: Icon ? '0.75rem 1rem 0.75rem 2.75rem' : '0.75rem 1rem',
            color: theme.colors.onSurface,
            fontSize: '0.875rem',
            width: '100%',
            outline: 'none',
            transition: theme.transitions.normal,
            backdropFilter: 'blur(10px)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = theme.colors.primary;
            e.target.style.boxShadow = `0 0 0 3px rgba(56, 189, 248, 0.15)`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? theme.colors.error : theme.colors.borderLight;
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
      {error && (
        <p style={{ fontSize: '0.75rem', color: theme.colors.error, marginTop: '0.375rem' }}>
          {error}
        </p>
      )}
      {helpText && (
        <p style={{ fontSize: '0.75rem', color: theme.colors.onSurfaceVariant, marginTop: '0.375rem' }}>
          {helpText}
        </p>
      )}
    </div>
  );
}

export function Select({ label, error, options = [], ...props }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: theme.colors.onSurfaceVariant,
            marginBottom: '0.5rem',
          }}
        >
          {label}
        </label>
      )}
      <select
        {...props}
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: `1px solid ${error ? theme.colors.error : theme.colors.borderLight}`,
          borderRadius: theme.layout.borderRadius,
          padding: '0.75rem 2.5rem 0.75rem 1rem',
          color: theme.colors.onSurface,
          fontSize: '0.875rem',
          width: '100%',
          outline: 'none',
          transition: theme.transitions.normal,
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1rem',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p style={{ fontSize: '0.75rem', color: theme.colors.error, marginTop: '0.375rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function Badge({ children, variant = 'neutral' }) {
  const variants = {
    success: theme.status.running,
    warning: theme.status.idle,
    danger: theme.status.broken,
    info: theme.status.maintenance,
    neutral: theme.status.in_storage,
  };

  const style = variants[variant] || variants.neutral;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.375rem 0.875rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.color}30`,
        textTransform: 'capitalize',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: style.dot,
        }}
      />
      {children || variant}
    </span>
  );
}

export function Card({ children, title, action, style = {} }) {
  return (
    <div
      style={{
        background: theme.gradients.card,
        borderRadius: theme.layout.borderRadiusLg,
        border: `1px solid ${theme.colors.border}`,
        padding: '1.5rem',
        transition: theme.transitions.smooth,
        ...style,
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          {title && (
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.colors.onSurface }}>
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function LoadingSpinner({ size = 48 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid rgba(255, 255, 255, 0.1)`,
        borderTopColor: theme.colors.primary,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        textAlign: 'center',
      }}
    >
      {Icon && (
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <Icon size={36} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.5 }} />
        </div>
      )}
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.colors.onSurface, marginBottom: '0.5rem' }}>
        {title || 'No data found'}
      </h3>
      <p style={{ fontSize: '0.875rem', color: theme.colors.onSurfaceVariant, marginBottom: '1.5rem', maxWidth: '300px' }}>
        {description || 'There are no items to display.'}
      </p>
      {action}
    </div>
  );
}

export function Skeleton({ width = '100%', height = '1rem', style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-loading 1.5s infinite',
        borderRadius: 6,
        ...style,
      }}
    />
  );
}
