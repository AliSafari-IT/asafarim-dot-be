import { apiClient } from './client';
import type {
    CreateBookingDto,
    UpdateBookingDto,
    BookingResponseDto,
    RescheduleRequest,
    AvailabilityRequest,
    AvailabilityResponse
} from '../types';
import type {
    BookingEvent,
    CreateBookingDto as LibCreateBookingDto,
    UpdateBookingDto as LibUpdateBookingDto
} from '@asafarim/booking-calendar';

/**
 * Transform backend BookingResponseDto to library BookingEvent
 */
const mapToBookingEvent = (dto: BookingResponseDto): BookingEvent => ({
    id: dto.id,
    title: dto.title,
    description: dto.description,
    startTime: new Date(dto.startTime),
    endTime: new Date(dto.endTime),
    durationMinutes: dto.durationMinutes,
    status: dto.status as BookingEvent['status'],
    meetingLink: dto.meetingUrl,
    location: dto.location,
    clientName: dto.clientName || 'Unknown Client',
    clientEmail: dto.clientEmail || '',
    clientPhone: undefined,
    meetingReason: dto.notes,
    cancellationReason: undefined,
    reminderSentAt: undefined,
    deliveryStatus: dto.deliveryStatus as BookingEvent['deliveryStatus'],
    lastAttemptAt: dto.lastAttemptAt ? new Date(dto.lastAttemptAt) : undefined,
    retryCount: dto.retryCount || 0,
    createdAt: new Date(dto.createdAt),
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(dto.createdAt),
    clientId: dto.clientId
});

/**
 * Transform library CreateBookingDto to backend CreateBookingDto
 */
const mapToBackendCreate = (dto: LibCreateBookingDto): CreateBookingDto => ({
    clientId: dto.clientId,
    title: dto.title,
    description: dto.description,
    startTime: dto.startTime,
    endTime: dto.endTime,
    location: dto.location,
    meetingUrl: dto.meetingLink,
    notes: dto.meetingReason
});

/**
 * Transform library UpdateBookingDto to backend UpdateBookingDto
 */
const mapToBackendUpdate = (dto: LibUpdateBookingDto, existingBooking?: BookingEvent): UpdateBookingDto => ({
    clientId: existingBooking?.clientId,
    title: dto.title || existingBooking?.title || '',
    description: dto.description ?? existingBooking?.description,
    startTime: dto.startTime || existingBooking?.startTime.toISOString() || '',
    endTime: dto.endTime || existingBooking?.endTime.toISOString() || '',
    location: dto.location ?? existingBooking?.location,
    meetingUrl: dto.meetingLink ?? existingBooking?.meetingLink,
    status: dto.status || existingBooking?.status || 'Pending',
    notes: dto.meetingReason || dto.cancellationReason || existingBooking?.meetingReason
});

export const calendarApi = {
    /**
     * Get all bookings (backend format - raw DTOs) with status filter
     */
    getAllBackend: async (status: string = "All"): Promise<BookingResponseDto[]> => {
        console.log("[calendarApi] getAllBackend called with status =", status);
        const response = await apiClient.get<BookingResponseDto[]>('/calendar/bookings', {
            params: { status },
            headers: { "Cache-Control": "no-cache" }
        });
        console.log("[calendarApi] Response received, count =", response.data.length);
        return response.data;
    },

    /**
     * Get all bookings with optional date range and client filters (library format)
     */
    getAll: async (
        startDate?: string,
        endDate?: string,
        clientId?: string
    ): Promise<BookingEvent[]> => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (clientId) params.append('clientId', clientId);

        const response = await apiClient.get<BookingResponseDto[]>(
            `/calendar/bookings${params.toString() ? `?${params.toString()}` : ''}`
        );
        return response.data.map(mapToBookingEvent);
    },

    /**
     * Get upcoming bookings
     */
    getUpcoming: async (count: number = 5): Promise<BookingResponseDto[]> => {
        const response = await apiClient.get<BookingResponseDto[]>(
            `/calendar/bookings/upcoming?count=${count}`
        );
        return response.data;
    },

    /**
     * Get a booking by ID
     */
    getById: async (id: string): Promise<BookingResponseDto> => {
        const response = await apiClient.get<BookingResponseDto>(`/calendar/bookings/${id}`);
        return response.data;
    },

    /**
     * Create a new booking
     */
    create: async (data: CreateBookingDto): Promise<BookingResponseDto> => {
        const response = await apiClient.post<BookingResponseDto>('/calendar/bookings', data);
        return response.data;
    },

    /**
     * Update an existing booking
     */
    update: async (id: string, data: UpdateBookingDto): Promise<BookingResponseDto> => {
        const response = await apiClient.put<BookingResponseDto>(`/calendar/bookings/${id}`, data);
        return response.data;
    },

    /**
     * Delete a booking
     */
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/calendar/bookings/${id}`);
    },

    /**
     * Reschedule a booking
     */
    reschedule: async (id: string, data: RescheduleRequest): Promise<BookingResponseDto> => {
        const response = await apiClient.post<BookingResponseDto>(
            `/calendar/bookings/${id}/reschedule`,
            data
        );
        return response.data;
    },

    /**
     * Cancel a booking
     */
    cancel: async (id: string): Promise<BookingResponseDto> => {
        const response = await apiClient.post<BookingResponseDto>(`/calendar/bookings/${id}/cancel`);
        return response.data;
    },

    /**
     * Mark a booking as completed
     */
    complete: async (id: string): Promise<BookingResponseDto> => {
        const response = await apiClient.post<BookingResponseDto>(`/calendar/bookings/${id}/complete`);
        return response.data;
    },

    /**
     * Check time slot availability
     */
    checkAvailability: async (data: AvailabilityRequest): Promise<AvailabilityResponse> => {
        const response = await apiClient.post<AvailabilityResponse>(
            '/calendar/bookings/check-availability',
            data
        );
        return response.data;
    },

    /**
     * Send confirmation email for a booking
     */
    sendConfirmation: async (id: string, customSubject?: string, customBody?: string): Promise<BookingResponseDto> => {
        const payload = customSubject && customBody ? { customSubject, customBody } : {};
        const response = await apiClient.post<BookingResponseDto>(
            `/calendar/bookings/${id}/send-confirmation`,
            payload
        );
        return response.data;
    },

    /**
     * Send reminder email for a booking
     */
    sendReminder: async (id: string): Promise<BookingResponseDto> => {
        const response = await apiClient.post<BookingResponseDto>(`/calendar/bookings/${id}/send-reminder`);
        return response.data;
    },

    // Library-facing methods that work with BookingEvent types

    /**
     * Create a new booking (library version)
     */
    createBooking: async (dto: LibCreateBookingDto): Promise<BookingEvent> => {
        console.log('📥 Received booking DTO from library:', dto);
        const backendDto = mapToBackendCreate(dto);
        console.log('📤 Sending to backend:', JSON.stringify(backendDto, null, 2));
        try {
            const response = await apiClient.post<BookingResponseDto>('/calendar/bookings', backendDto);
            console.log('✅ Booking created successfully:', response.data);
            return mapToBookingEvent(response.data);
        } catch (error: any) {
            console.error('❌ Backend error response:', error.response?.data);
            console.error('❌ Request that failed:', backendDto);
            throw error;
        }
    },

    /**
     * Update an existing booking (library version)
     */
    updateBooking: async (id: string, dto: LibUpdateBookingDto): Promise<BookingEvent> => {
        const backendDto = mapToBackendUpdate(dto);
        const response = await apiClient.put<BookingResponseDto>(`/calendar/bookings/${id}`, backendDto);
        return mapToBookingEvent(response.data);
    },

    /**
     * Reschedule a booking (library version)
     */
    rescheduleBooking: async (id: string, newStartTime: string, newEndTime: string): Promise<BookingEvent> => {
        const response = await apiClient.post<BookingResponseDto>(
            `/calendar/bookings/${id}/reschedule`,
            { newStartTime, newEndTime }
        );
        return mapToBookingEvent(response.data);
    },

    /**
     * Delete a booking (library version)
     */
    deleteBooking: async (id: string): Promise<void> => {
        await apiClient.delete(`/calendar/bookings/${id}`);
    },

    /**
     * Check availability (library version)
     */
    checkAvailabilityLib: async (startTime: string, endTime: string, excludeId?: string): Promise<{ isAvailable: boolean; conflictingBookings: BookingEvent[] }> => {
        const response = await apiClient.post<AvailabilityResponse>(
            '/calendar/bookings/check-availability',
            { startTime, endTime, excludeBookingId: excludeId }
        );
        return {
            isAvailable: response.data.isAvailable,
            conflictingBookings: []
        };
    },

    /**
     * Get upcoming bookings for dashboard
     */
    getDashboardUpcoming: async (limit: number = 5): Promise<BookingResponseDto[]> => {
        const response = await apiClient.get<BookingResponseDto[]>('/calendar/dashboard/upcoming-bookings', {
            params: { limit }
        });
        return response.data;
    }
};
