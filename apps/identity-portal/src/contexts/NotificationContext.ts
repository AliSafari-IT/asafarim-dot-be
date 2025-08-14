import { createContext } from 'react';
import type { NotificationContextType } from './notificationTypes';

// Create the context with undefined as default value
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export default NotificationContext;
