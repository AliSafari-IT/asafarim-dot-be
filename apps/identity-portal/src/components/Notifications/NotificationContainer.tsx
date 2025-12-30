import Notification from './Notification';
import { useNotification } from '../../hooks/useNotification';
import './Notification.css';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  // remove duplicates
  const uniqueNotifications = notifications.filter(
    (notification, index, self) =>
      index === self.findIndex((t) => t.id === notification.id)
  );

  return (
    <div className="notification-container" data-testid="notification-container">

      {uniqueNotifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
