import { apiClient } from './client';
import type {
    CreateBookingDto,
    UpdateBookingDto,
    BookingResponseDto,
    RescheduleRequest,
    AvailabilityRequest,
    AvailabilityResponse
} from '../types';

export const calendarApi = {
    /**
     * Get all bookings with optional date range and client filters
     */
    getAll: async (
        startDate?: string,
        endDate?: string,
        clientId?: string
    ): Promise<BookingResponseDto[]> => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (clientId) params.append('clientId', clientId);

        const response = await apiClient.get<BookingResponseDto[]>(
            `/calendar/bookings${params.toString() ? `?${params.toString()}` : ''}`
        );
        return response.data;
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
    }
};
