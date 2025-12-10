// D:\repos\asafarim-dot-be\apps\freelance-toolkit-ui\src\components\BookingModal.tsx
import { useState, useEffect } from "react";
import { calendarApi, clientsApi } from "../api";
import { ButtonComponent } from "@asafarim/shared-ui-react";
import type { CreateBookingDto, ClientResponseDto } from "../types";
import "../styles/components/booking-modal.css";

export default function BookingModal({
  isOpen,
  onClose,
  onBookingCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: () => void;
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

  // Load clients when modal opens
  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  const loadClients = async () => {
    try {
      const data = await clientsApi.getAll();
      setClients(data);
    } catch (err) {
      setError("Failed to load clients");
    }
  };

  const checkOverlap = async () => {
    if (!startTime || !endTime) return;

    try {
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      const result = await calendarApi.checkAvailability({
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
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

    if (!title || !startTime || !endTime) {
      setError("Please fill in all required fields");
      return;
    }

    // Convert datetime-local strings to ISO 8601 format
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    const dto: CreateBookingDto = {
      clientId: clientId || undefined,
      title,
      description,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      location,
      meetingUrl,
    };

    try {
      setLoading(true);
      setError(null);
      const newBooking = await calendarApi.create(dto);
      onBookingCreated();
      handleClose();

      // Ask user if they want to send confirmation email
      if (newBooking.clientEmail) {
        const shouldSend = window.confirm(
          `Booking created successfully!\n\nWould you like to send a confirmation email to ${newBooking.clientEmail}?`
        );

        if (shouldSend) {
          try {
            await calendarApi.sendConfirmation(newBooking.id);
            alert("Confirmation email sent successfully!");
          } catch (emailErr) {
            alert(
              "Failed to send confirmation email. You can send it later from the calendar."
            );
          }
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setClientId("");
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setMeetingUrl("");
    setError(null);
    setWarning(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="flt-booking-modal-backdrop">
      <div className="flt-booking-modal">
        <div className="flt-booking-modal-header">
          <h3>New Booking</h3>
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
              {loading ? "Creating..." : "Create Booking"}
            </ButtonComponent>
          </div>
        </form>
      </div>
    </div>
  );
}
