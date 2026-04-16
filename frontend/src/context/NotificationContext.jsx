import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      type: notification.type || 'info',
      message: notification.message,
      duration: notification.duration || 4000,
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, newNotification.duration);
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const success = useCallback((message) => {
    return addNotification({ type: 'success', message });
  }, [addNotification]);

  const error = useCallback((message) => {
    return addNotification({ type: 'error', message });
  }, [addNotification]);

  const warning = useCallback((message) => {
    return addNotification({ type: 'warning', message });
  }, [addNotification]);

  const info = useCallback((message) => {
    return addNotification({ type: 'info', message });
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      removeNotification,
      success,
      error,
      warning,
      info
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}