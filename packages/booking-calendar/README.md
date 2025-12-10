# @asafarim/booking-calendar

Google Calendar-style booking UI for FreelanceToolkit.Api

## Installation

```bash
npm install @asafarim/booking-calendar
# or
pnpm add @asafarim/booking-calendar
```

## Quick Start

```tsx
import { BookingCalendar } from '@asafarim/booking-calendar';
import '@asafarim/booking-calendar/styles';

function App() {
  const [bookings, setBookings] = useState([]);

  const handleCreate = async (dto) => {
    const response = await fetch('/api/calendar/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    const newBooking = await response.json();
    setBookings([...bookings, newBooking]);
  };

  return (
    <BookingCalendar
      bookings={bookings}
      onCreateBooking={handleCreate}
      initialView="week"
    />
  );
}
```

## Features

- ✅ Month/Week/Day views
- ✅ Click empty slot to create booking
- ✅ Click booking to edit
- ✅ Drag to move bookings
- ✅ Drag resize bookings
- ✅ Status badges (Pending, Confirmed, etc.)
- ✅ Delivery status indicators
- ✅ Availability checking
- ✅ Client details display
- ✅ Responsive design

## API Integration

The component expects these FreelanceToolkit.Api endpoints:

```
GET    /api/calendar/bookings
POST   /api/calendar/bookings
PUT    /api/calendar/bookings/{id}
DELETE /api/calendar/bookings/{id}
POST   /api/calendar/bookings/check-availability
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `bookings` | `BookingEvent[]` | Yes | Array of bookings |
| `onCreateBooking` | `(dto) => Promise<void>` | No | Create handler |
| `onUpdateBooking` | `(id, dto) => Promise<void>` | No | Update handler |
| `onDeleteBooking` | `(id) => Promise<void>` | No | Delete handler |
| `onCheckAvailability` | `(dto) => Promise<AvailabilityResponse>` | No | Availability check |
| `initialView` | `'month' \| 'week' \| 'day'` | No | Default: 'week' |
| `initialDate` | `Date` | No | Default: today |

## Booking Type

```typescript
interface BookingEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed" | "NoShow";
  meetingLink?: string;
  location?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  deliveryStatus?: "Pending" | "Sent" | "Failed" | "Retrying";
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Styling

Override CSS variables:

```css
.booking-calendar {
  --calendar-bg: #ffffff;
  --calendar-border: #e5e7eb;
  --event-pending: #fbbf24;
  --event-confirmed: #10b981;
  --event-cancelled: #ef4444;
  --event-completed: #3b82f6;
}
```

## Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build package
pnpm build

# Publish
npm publish --access public
```

## License

MIT © ASafariM
