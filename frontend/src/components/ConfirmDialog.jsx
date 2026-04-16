import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false
}) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (isOpen && type === 'danger') {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'bg-error/20 text-error',
          button: 'bg-error hover:bg-error/90'
        };
      case 'warning':
        return {
          icon: 'bg-warning/20 text-warning',
          button: 'bg-warning hover:bg-warning/90'
        };
      default:
        return {
          icon: 'bg-primary/20 text-primary',
          button: 'bg-primary hover:bg-primary/90'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-md animate-slide-up">
        <div className="p-6 text-center">
          <div className={`w-16 h-16 ${styles.icon} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-semibold text-on-surface mb-2">{title}</h3>
          <p className="text-on-surface-variant">{message}</p>
        </div>

        <div className="flex gap-3 p-5 border-t border-white/5">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`btn-primary flex-1 ${styles.button}`}
            disabled={loading || (type === 'danger' && countdown > 0)}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Processing...
              </span>
            ) : type === 'danger' && countdown > 0 ? 
              `${confirmText} (${countdown})` : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}