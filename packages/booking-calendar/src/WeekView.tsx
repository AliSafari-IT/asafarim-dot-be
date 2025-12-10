// packages/booking-calendar/src/WeekView.tsx
import { BookingEvent } from "./types";
import {
  format,
  startOfWeek,
  addDays,
  addMinutes,
  isToday,
  isSameDay,
} from "date-fns";
import { useEventLayout } from "./hooks/useEventLayout";
import BookingStatusBadge from "./BookingStatusBadge";

interface WeekViewProps {
  currentDate: Date;
  bookings: BookingEvent[];
  onSlotClick: (start: Date, end: Date) => void;
  onBookingClick: (booking: BookingEvent) => void;
}

export default function WeekView({
  currentDate,
  bookings,
  onSlotClick,
  onBookingClick,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const now = new Date();
  const isCurrentWeek = days.some((day) => isSameDay(day, now));
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const nowPosition = ((currentHour * 60 + currentMinute) / (24 * 60)) * 100;

  const { getEventPosition } = useEventLayout();

  const handleSlotClick = (day: Date, hour: number) => {
    const start = new Date(day);
    start.setHours(hour, 0, 0, 0);
    const end = addMinutes(start, 60);
    onSlotClick(start, end);
  };

  return (
    <div className="bc-week-view">
      <div className="bc-week-header">
        <div className="bc-week-time-gutter"></div>
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={`bc-week-day-header ${isToday(day) ? "bc-today" : ""}`}
          >
            <div className="bc-week-day-name">{format(day, "EEE")}</div>
            <div className="bc-week-day-date">{format(day, "d")}</div>
          </div>
        ))}
      </div>
      <div className="bc-week-body">
        <div className="bc-week-time-column">
          {hours.map((hour) => (
            <div key={hour} className="bc-week-time-slot">
              {format(new Date().setHours(hour, 0), "ha")}
            </div>
          ))}
        </div>
        <div className="bc-week-grid-container">
          {isCurrentWeek && isSameDay(days[now.getDay()], now) && (
            <div
              className="bc-week-now-line"
              style={{ top: `${nowPosition}%` }}
            >
              <div className="bc-week-now-dot"></div>
            </div>
          )}
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={`bc-week-day-column ${isToday(day) ? "bc-today" : ""}`}
            >
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="bc-week-grid-slot"
                  onClick={() => handleSlotClick(day, hour)}
                />
              ))}
              {bookings
                .filter((b) => isSameDay(new Date(b.startTime), day))
                .map((booking) => {
                  const pos = getEventPosition(booking, day);
                  return (
                    <div
                      key={booking.id}
                      className="bc-week-event"
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
                      <BookingStatusBadge status={booking.status} size="xs" />
                      <div className="bc-week-event-title">{booking.title}</div>
                      <div className="bc-week-event-time">
                        {format(new Date(booking.startTime), "h:mm a")}
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
