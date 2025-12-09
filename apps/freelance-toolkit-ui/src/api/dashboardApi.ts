// apps/freelance-toolkit-ui/src/api/dashboardApi.ts

import { apiClient } from './client';
import type { DashboardStatsDto } from '../types';

export const dashboardApi = {
    /**
     * Get comprehensive dashboard statistics
     */
    getStats: async (): Promise<DashboardStatsDto> => {
        const response = await apiClient.get<DashboardStatsDto>('/dashboard/stats');
        return response.data;
    }
};
