// D:\repos\asafarim-dot-be\apps\freelance-toolkit-ui\src\components\EditBookingModal.tsx
import { useState, useEffect } from "react";
import { calendarApi, clientsApi } from "../api";
import { ButtonComponent } from "@asafarim/shared-ui-react";
import type {
  BookingResponseDto,
  UpdateBookingDto,
  ClientResponseDto,
} from "../types";
import "../styles/components/booking-modal.css";

export default function EditBookingModal({
  isOpen,
  booking,
  onClose,
  onBookingUpdated,
}: {
  isOpen: boolean;
  booking: BookingResponseDto | null;
  onClose: () => void;
  onBookingUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientResponseDto[]>([]);

  // Form fields
  const [clientId, setClientId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [status, setStatus] = useState("");

  // Load clients and populate form when modal opens
  useEffect(() => {
    if (isOpen && booking) {
      loadClients();
      populateForm();
    }
  }, [isOpen, booking]);

  const loadClients = async () => {
    try {
      const data = await clientsApi.getAll();
      setClients(data);
    } catch (err) {
      setError("Failed to load clients");
    }
  };

  const populateForm = () => {
    if (!booking) return;
    setClientId(booking.clientId || "");
    setTitle(booking.title);
    setDescription(booking.description || "");
    setStartTime(new Date(booking.startTime).toISOString().slice(0, 16));
    setEndTime(new Date(booking.endTime).toISOString().slice(0, 16));
    setLocation(booking.location || "");
    setMeetingUrl(booking.meetingUrl || "");
    setStatus(booking.status);
    setError(null);
    setWarning(null);
  };

  const checkOverlap = async () => {
    if (!startTime || !endTime || !booking) return;

    try {
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      const result = await calendarApi.checkAvailability({
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        excludeBookingId: booking.id,
      });

      if (!result.isAvailable) {
        setWarning("This time slot overlaps with an existing booking");
      } else {
        setWarning(null);
      }
    } catch (err) {
      // Ignore overlap check errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !startTime || !endTime || !booking) {
      setError("Please fill in all required fields");
      return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    const dto: UpdateBookingDto = {
      clientId: clientId || undefined,
      title,
      description,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      location,
      meetingUrl,
      status,
    };

    try {
      setLoading(true);
      setError(null);
      await calendarApi.update(booking.id, dto);
      onBookingUpdated();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setClientId("");
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setMeetingUrl("");
    setStatus("");
    setError(null);
    setWarning(null);
    onClose();
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="flt-booking-modal-backdrop">
      <div className="flt-booking-modal">
        <div className="flt-booking-modal-header">
          <h3>Edit Booking</h3>
          <button onClick={handleClose} className="flt-booking-modal-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flt-booking-modal-form">
          {error && <div className="flt-booking-modal-error">{error}</div>}
          {warning && (
            <div className="flt-booking-modal-warning">{warning}</div>
          )}

          <div className="flt-booking-modal-field">
            <label>Client (optional)</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">Select client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flt-booking-modal-field">
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flt-booking-modal-field">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flt-booking-modal-row">
            <div className="flt-booking-modal-field">
              <label>Start Time *</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setTimeout(checkOverlap, 300);
                }}
                required
              />
            </div>

            <div className="flt-booking-modal-field">
              <label>End Time *</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setTimeout(checkOverlap, 300);
                }}
                required
              />
            </div>
          </div>

          <div className="flt-booking-modal-field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="NoShow">No Show</option>
            </select>
          </div>

          <div className="flt-booking-modal-field">
            <label>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Physical location"
            />
          </div>

          <div className="flt-booking-modal-field">
            <label>Meeting URL</label>
            <input
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="Virtual meeting link"
            />
          </div>

          <div className="flt-booking-modal-actions">
            <ButtonComponent
              variant="ghost"
              onClick={handleClose}
              type="button"
            >
              Cancel
            </ButtonComponent>
            <ButtonComponent variant="brand" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Booking"}
            </ButtonComponent>
          </div>
        </form>
      </div>
    </div>
  );
}
