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
import type { BookingResponseDto } from "../types";
import "../styles/pages/calendar.css";

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

  const handleEmailSend = async (subject: string, body: string) => {
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
        <ButtonComponent variant="primary" onClick={addNewBooking}>
          + New Booking
        </ButtonComponent>
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
    </div>
  );
}
