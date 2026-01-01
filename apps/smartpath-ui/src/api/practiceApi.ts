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

export interface PracticeSession {
  id: number;
  childUserId: number;
  lessonId: number;
  startedAt: string;
  endedAt?: string;
  totalPoints: number;
  status: string;
  attempts: PracticeAttempt[];
}

export interface PracticeAttempt {
  id: number;
  sessionId: number;
  prompt: string;
  answer: string;
  isCorrect: boolean;
  pointsAwarded: number;
  attemptedAt: string;
}

export interface CreateSessionRequest {
  familyId: number;
  childUserId: number;
  lessonId: number;
}

export interface CreateAttemptRequest {
  sessionId: number;
  practiceItemId: number;
  answer: string;
}

export interface ChildPracticeSummary {
  childUserId: number;
  childName: string;
  totalPoints: number;
  sessionsCount: number;
  attemptsCount: number;
  correctRate: number;
  currentStreak: number;
  bestStreak: number;
  recentAchievements: UserAchievement[];
}

export interface FamilyChildrenSummary {
  familyId: number;
  children: ChildPracticeSummary[];
}

export interface Achievement {
  id: number;
  key: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  isActive: boolean;
}

export interface UserAchievement {
  id: number;
  childUserId: number;
  achievement: Achievement;
  awardedAt: string;
}

export interface PracticeItem {
  id: number;
  lessonId: number;
  questionText: string;
  points: number;
  difficulty: string;
  isActive: boolean;
  createdAt: string;
}

export interface PracticeAttemptReview {
  attemptId: number;
  practiceItemId: number;
  questionText: string;
  expectedAnswer: string;
  answer: string;
  isCorrect: boolean;
  pointsAwarded: number;
  difficulty: string;
  attemptedAt: string;
}

export interface PracticeSessionReview {
  id: number;
  familyId: number;
  childUserId: number;
  lessonId: number;
  startedAt: string;
  endedAt?: string;
  totalPoints: number;
  status: string;
  attempts: PracticeAttemptReview[];
}

export interface CreatePracticeItemRequest {
  lessonId: number;
  questionText: string;
  expectedAnswer: string;
  points: number;
  difficulty: string;
}

export interface UpdatePracticeItemRequest {
  questionText: string;
  expectedAnswer: string;
  points: number;
  difficulty: string;
  isActive: boolean;
}

export interface AttemptSummary {
  attemptId: number;
  questionPreview: string;
  isCorrect: boolean;
  pointsAwarded: number;
  lessonId: number;
  lessonTitle: string;
  attemptedAt: string;
}

export interface WeakLesson {
  lessonId: number;
  lessonTitle: string;
  accuracy: number;
  attemptCount: number;
}

export interface ChildDashboard {
  childUserId: number;
  childName: string;
  totalPoints: number;
  maxPossiblePoints: number;
  currentStreak: number;
  accuracy: number;
  recentAttempts: AttemptSummary[];
  weakLessons: WeakLesson[];
}

export interface PracticeDashboard {
  children: ChildDashboard[];
}

const practiceApi = {
  async createSession(request: CreateSessionRequest): Promise<PracticeSession> {
    const response = await apiClient.post('/api/practice/sessions', request);
    return response.data;
  },

  async completeSession(sessionId: number): Promise<PracticeSession> {
    const response = await apiClient.post(`/api/practice/sessions/${sessionId}/complete`);
    return response.data;
  },

  async submitAttempt(request: CreateAttemptRequest): Promise<PracticeAttempt> {
    const response = await apiClient.post('/api/practice/attempts', request);
    return response.data;
  },

  async getChildSummary(childId: number): Promise<ChildPracticeSummary> {
    const response = await apiClient.get(`/api/practice/children/${childId}/summary`);
    return response.data;
  },

  async getFamilyChildrenSummary(familyId: number): Promise<FamilyChildrenSummary> {
    const response = await apiClient.get(`/api/practice/families/${familyId}/children-summary`);
    return response.data;
  },

  async getChildAchievements(childId: number): Promise<UserAchievement[]> {
    const response = await apiClient.get(`/api/practice/children/${childId}/achievements`);
    return response.data;
  },

  async getAvailableAchievements(): Promise<Achievement[]> {
    const response = await apiClient.get('/api/practice/achievements');
    return response.data;
  },

  async getItemsByLesson(lessonId: number): Promise<PracticeItem[]> {
    const response = await apiClient.get('/api/practice-items', { params: { lessonId } });
    return response.data;
  },

  async createItem(request: CreatePracticeItemRequest): Promise<PracticeItem> {
    const response = await apiClient.post('/api/practice-items', request);
    return response.data;
  },

  async updateItem(itemId: number, request: UpdatePracticeItemRequest): Promise<PracticeItem> {
    const response = await apiClient.put(`/api/practice-items/${itemId}`, request);
    return response.data;
  },

  async deleteItem(itemId: number): Promise<void> {
    await apiClient.delete(`/api/practice-items/${itemId}`);
  },

  async getFamilyDashboard(familyId: number): Promise<PracticeDashboard> {
    const response = await apiClient.get(`/api/practice-dashboard/families/${familyId}`);
    return response.data;
  },

  async getNextItem(sessionId: number): Promise<PracticeItem> {
    const response = await apiClient.post(`/api/practice/sessions/${sessionId}/next-item`);
    return response.data;
  },

  async getSessionReview(sessionId: number): Promise<PracticeSessionReview> {
    const response = await apiClient.get(`/api/practice/sessions/${sessionId}/review`);
    return response.data;
  },
};

export default practiceApi;
