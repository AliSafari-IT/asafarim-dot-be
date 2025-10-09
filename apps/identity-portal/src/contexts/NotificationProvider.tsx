import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { NotificationType, Notification } from './notificationTypes';
import { NotificationContext } from './NotificationContext';

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    message: string,
    type: NotificationType = 'info',
    duration = 5000
  ) => {
    // Generate a robust unique ID to avoid duplicate keys when multiple notifications
    // are created within the same millisecond
    const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? (crypto as unknown as { randomUUID: () => string }).randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newNotification: Notification = { id, message, type, duration };
    
    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        // Inline removal to avoid depending on removeNotification
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const contextValue = useMemo(() => ({
    notifications,
    addNotification,
    removeNotification,
  }), [notifications, addNotification, removeNotification]);

  return (
    <NotificationContext.Provider
      value={contextValue}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
