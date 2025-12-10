import { useState } from "react";
import { BookingCalendarProps, CalendarView, BookingEvent } from "./types";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";
import BookingModal from "./BookingModal";
import "./styles/calendar.css";

export default function BookingCalendar({
  bookings,
  onCreateBooking,
  onUpdateBooking,
  onDeleteBooking,
  onSendConfirmation,
  initialView = "week",
  initialDate = new Date(),
  className = "",
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setView] = useState<CalendarView>(initialView);
  const [selectedBooking, setSelectedBooking] = useState<BookingEvent | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBookingSlot, setNewBookingSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  const handleSlotClick = (start: Date, end: Date) => {
    setNewBookingSlot({ start, end });
    setSelectedBooking(null);
    setIsModalOpen(true);
  };

  const handleBookingClick = (booking: BookingEvent) => {
    setSelectedBooking(booking);
    setNewBookingSlot(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    setNewBookingSlot(null);
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className={`booking-calendar ${className}`}>
      <div className="booking-calendar-header">
        <div className="booking-calendar-nav">
          <button onClick={handlePrevious} className="nav-btn">
            ←
          </button>
          <button onClick={handleToday} className="nav-btn">
            Today
          </button>
          <button onClick={handleNext} className="nav-btn">
            →
          </button>
          <h2 className="current-date">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
        </div>
        <div className="booking-calendar-view-switcher">
          <button
            onClick={() => setView("month")}
            className={view === "month" ? "active" : ""}
          >
            Month
          </button>
          <button
            onClick={() => setView("week")}
            className={view === "week" ? "active" : ""}
          >
            Week
          </button>
          <button
            onClick={() => setView("day")}
            className={view === "day" ? "active" : ""}
          >
            Day
          </button>
        </div>
      </div>

      <div className="booking-calendar-body">
        {view === "month" && (
          <MonthView
            currentDate={currentDate}
            bookings={bookings}
            onSlotClick={handleSlotClick}
            onBookingClick={handleBookingClick}
          />
        )}
        {view === "week" && (
          <WeekView
            currentDate={currentDate}
            bookings={bookings}
            onSlotClick={handleSlotClick}
            onBookingClick={handleBookingClick}
          />
        )}
        {view === "day" && (
          <DayView
            currentDate={currentDate}
            bookings={bookings}
            onSlotClick={handleSlotClick}
            onBookingClick={handleBookingClick}
          />
        )}
      </div>

      {isModalOpen && (
        <BookingModal
          booking={selectedBooking}
          initialSlot={newBookingSlot}
          onClose={handleCloseModal}
          onCreate={onCreateBooking}
          onUpdate={onUpdateBooking}
          onDelete={onDeleteBooking}
          onSendConfirmation={onSendConfirmation}
        />
      )}
    </div>
  );
}
