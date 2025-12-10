// packages/booking-calendar/src/BookingModal.tsx
import { useState, useEffect } from "react";
import { BookingEvent, BookingStatus } from "./types";
import BookingStatusBadge from "./BookingStatusBadge";

interface BookingModalProps {
  booking: BookingEvent | null;
  initialSlot: { start: Date; end: Date } | null;
  onClose: () => void;
  onCreate?: (dto: any) => Promise<void>;
  onUpdate?: (id: string, dto: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onSendConfirmation?: (id: string) => Promise<void>;
}

export default function BookingModal({
  booking,
  initialSlot,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  onSendConfirmation,
}: BookingModalProps) {
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [meetingReason, setMeetingReason] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<BookingStatus>("Pending");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (booking) {
      setTitle(booking.title);
      setClientName(booking.clientName);
      setClientEmail(booking.clientEmail);
      setClientPhone(booking.clientPhone || "");
      setMeetingReason(booking.meetingReason || "");
      setStartTime(formatDateTimeLocal(new Date(booking.startTime)));
      setEndTime(formatDateTimeLocal(new Date(booking.endTime)));
      setLocation(booking.location || "");
      setDescription(booking.description || "");
      setStatus(booking.status);
    } else if (initialSlot) {
      setStartTime(formatDateTimeLocal(initialSlot.start));
      setEndTime(formatDateTimeLocal(initialSlot.end));
    }
  }, [booking, initialSlot]);

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!clientName.trim()) newErrors.clientName = "Client name is required";
    if (!clientEmail.trim()) newErrors.clientEmail = "Client email is required";
    if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      newErrors.clientEmail = "Invalid email format";
    }
    if (!startTime) newErrors.startTime = "Start time is required";
    if (!endTime) newErrors.endTime = "End time is required";
    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      newErrors.endTime = "End time must be after start time";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const dto = {
        title,
        clientName,
        clientEmail,
        clientPhone: clientPhone || undefined,
        meetingReason: meetingReason || undefined,
        startTime,
        endTime,
        location: location || undefined,
        description: description || undefined,
        status,
      };

      if (booking && onUpdate) {
        await onUpdate(booking.id, dto);
      } else if (onCreate) {
        await onCreate(dto);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!booking || !onDelete) return;
    if (!confirm("Are you sure you want to delete this booking?")) return;

    setIsSubmitting(true);
    try {
      await onDelete(booking.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendConfirmation = async () => {
    if (!booking || !onSendConfirmation) return;
    setIsSubmitting(true);
    try {
      await onSendConfirmation(booking.id);
    } catch (error) {
      console.error("Failed to send confirmation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bc-modal-overlay" onClick={onClose}>
      <div className="bc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bc-modal-header">
          <h2>{booking ? "Edit Booking" : "Create Booking"}</h2>
          <button className="bc-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form className="bc-modal-body" onSubmit={handleSubmit}>
          <div className="bc-form-group">
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? "bc-input-error" : ""}
            />
            {errors.title && (
              <span className="bc-error-text">{errors.title}</span>
            )}
          </div>

          <div className="bc-form-row">
            <div className="bc-form-group">
              <label>Client Name *</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className={errors.clientName ? "bc-input-error" : ""}
              />
              {errors.clientName && (
                <span className="bc-error-text">{errors.clientName}</span>
              )}
            </div>
            <div className="bc-form-group">
              <label>Client Email *</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className={errors.clientEmail ? "bc-input-error" : ""}
              />
              {errors.clientEmail && (
                <span className="bc-error-text">{errors.clientEmail}</span>
              )}
            </div>
          </div>

          <div className="bc-form-row">
            <div className="bc-form-group">
              <label>Client Phone</label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>
            <div className="bc-form-group">
              <label>Meeting Reason</label>
              <input
                type="text"
                value={meetingReason}
                onChange={(e) => setMeetingReason(e.target.value)}
              />
            </div>
          </div>

          <div className="bc-form-row">
            <div className="bc-form-group">
              <label>Start Time *</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={errors.startTime ? "bc-input-error" : ""}
              />
              {errors.startTime && (
                <span className="bc-error-text">{errors.startTime}</span>
              )}
            </div>
            <div className="bc-form-group">
              <label>End Time *</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={errors.endTime ? "bc-input-error" : ""}
              />
              {errors.endTime && (
                <span className="bc-error-text">{errors.endTime}</span>
              )}
            </div>
          </div>

          <div className="bc-form-group">
            <label>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Office, Zoom, etc."
            />
          </div>

          <div className="bc-form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {booking && (
            <div className="bc-form-group">
              <label>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookingStatus)}
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
                <option value="NoShow">No Show</option>
              </select>
              <BookingStatusBadge status={status} size="sm" />
            </div>
          )}

          <div className="bc-modal-footer">
            <div className="bc-modal-actions-left">
              {booking && onDelete && (
                <button
                  type="button"
                  className="bc-btn bc-btn-danger"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  Delete
                </button>
              )}
              {booking && onSendConfirmation && (
                <button
                  type="button"
                  className="bc-btn bc-btn-secondary"
                  onClick={handleSendConfirmation}
                  disabled={isSubmitting}
                >
                  Send Confirmation
                </button>
              )}
            </div>
            <div className="bc-modal-actions-right">
              <button
                type="button"
                className="bc-btn bc-btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bc-btn bc-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : booking ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
