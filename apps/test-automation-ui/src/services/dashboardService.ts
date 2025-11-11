// apps/test-automation-ui/src/services/dashboardService.ts
import { api } from '../config/api';

export interface DashboardStats {
  totalTestRuns: number;
  passed: number;
  failed: number;
  inProgress: number;
  totalTestRunsTrend: string;
  passedTrend: string;
  failedTrend: string;
  inProgressTrend: string;
}

export interface RecentTestRun {
  id: string;
  testSuite: string;
  status: 'completed' | 'failed' | 'running' | 'cancelled';
  duration: string;
  passed: number;
  failed: number;
  date: string;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/api/dashboard/stats');
  return response.data;
};

export const getRecentTestRuns = async (): Promise<RecentTestRun[]> => {
  const response = await api.get('/api/dashboard/recent-runs');
  return response.data;
};