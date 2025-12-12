// D:\repos\asafarim-dot-be\apps\freelance-toolkit-ui\src\pages\CalendarPage.tsx
import { useState, useEffect } from "react";
import { calendarApi } from "../api";
import { ButtonComponent } from "@asafarim/shared-ui-react";
import { formatDurationHuman } from "../utils/dateUtils";
import EmailPreviewModal from "../components/EmailPreviewModal";
import BookingModal from "../components/BookingModal";
import EditBookingModal from "../components/EditBookingModal";
import UpcomingBookingsList from "../components/UpcomingBookingsList";
import BookingFilterBar from "../components/BookingFilterBar";
import { BookingCalendar } from "@asafarim/booking-calendar";
import type { BookingResponseDto } from "../types";
import "@asafarim/booking-calendar/styles/index.css";
import "../styles/pages/calendar.css";
import "../styles/components/calendar-modal.css";

export default function CalendarPage() {
  const [bookings, setBookings] = useState<BookingResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingResponseDto | null>(null);
  const [editingBooking, setEditingBooking] =
    useState<BookingResponseDto | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [overlappingIds, setOverlappingIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    loadBookings();
  }, [filterStatus]);

  useEffect(() => {
    console.log("selectedBooking: ", selectedBooking);
  }, [selectedBooking]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      console.log(
        "[CalendarPage] loadBookings called, filterStatus =",
        filterStatus
      );
      const response = await calendarApi.getAllBackend(filterStatus);
      console.log("[CalendarPage] Bookings loaded, count =", response.length);
      setBookings(response);
      detectOverlaps(response);
    } catch (err: any) {
      console.error("[CalendarPage] Error loading bookings:", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const detectOverlaps = (bookingList: BookingResponseDto[]) => {
    const overlapping = new Set<string>();

    for (let i = 0; i < bookingList.length; i++) {
      for (let j = i + 1; j < bookingList.length; j++) {
        const booking1 = bookingList[i];
        const booking2 = bookingList[j];

        const start1 = new Date(booking1.startTime).getTime();
        const end1 = new Date(booking1.endTime).getTime();
        const start2 = new Date(booking2.startTime).getTime();
        const end2 = new Date(booking2.endTime).getTime();

        // Check if bookings overlap
        if (start1 < end2 && start2 < end1) {
          overlapping.add(booking1.id);
          overlapping.add(booking2.id);
        }
      }
    }

    setOverlappingIds(overlapping);
  };

  const addNewBooking = () => {
    setShowBookingModal(true);
  };

  const handleSendConfirmation = (booking: BookingResponseDto) => {
    setSelectedBooking(booking);
    setShowEmailModal(true);
  };

  const handleEmailSend = async (_subject: string, _body: string) => {
    if (!selectedBooking) return;
    try {
      await calendarApi.sendConfirmation(selectedBooking.id);
      setShowEmailModal(false);
      setSelectedBooking(null);
      setError(null);
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message || "Failed to send confirmation"
      );
    }
  };

  const handleEdit = (booking: BookingResponseDto) => {
    setEditingBooking(booking);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      await calendarApi.delete(id);
      loadBookings();
    } catch (err) {
      setError("Failed to delete booking");
    }
  };

  // Calendar View Handlers
  const handleCalendarCreate = async (dto: any) => {
    try {
      await calendarApi.create(dto);
      await loadBookings();
    } catch (err: any) {
      console.error("Failed to create booking:", err);
      throw err;
    }
  };

  const handleCalendarUpdate = async (id: string, dto: any) => {
    try {
      await calendarApi.update(id, dto);
      await loadBookings();
    } catch (err: any) {
      console.error("Failed to update booking:", err);
      throw err;
    }
  };

  const handleCalendarDelete = async (id: string) => {
    try {
      await calendarApi.delete(id);
      await loadBookings();
    } catch (err: any) {
      console.error("Failed to delete booking:", err);
      throw err;
    }
  };

  const handleCheckAvailability = async (dto: any) => {
    try {
      const response = await calendarApi.checkAvailability(dto);
      // Convert conflicting bookings from BookingResponseDto to BookingEvent format
      return {
        isAvailable: response.isAvailable,
        conflictingBookings: (response.conflictingBookings || []).map(
          (booking: any) => {
            const validStatuses = [
              "Pending",
              "Confirmed",
              "Completed",
              "NoShow",
              "Cancelled",
            ];
            const status = validStatuses.includes(booking.status)
              ? (booking.status as
                  | "Pending"
                  | "Confirmed"
                  | "Completed"
                  | "NoShow"
                  | "Cancelled")
              : ("Pending" as const);

            return {
              id: booking.id,
              title: booking.title,
              description: booking.description,
              startTime: new Date(booking.startTime),
              endTime: new Date(booking.endTime),
              durationMinutes: booking.durationMinutes,
              status,
              meetingLink: booking.meetingUrl,
              location: booking.location,
              clientName: booking.clientName || "",
              clientEmail: booking.clientEmail || "",
              deliveryStatus:
                (booking.deliveryStatus as
                  | "Pending"
                  | "Sent"
                  | "Failed"
                  | "Retrying") || "Pending",
              retryCount: booking.retryCount || 0,
              createdAt: new Date(booking.createdAt),
              updatedAt: new Date(
                booking.updatedAt || new Date().toISOString()
              ),
            };
          }
        ),
      };
    } catch (err: any) {
      console.error("Failed to check availability:", err);
      throw err;
    }
  };

  // Convert BookingResponseDto to BookingEvent format for calendar
  const convertToCalendarEvents = () => {
    return bookings.map((booking) => {
      // Validate and cast status to BookingStatus type
      const validStatuses = [
        "Pending",
        "Confirmed",
        "Completed",
        "NoShow",
        "Cancelled",
      ];
      const status = validStatuses.includes(booking.status)
        ? (booking.status as
            | "Pending"
            | "Confirmed"
            | "Completed"
            | "NoShow"
            | "Cancelled")
        : ("Pending" as const);

      return {
        id: booking.id,
        title: booking.title,
        description: booking.description,
        startTime: new Date(booking.startTime),
        endTime: new Date(booking.endTime),
        durationMinutes: booking.durationMinutes,
        status,
        meetingLink: booking.meetingUrl,
        location: booking.location,
        clientName: booking.clientName || "",
        clientEmail: booking.clientEmail || "",
        deliveryStatus:
          (booking.deliveryStatus as
            | "Pending"
            | "Sent"
            | "Failed"
            | "Retrying") || "Pending",
        retryCount: booking.retryCount || 0,
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt || new Date().toISOString()),
      };
    });
  };

  const getUpcoming = () => {
    // Show all bookings returned by the backend (already filtered by status)
    // Sort by start time and limit to 10
    return bookings
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
      .slice(0, 10);
  };

  if (loading) return <div className="flt-calendar-loading">Loading...</div>;

  return (
    <div className="flt-calendar-container">
      <div className="flt-calendar-header">
        <h2>Calendar</h2>
        <div className="flt-calendar-header-actions">
          <ButtonComponent
            variant="secondary"
            onClick={() => setShowCalendarView(true)}
          >
            📅 Calendar View
          </ButtonComponent>
          <ButtonComponent variant="primary" onClick={addNewBooking}>
            + New Booking
          </ButtonComponent>
        </div>
      </div>

      {error && <div className="flt-calendar-error">{error}</div>}

      <BookingFilterBar
        filterStatus={filterStatus}
        onChange={setFilterStatus}
      />

      <div className="flt-calendar-upcoming">
        <div className="flt-calendar-upcoming-header">
          <div className="flt-calendar-upcoming-title-section">
            <h3>Bookings</h3>
            {bookings.length > 0 && (
              <span className="flt-calendar-upcoming-count">
                {bookings.length} total
              </span>
            )}
          </div>
        </div>
        <UpcomingBookingsList
          bookings={getUpcoming()}
          overlappingIds={overlappingIds}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSendEmail={handleSendConfirmation}
        />
      </div>

      {selectedBooking && (
        <EmailPreviewModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedBooking(null);
          }}
          onSend={handleEmailSend}
          defaultSubject={`Booking Confirmation: ${selectedBooking.title}`}
          defaultBody={`Dear ${
            selectedBooking.clientName
          },\n\nYour booking has been confirmed.\n\nTitle: ${
            selectedBooking.title
          }\nDate: ${new Date(
            selectedBooking.startTime
          ).toLocaleString()}\nDuration: ${formatDurationHuman(
            selectedBooking.durationMinutes
          )}\n${
            selectedBooking.location
              ? `\nLocation: ${selectedBooking.location}`
              : ""
          }\n${
            selectedBooking.meetingUrl
              ? `\nMeeting URL: ${selectedBooking.meetingUrl}`
              : ""
          }\n\nBest regards,\nFreelance Toolkit`}
          recipientEmail={
            selectedBooking.clientEmail || selectedBooking.clientName || ""
          }
          documentType="Booking"
          documentNumber={selectedBooking.id}
        />
      )}

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingCreated={() => {
          setShowBookingModal(false);
          loadBookings();
        }}
      />

      <EditBookingModal
        isOpen={showEditModal}
        booking={editingBooking}
        onClose={() => {
          setShowEditModal(false);
          setEditingBooking(null);
        }}
        onBookingUpdated={() => {
          setShowEditModal(false);
          setEditingBooking(null);
          loadBookings();
        }}
      />

      {/* Calendar View Modal */}
      {showCalendarView && (
        <div
          className="flt-calendar-modal-overlay"
          onClick={() => setShowCalendarView(false)}
        >
          <div
            className="flt-calendar-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="flt-calendar-modal-close"
              onClick={() => setShowCalendarView(false)}
              aria-label="Close calendar view"
            >
              ✕
            </button>
            <BookingCalendar
              bookings={convertToCalendarEvents()}
              onCreateBooking={handleCalendarCreate}
              onUpdateBooking={handleCalendarUpdate}
              onDeleteBooking={handleCalendarDelete}
              onCheckAvailability={handleCheckAvailability}
              initialView="month"
            />
          </div>
        </div>
      )}
    </div>
  );
}
