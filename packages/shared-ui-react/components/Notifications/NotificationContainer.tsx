import { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../contexts/NotificationProvider/notificationContext';
import './Notifications.css';

export interface NotificationContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

export const NotificationContainer = ({ 
  position = 'top-right',
  className = ''
}: NotificationContainerProps) => {
  const { notifications, removeNotification } = useNotifications();
  const [removing, setRemoving] = useState<Record<string, boolean>>({});

  const handleRemove = (id: string) => {
    setRemoving(prev => ({ ...prev, [id]: true }));
    
    // Wait for animation to complete before removing
    setTimeout(() => {
      removeNotification(id);
      setRemoving(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }, 300);
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'top-left':
        return { top: '20px', left: '20px', right: 'auto' };
      case 'bottom-right':
        return { bottom: '20px', right: '20px', top: 'auto' };
      case 'bottom-left':
        return { bottom: '20px', left: '20px', top: 'auto', right: 'auto' };
      case 'top-right':
      default:
        return { top: '20px', right: '20px' };
    }
  };

  return (
    <div 
      className={`notification-container ${className}`}
      style={{ position: 'fixed', ...getPositionStyle() }}
    >
      {notifications.map((notification: Notification) => (
        <div 
          key={notification.id} 
          className={`notification notification-${notification.type} ${removing[notification.id] ? 'removing' : ''}`}
        >
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
          </div>
          <button 
            className="notification-close" 
            onClick={() => handleRemove(notification.id)}
            aria-label="Close notification"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

// Only use named export
