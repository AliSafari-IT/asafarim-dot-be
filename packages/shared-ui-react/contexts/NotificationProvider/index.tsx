import React, { useState, type ReactNode } from 'react';
import { NotificationContext, type NotificationType, type Notification } from './notificationContext';

interface NotificationProviderProps {
  children: ReactNode;
  autoRemoveTimeout?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children,
  autoRemoveTimeout = 5000 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: NotificationType, message: string) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, message }]);
    
    // Auto-remove after specified timeout
    if (autoRemoveTimeout > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, autoRemoveTimeout);
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
