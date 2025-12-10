import "../styles/components/booking-filter.css";

interface BookingFilterBarProps {
  filterStatus: string;
  onChange: (newStatus: string) => void;
}

const STATUS_OPTIONS = [
  { value: "All", label: "All Bookings" },
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Completed", label: "Completed" },
  { value: "NoShow", label: "No Show" },
  { value: "Cancelled", label: "Cancelled" },
];

export default function BookingFilterBar({
  filterStatus,
  onChange,
}: BookingFilterBarProps) {
  return (
    <div className="flt-booking-filter-bar">
      <label
        htmlFor="booking-status-filter"
        className="flt-booking-filter-label"
      >
        Filter Bookings
      </label>
      <select
        id="booking-status-filter"
        className="flt-booking-filter-select"
        value={filterStatus}
        onChange={(e) => onChange(e.target.value)}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
