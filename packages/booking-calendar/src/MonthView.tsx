// packages/booking-calendar/src/MonthView.tsx
import { BookingEvent } from './types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import BookingStatusBadge from './BookingStatusBadge';

interface MonthViewProps {
  currentDate: Date;
  bookings: BookingEvent[];
  onSlotClick: (start: Date, end: Date) => void;
  onBookingClick: (booking: BookingEvent) => void;
}

export default function MonthView({ currentDate, bookings, onSlotClick, onBookingClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getBookingsForDay = (day: Date) => {
    return bookings.filter(b => isSameDay(new Date(b.startTime), day));
  };

  const handleDayClick = (day: Date) => {
    const start = new Date(day);
    start.setHours(9, 0, 0, 0);
    const end = new Date(day);
    end.setHours(10, 0, 0, 0);
    onSlotClick(start, end);
  };

  return (
    <div className="bc-month-view">
      <div className="bc-month-header">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bc-month-header-cell">{day}</div>
        ))}
      </div>
      <div className="bc-month-grid">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="bc-month-week">
            {week.map(day => {
              const dayBookings = getBookingsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`bc-month-day ${!isCurrentMonth ? 'bc-other-month' : ''} ${isTodayDate ? 'bc-today' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="bc-month-day-number">{format(day, 'd')}</div>
                  <div className="bc-month-day-events">
                    {dayBookings.slice(0, 3).map(booking => (
                      <div
                        key={booking.id}
                        className="bc-month-event"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookingClick(booking);
                        }}
                      >
                        <BookingStatusBadge status={booking.status} size="sm" />
                        <span className="bc-month-event-title">{booking.title}</span>
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="bc-month-event-more">+{dayBookings.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}