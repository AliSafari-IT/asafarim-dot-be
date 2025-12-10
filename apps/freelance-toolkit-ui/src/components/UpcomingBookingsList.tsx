// D:\repos\asafarim-dot-be\apps\freelance-toolkit-ui\src\components\UpcomingBookingsList.tsx
import { BookingResponseDto } from "../types";
import { formatDurationCompact } from "../utils/dateUtils";
import "../styles/components/upcoming-bookings.css";

interface UpcomingBookingsListProps {
  bookings: BookingResponseDto[];
  overlappingIds: Set<string>;
  onEdit: (booking: BookingResponseDto) => void;
  onDelete: (id: string) => void;
  onSendEmail: (booking: BookingResponseDto) => void;
}

export default function UpcomingBookingsList({
  bookings,
  overlappingIds,
  onEdit,
  onDelete,
  onSendEmail,
}: UpcomingBookingsListProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "status-confirmed";
      case "Completed":
        return "status-completed";
      case "Cancelled":
        return "status-cancelled";
      case "NoShow":
        return "status-noshow";
      default:
        return "status-pending";
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="flt-upcoming-empty">
        <p>No upcoming bookings</p>
      </div>
    );
  }

  return (
    <div className="flt-upcoming-container">
      {bookings.map((booking) => {
        const isOverlapping = overlappingIds.has(booking.id);

        return (
          <div
            key={booking.id}
            className={`flt-upcoming-card ${getStatusColor(booking.status)} ${
              isOverlapping ? "flt-upcoming-overlapping" : ""
            }`}
          >
            {isOverlapping && (
              <div className="flt-upcoming-overlap-badge">⚠️ Overlapping</div>
            )}

            {booking.status === "NoShow" && (
              <div className="flt-upcoming-noshow-badge">NO SHOW</div>
            )}

            <div className="flt-upcoming-header">
              <div className="flt-upcoming-title-section">
                <h4 className="flt-upcoming-title">{booking.title}</h4>
                <span
                  className={`flt-upcoming-status ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>
            </div>

            <div className="flt-upcoming-content">
              <div className="flt-upcoming-meta">
                <div className="flt-upcoming-meta-item">
                  <span className="flt-upcoming-label">Client:</span>
                  <span className="flt-upcoming-value">
                    {booking.clientName || "No client"}
                  </span>
                </div>

                <div className="flt-upcoming-meta-item">
                  <span className="flt-upcoming-label">Date & Time:</span>
                  <span className="flt-upcoming-value">
                    {formatTime(booking.startTime)}
                  </span>
                </div>

                <div className="flt-upcoming-meta-item">
                  <span className="flt-upcoming-label">Duration:</span>
                  <span className="flt-upcoming-value">
                    {formatDurationCompact(booking.durationMinutes)}
                  </span>
                </div>

                {booking.location && (
                  <div className="flt-upcoming-meta-item">
                    <span className="flt-upcoming-label">📍 Location:</span>
                    <span className="flt-upcoming-value">
                      {booking.location}
                    </span>
                  </div>
                )}

                {booking.meetingUrl && (
                  <div className="flt-upcoming-meta-item">
                    <span className="flt-upcoming-label">🔗 Meeting:</span>
                    <a
                      href={booking.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flt-upcoming-link"
                    >
                      Join
                    </a>
                  </div>
                )}

                {booking.description && (
                  <div className="flt-upcoming-meta-item flt-upcoming-description">
                    <span className="flt-upcoming-label">Description:</span>
                    <span className="flt-upcoming-value">
                      {booking.description}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flt-upcoming-actions">
              <button
                className="flt-upcoming-action flt-upcoming-action-edit"
                onClick={() => onEdit(booking)}
                title="Edit booking"
              >
                ✏️ Edit
              </button>
              <button
                className="flt-upcoming-action flt-upcoming-action-email"
                onClick={() => onSendEmail(booking)}
                title="Send confirmation email"
              >
                📧 Email
              </button>
              <button
                className="flt-upcoming-action flt-upcoming-action-delete"
                onClick={() => onDelete(booking.id)}
                title="Delete booking"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
