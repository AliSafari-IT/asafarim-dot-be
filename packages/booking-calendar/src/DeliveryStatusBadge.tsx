// packages/booking-calendar/src/DeliveryStatusBadge.tsx
import { DeliveryStatus } from "./types";

interface DeliveryStatusBadgeProps {
  status: DeliveryStatus;
  size?: "xs" | "sm" | "md";
}

export default function DeliveryStatusBadge({
  status,
  size = "md",
}: DeliveryStatusBadgeProps) {
  return (
    <span
      className={`bc-delivery-badge bc-delivery-${status.toLowerCase()} bc-badge-${size}`}
    >
      {status}
    </span>
  );
}
