// apps/freelance-toolkit-ui/src/api/invoicesApi.ts
import { apiClient } from './client';
import type { CreateInvoiceDto, UpdateInvoiceDto, InvoiceResponseDto } from '../types';

export const invoicesApi = {
    /**
     * Get all invoices with optional filters
     */
    getAll: async (status?: string, clientId?: string): Promise<InvoiceResponseDto[]> => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (clientId) params.append('clientId', clientId);

        const response = await apiClient.get<InvoiceResponseDto[]>(
            `/invoices${params.toString() ? `?${params.toString()}` : ''}`
        );
        return response.data;
    },

    /**
     * Get an invoice by ID
     */
    getById: async (id: string): Promise<InvoiceResponseDto> => {
        const response = await apiClient.get<InvoiceResponseDto>(`/invoices/${id}`);
        return response.data;
    },

    /**
     * Create a new invoice
     */
    create: async (data: CreateInvoiceDto): Promise<InvoiceResponseDto> => {
        const response = await apiClient.post<InvoiceResponseDto>('/invoices', data);
        return response.data;
    },

    /**
     * Update an existing invoice
     */
    update: async (id: string, data: UpdateInvoiceDto): Promise<InvoiceResponseDto> => {
        const response = await apiClient.put<InvoiceResponseDto>(`/invoices/${id}`, data);
        return response.data;
    },

    /**
     * Delete an invoice
     */
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/invoices/${id}`);
    },

    /**
     * Mark an invoice as paid
     */
    markAsPaid: async (id: string): Promise<InvoiceResponseDto> => {
        const response = await apiClient.post<InvoiceResponseDto>(`/invoices/${id}/paid`);
        return response.data;
    },

    /**
     * Mark an invoice as cancelled
     */
    markAsCancelled: async (id: string): Promise<InvoiceResponseDto> => {
        const response = await apiClient.post<InvoiceResponseDto>(`/invoices/${id}/cancel`);
        return response.data;
    },

    /**
<<<<<<< HEAD
<<<<<<< HEAD
     * Send an invoice to client with optional custom email content
     */
    send: async (id: string, customSubject?: string, customBody?: string): Promise<InvoiceResponseDto> => {
        const response = await apiClient.post<InvoiceResponseDto>(
            `/invoices/${id}/send`,
            customSubject && customBody ? { customSubject, customBody } : null
        );
=======
     * Send an invoice to client
     */
    send: async (id: string): Promise<InvoiceResponseDto> => {
        const response = await apiClient.post<InvoiceResponseDto>(`/invoices/${id}/send`);
>>>>>>> 2cbbfa3 (```)
=======
     * Send an invoice to client with optional custom email content
     */
    send: async (id: string, customSubject?: string, customBody?: string): Promise<InvoiceResponseDto> => {
        const response = await apiClient.post<InvoiceResponseDto>(
            `/invoices/${id}/send`,
            customSubject && customBody ? { customSubject, customBody } : null
        );
>>>>>>> 7d4431a (```)
        return response.data;
    },

    /**
     * Generate HTML preview of invoice
     */
    getHtml: async (id: string): Promise<string> => {
        const response = await apiClient.get<string>(`/invoices/${id}/html`);
        return response.data;
    },

    /**
     * Download PDF of invoice
     */
    downloadPdf: async (id: string): Promise<Blob> => {
        const response = await apiClient.get(`/invoices/${id}/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    }
};
