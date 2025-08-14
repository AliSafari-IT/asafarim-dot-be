import React, { useState } from 'react';
import type { ReactNode } from 'react';
import type { NotificationType, Notification } from './notificationTypes';
import { NotificationContext } from './NotificationContext';

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    message: string,
    type: NotificationType = 'info',
    duration = 5000
  ) => {
    const id = Date.now().toString();
    const newNotification: Notification = { id, message, type, duration };
    
    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
