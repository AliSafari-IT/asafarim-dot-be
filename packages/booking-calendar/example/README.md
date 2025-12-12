# Booking Calendar Demo App

This is a demo application showcasing the **`@asafarim/booking-calendar`** React component in a realistic, desktop-style booking UI.

It is built with:

- React
- TypeScript
- Vite
- The local `@asafarim/booking-calendar` package (`file:../`)

---

## Desktop Preview

The screenshot below shows the booking calendar as rendered on desktop:

![Booking Calendar Demo – Desktop](./public/booking-calendar.png)

> The image file is located at  
> `packages/booking-calendar/example/public/booking-calendar.png`.

---

## Features Demonstrated

- **Google Calendar–style layout**
  - Familiar grid layout with time slots and days.
  - Clean typography and spacing suitable for SaaS apps.

- **Booking events**
  - Display of existing bookings in the calendar grid.
  - Visual differentiation by booking status:
    - `Pending`
    - `Confirmed`
    - `Completed`
    - `NoShow`
    - `Cancelled`

- **Calendar views**
  - The demo can be configured to use **month**, **week**, or **day** view via the `BookingCalendar` props.

- **Interactive UI**
  - Clicking on events (and, if wired up, empty slots) can trigger handlers in your React code.
  - Designed to integrate with your own backend for create/update/delete/availability flows.

- **Shared styling**
  - Uses the same CSS bundle that ships with `@asafarim/booking-calendar`, so the demo matches what you will see when integrating it into real apps.

---

## Project Structure

Inside `packages/booking-calendar/example`:

- `src/main.tsx`  
  Vite/React entry point that renders the root component.

- `src/App.tsx` (or similar entry component)  
  Hosts the `BookingCalendar` component and demo wiring.

- `public/booking-calendar.png`  
  Desktop screenshot used in this README.

- `index.html`  
  HTML template used by Vite.

- [package.json](cci:7://file:///d:/repos/asafarim-dot-be/packages/booking-calendar/package.json:0:0-0:0)  
  Demo app configuration. Note that it depends on the local library:

  ```json
  "dependencies": {
    "@asafarim/booking-calendar": "file:../",
    "date-fns": "^3.6.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
  ```

---

## Prerequisites

From the **monorepo root** (`d:\repos\asafarim-dot-be`):

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Build the booking-calendar package (so the demo can use its `dist` bundle):

   ```bash
   cd packages/booking-calendar
   pnpm build
   ```

---

## Running the Demo

From `packages/booking-calendar/example`:

### Development mode

```bash
pnpm install
pnpm dev
```

Then open the URL printed by Vite (typically `http://localhost:5173/`).

### Production build

```bash
pnpm build
pnpm preview
```

Then open the preview URL printed by Vite.

---

## How the Demo Uses `@asafarim/booking-calendar`

In the demo’s React code (e.g. `src/App.tsx`), you will typically see something like:

```tsx
import { BookingCalendar } from "@asafarim/booking-calendar";

export function App() {
  // Demo data and/or handlers can be wired here
  return (
    <div style={{ height: "100vh" }}>
      <BookingCalendar
        // bookings={...}           // optional: demo events
        // onCreateBooking={...}    // optional: creation handler
        // onUpdateBooking={...}    // optional: update handler
        // onDeleteBooking={...}    // optional: delete handler
        // onCheckAvailability={...} // optional: availability handler
        initialView="month"
      />
    </div>
  );
}
```

The key idea:

- The **demo focuses on UI** rather than a real backend.
- In your production app (like `freelance-toolkit-ui`), you wire the same props to real API endpoints.

---

## Customization Ideas

You can use this demo as a playground for:

- **Theming and branding**
  - Wrap the calendar in your design system layout.
  - Adjust surrounding typography, background, and spacing.

- **Real data integration**
  - Replace demo events with calls to your API.
  - Implement create/update/delete/availability handlers.

- **UX experiments**
  - Try different default `initialView` values (`"month"`, `"week"`, `"day"`).
  - Experiment with how overlapping bookings are displayed.

---

## License

This demo app is provided as part of the **`@asafarim/booking-calendar`** package and follows the same license as the package itself.
