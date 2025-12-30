import { useEffect, useState } from 'react';
import type { Notification as NotificationType } from '../../contexts/notificationTypes';
import './Notification.css';

interface NotificationProps {
  notification: NotificationType;
  onClose: (id: string) => void;
}

const Notification = ({ notification, onClose }: NotificationProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const { id, message, type } = notification;

  useEffect(() => {
    // Start exit animation before actual removal
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
      }, notification.duration - 300); // Start exit animation 300ms before removal

      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Wait for exit animation to complete
  };

  return (
    <div
      className={`notification notification-${type} ${isExiting ? 'notification-exit' : ''}`}
      role="alert"
      data-testid={`notification-${type}`}
    >
      <div className="notification-content">
        <span className="notification-message">{message}</span>
      </div>
      <button className="notification-close" onClick={handleClose} aria-label="Close">
        &times;
      </button>
    </div>
  );
};

export default Notification;
