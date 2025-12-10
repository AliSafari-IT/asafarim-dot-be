// packages/booking-calendar/src/DayView.tsx
import { BookingEvent } from './types';
import { format, addMinutes, isSameDay, isToday } from 'date-fns';
import { useEventLayout } from './hooks/useEventLayout';
import BookingStatusBadge from './BookingStatusBadge';

interface DayViewProps {
  currentDate: Date;
  bookings: BookingEvent[];
  onSlotClick: (start: Date, end: Date) => void;
  onBookingClick: (booking: BookingEvent) => void;
}

export default function DayView({ currentDate, bookings, onSlotClick, onBookingClick }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const { getEventPosition } = useEventLayout();
  
  const now = new Date();
  const isTodayView = isToday(currentDate);
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const nowPosition = ((currentHour * 60 + currentMinute) / (24 * 60)) * 100;

  const dayBookings = bookings.filter(b => isSameDay(new Date(b.startTime), currentDate));

  const handleSlotClick = (hour: number) => {
    const start = new Date(currentDate);
    start.setHours(hour, 0, 0, 0);
    const end = addMinutes(start, 60);
    onSlotClick(start, end);
  };

  return (
    <div className="bc-day-view">
      <div className="bc-day-header">
        <div className="bc-day-title">{format(currentDate, 'EEEE, MMMM d, yyyy')}</div>
      </div>
      <div className="bc-day-body">
        <div className="bc-day-time-column">
          {hours.map(hour => (
            <div key={hour} className="bc-day-time-slot">
              {format(new Date().setHours(hour, 0), 'h a')}
            </div>
          ))}
        </div>
        <div className="bc-day-grid-container">
          {isTodayView && (
            <div className="bc-day-now-line" style={{ top: `${nowPosition}%` }}>
              <div className="bc-day-now-dot"></div>
            </div>
          )}
          <div className="bc-day-column">
            {hours.map(hour => (
              <div
                key={hour}
                className="bc-day-grid-slot"
                onClick={() => handleSlotClick(hour)}
              />
            ))}
            {dayBookings.map(booking => {
              const pos = getEventPosition(booking, currentDate);
              return (
                <div
                  key={booking.id}
                  className="bc-day-event"
                  style={{
                    top: `${pos.top}%`,
                    height: `${pos.height}%`,
                    left: `${pos.left}%`,
                    width: `${pos.width}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookingClick(booking);
                  }}
                >
                  <BookingStatusBadge status={booking.status} size="sm" />
                  <div className="bc-day-event-title">{booking.title}</div>
                  <div className="bc-day-event-client">{booking.clientName}</div>
                  <div className="bc-day-event-time">
                    {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}