import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SMARTPATH_API_URL || 'http://smartpath.asafarim.local:5109';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ProgressSummary {
  totalSessions: number;
  totalAttempts: number;
  accuracyPercentage: number;
  currentStreak: number;
  bestStreak: number;
  totalPoints: number;
  maxPossiblePoints: number;
}

export interface LessonProgress {
  lessonId: number;
  lessonTitle: string;
  attemptCount: number;
  accuracy: number;
  lastPracticed: string | null;
  pointsEarned: number;
}

export interface TimeSeriesData {
  date: string;
  attemptCount: number;
  accuracy: number;
}

export interface Family {
  familyId: number;
  familyName: string;
}

const progressService = {
  async getFamilies(): Promise<Family[]> {
    const response = await apiClient.get('/api/progress/families');
    return response.data;
  },

  async getSummary(
    familyId: number,
    memberId?: number,
    from?: string,
    to?: string
  ): Promise<ProgressSummary> {
    const params = new URLSearchParams();
    if (memberId) params.append('memberId', memberId.toString());
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    const response = await apiClient.get(
      `/api/progress/families/${familyId}/summary?${params.toString()}`
    );
    return response.data;
  },

  async getLessons(
    familyId: number,
    memberId?: number,
    from?: string,
    to?: string,
    page: number = 1,
    pageSize: number = 20,
    sort?: string
  ): Promise<LessonProgress[]> {
    const params = new URLSearchParams();
    if (memberId) params.append('memberId', memberId.toString());
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (sort) params.append('sort', sort);
    
    const response = await apiClient.get(
      `/api/progress/families/${familyId}/lessons?${params.toString()}`
    );
    return response.data;
  },

  async getTimeSeries(
    familyId: number,
    memberId?: number,
    from?: string,
    to?: string
  ): Promise<TimeSeriesData[]> {
    const params = new URLSearchParams();
    if (memberId) params.append('memberId', memberId.toString());
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    const response = await apiClient.get(
      `/api/progress/families/${familyId}/timeseries?${params.toString()}`
    );
    return response.data;
  },
};

export default progressService;
