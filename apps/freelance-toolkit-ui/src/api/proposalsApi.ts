// apps/freelance-toolkit-ui/src/api/proposalsApi.ts
import { apiClient } from './client';
import type {
    CreateProposalDto,
    UpdateProposalDto,
    ProposalResponseDto,
    ProposalVersionDto,
    ProposalTemplateDto
} from '../types';

export const proposalsApi = {
    /**
     * Get all proposals with optional filters
     */
    getAll: async (status?: string, clientId?: string): Promise<ProposalResponseDto[]> => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (clientId) params.append('clientId', clientId);

        const response = await apiClient.get<ProposalResponseDto[]>(
            `/proposals${params.toString() ? `?${params.toString()}` : ''}`
        );
        return response.data;
    },

    /**
     * Get a proposal by ID
     */
    getById: async (id: string): Promise<ProposalResponseDto> => {
        const response = await apiClient.get<ProposalResponseDto>(`/proposals/${id}`);
        return response.data;
    },

    /**
     * Create a new proposal
     */
    create: async (data: CreateProposalDto): Promise<ProposalResponseDto> => {
        const response = await apiClient.post<ProposalResponseDto>('/proposals', data);
        return response.data;
    },

    /**
     * Update an existing proposal
     */
    update: async (id: string, data: UpdateProposalDto): Promise<ProposalResponseDto> => {
        const response = await apiClient.put<ProposalResponseDto>(`/proposals/${id}`, data);
        return response.data;
    },

    /**
     * Delete a proposal
     */
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/proposals/${id}`);
    },

    /**
     * Send a proposal to client
     */
    send: async (id: string): Promise<ProposalResponseDto> => {
        const response = await apiClient.post<ProposalResponseDto>(`/proposals/${id}/send`);
        return response.data;
    },

    /**
     * Accept a proposal
     */
    accept: async (id: string): Promise<ProposalResponseDto> => {
        const response = await apiClient.post<ProposalResponseDto>(`/proposals/${id}/accept`);
        return response.data;
    },

    /**
     * Reject a proposal
     */
    reject: async (id: string): Promise<ProposalResponseDto> => {
        const response = await apiClient.post<ProposalResponseDto>(`/proposals/${id}/reject`);
        return response.data;
    },

    /**
     * Create a new version of a proposal
     */
    createVersion: async (id: string): Promise<ProposalResponseDto> => {
        const response = await apiClient.post<ProposalResponseDto>(`/proposals/${id}/versions`);
        return response.data;
    },

    /**
     * Get all versions of a proposal
     */
    getVersions: async (id: string): Promise<ProposalVersionDto[]> => {
        const response = await apiClient.get<ProposalVersionDto[]>(`/proposals/${id}/versions`);
        return response.data;
    },

    /**
     * Generate HTML preview of proposal
     */
    getHtml: async (id: string): Promise<string> => {
        const response = await apiClient.get<string>(`/proposals/${id}/html`);
        return response.data;
    },

    /**
     * Download PDF of proposal
     */
    downloadPdf: async (id: string): Promise<Blob> => {
        const response = await apiClient.get(`/proposals/${id}/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Template methods
    templates: {
        /**
         * Get all proposal templates
         */
        getAll: async (): Promise<ProposalTemplateDto[]> => {
            const response = await apiClient.get<ProposalTemplateDto[]>('/proposals/templates');
            return response.data;
        },

        /**
         * Get a template by ID
         */
        getById: async (id: string): Promise<ProposalTemplateDto> => {
            const response = await apiClient.get<ProposalTemplateDto>(`/proposals/templates/${id}`);
            return response.data;
        },

        /**
         * Create a new template
         */
        create: async (data: ProposalTemplateDto): Promise<ProposalTemplateDto> => {
            const response = await apiClient.post<ProposalTemplateDto>('/proposals/templates', data);
            return response.data;
        },

        /**
         * Delete a template
         */
        delete: async (id: string): Promise<void> => {
            await apiClient.delete(`/proposals/templates/${id}`);
        }
    }
};
