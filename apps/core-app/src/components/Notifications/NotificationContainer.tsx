import { useNotifications } from '../../contexts/useNotifications';
import type { Notification } from '../../contexts/notificationContext';
import './Notifications.css';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="notification-container">
      {notifications.map((notification: Notification) => (
        <div 
          key={notification.id} 
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
          </div>
          <button 
            className="notification-close" 
            onClick={() => removeNotification(notification.id)}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
