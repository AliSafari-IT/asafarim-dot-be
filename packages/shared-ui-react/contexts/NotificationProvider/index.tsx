import { useState, type ReactNode } from 'react';
import { NotificationContext, type NotificationType, type Notification } from './notificationContext';

interface NotificationProviderProps {
  children: ReactNode;
  autoRemoveTimeout?: number;
}

export const NotificationProvider= ({ 
  children,
  autoRemoveTimeout = 5000 
} : NotificationProviderProps)  => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: NotificationType, message: string, timeout?: number) => {
    const id = Date.now().toString();
    const notificationTimeout = timeout !== undefined ? timeout : autoRemoveTimeout;
    
    setNotifications((prev) => [...prev, { id, type, message, timeout: notificationTimeout }]);
    
    // Auto-remove after specified timeout
    if (notificationTimeout > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notificationTimeout);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
