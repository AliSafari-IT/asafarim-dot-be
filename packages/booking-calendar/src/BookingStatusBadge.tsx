// packages/booking-calendar/src/BookingStatusBadge.tsx
import { BookingStatus } from './types';

interface BookingStatusBadgeProps {
  status: BookingStatus;
  size?: 'xs' | 'sm' | 'md';
}

export default function BookingStatusBadge({ status, size = 'md' }: BookingStatusBadgeProps) {
  return (
    <span className={`bc-status-badge bc-status-${status.toLowerCase()} bc-badge-${size}`}>
      {status}
    </span>
  );
}