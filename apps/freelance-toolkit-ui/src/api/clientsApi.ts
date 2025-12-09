// apps/freelance-toolkit-ui/src/api/clientsApi.ts
import { apiClient } from './client';
import type { CreateClientDto, UpdateClientDto, ClientResponseDto } from '../types';

export const clientsApi = {
    /**
     * Get all clients with optional search and tag filters
     */
    getAll: async (search?: string, tags?: string[]): Promise<ClientResponseDto[]> => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (tags && tags.length > 0) {
            tags.forEach(tag => params.append('tags', tag));
        }

        const response = await apiClient.get<ClientResponseDto[]>(
            `/clients${params.toString() ? `?${params.toString()}` : ''}`
        );
        return response.data;
    },

    /**
     * Get a client by ID
     */
    getById: async (id: string): Promise<ClientResponseDto> => {
        const response = await apiClient.get<ClientResponseDto>(`/clients/${id}`);
        return response.data;
    },

    /**
     * Create a new client
     */
    create: async (data: CreateClientDto): Promise<ClientResponseDto> => {
        const response = await apiClient.post<ClientResponseDto>('/clients', data);
        return response.data;
    },

    /**
     * Update an existing client
     */
    update: async (id: string, data: UpdateClientDto): Promise<ClientResponseDto> => {
        const response = await apiClient.put<ClientResponseDto>(`/clients/${id}`, data);
        return response.data;
    },

    /**
     * Delete a client
     */
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/clients/${id}`);
    }
};
