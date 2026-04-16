import { useNotifications } from '../context/NotificationContext';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { notifications, removeNotification } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} />;
      case 'error': return <XCircle size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      default: return <Info size={20} />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success': return 'bg-secondary/20 border-secondary/30 text-secondary';
      case 'error': return 'bg-error/20 border-error/30 text-error';
      case 'warning': return 'bg-warning/20 border-warning/30 text-warning';
      default: return 'bg-primary/20 border-primary/30 text-primary';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 end-6 z-50 flex flex-col gap-3 max-w-md">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-xl animate-slide-up ${getStyles(notification.type)}`}
        >
          <span className="shrink-0">{getIcon(notification.type)}</span>
          <p className="flex-1 text-sm text-on-surface">{notification.message}</p>
          <button
            onClick={() => removeNotification(notification.id)}
            className="shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}