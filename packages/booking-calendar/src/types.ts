export type BookingStatus = "Pending" | "Confirmed" | "Cancelled" | "Completed" | "NoShow";
export type DeliveryStatus = "Pending" | "Sent" | "Failed" | "Retrying";

export interface BookingEvent {
    id: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    durationMinutes: number;
    status: BookingStatus;
    meetingLink?: string;
    location?: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    meetingReason?: string;
    cancellationReason?: string;
    reminderSentAt?: Date;
    deliveryStatus?: DeliveryStatus;
    lastAttemptAt?: Date;
    retryCount: number;
    createdAt: Date;
    updatedAt: Date;
    clientId?: string;
}

export interface CreateBookingDto {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
    meetingLink?: string;
    clientId?: string;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    meetingReason?: string;
}

export interface UpdateBookingDto {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    meetingLink?: string;
    status?: BookingStatus;
    clientPhone?: string;
    meetingReason?: string;
    cancellationReason?: string;
}

export interface RescheduleBookingDto {
    newStartTime: string;
    newEndTime: string;
}

export interface AvailabilityRequest {
    startTime: string;
    endTime: string;
    excludeBookingId?: string;
}

export interface AvailabilityResponse {
    isAvailable: boolean;
    conflictingBookings: BookingEvent[];
}

export type CalendarView = "month" | "week" | "day";

export interface BookingCalendarProps {
    bookings: BookingEvent[];
    onCreateBooking?: (booking: CreateBookingDto) => Promise<void>;
    onUpdateBooking?: (id: string, booking: UpdateBookingDto) => Promise<void>;
    onDeleteBooking?: (id: string) => Promise<void>;
    onRescheduleBooking?: (id: string, dto: RescheduleBookingDto) => Promise<void>;
    onCheckAvailability?: (dto: AvailabilityRequest) => Promise<AvailabilityResponse>;
    onSendConfirmation?: (id: string) => Promise<void>;
    initialView?: CalendarView;
    initialDate?: Date;
    className?: string;
}
