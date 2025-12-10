// Main components
export { default as BookingCalendar } from './BookingCalendar';
export { default as BookingModal } from './BookingModal';

// View components
export { default as MonthView } from './MonthView';
export { default as WeekView } from './WeekView';
export { default as DayView } from './DayView';

// Badge components
export { default as BookingStatusBadge } from './BookingStatusBadge';
export { default as DeliveryStatusBadge } from './DeliveryStatusBadge';

// Hooks
export { useCalendarGrid } from './hooks/useCalendarGrid';
export { useEventLayout } from './hooks/useEventLayout';
export { useDragInteractions } from './hooks/useDragInteractions';

// Types
export * from './types';

// Styles (CSS will be imported by consumers)
import './styles/calendar.css';
import './styles/grid.css';
import './styles/modal.css';
import './styles/badges.css';
