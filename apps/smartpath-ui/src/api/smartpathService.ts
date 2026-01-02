// D:\repos\asafarim-dot-be\apps\smartpath-ui\src\api\smartpathService.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SMARTPATH_API_URL || 'http://smartpath.asafarim.local:5109';
const IDENTITY_API_URL = import.meta.env.VITE_IDENTITY_API_URL || 'http://identity.asafarim.local:5101';

if (import.meta.env.DEV) {
  console.log('🔧 SmartPath API Base URL:', API_BASE_URL);
  console.log('🔧 Identity API Base URL:', IDENTITY_API_URL);
}

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
    if (import.meta.env.DEV) {
      console.log('🔑 Request with token:', token.substring(0, 30) + '...');
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        const response = await axios.post(
          `${IDENTITY_API_URL}/auth/refresh`,
          { refreshToken }
        );
        const { accessToken } = response.data;
        localStorage.setItem('auth_token', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = `${IDENTITY_API_URL.replace('/auth', '')}/login?returnUrl=${encodeURIComponent(window.location.href)}`;
      }
    }
    return Promise.reject(error);
  }
);

export const smartpathService = {
  users: {
    me: () => apiClient.get('/users/me'),
  },

  families: {
    getMyFamilies: () => apiClient.get('/families/my-families'),
    getById: (id: number) => apiClient.get(`/families/${id}`),
    create: (data: { familyName: string }) => apiClient.post('/families', data),
    update: (id: number, data: { familyName: string }) => apiClient.put(`/families/${id}`, data),
    delete: (id: number) => apiClient.delete(`/families/${id}`),
    deleteMultiple: (ids: number[]) => apiClient.post('/families/delete-bulk', { ids }),
    addMember: (familyId: number, data: any) => apiClient.post(`/families/${familyId}/members`, data),
    addMemberByEmail: (familyId: number, data: { email: string; role?: string }) => 
      apiClient.post(`/families/${familyId}/members/by-email`, data),
    removeMember: (familyId: number, targetUserId: number) => apiClient.delete(`/families/${familyId}/members/users/${targetUserId}`),
    updateMemberRole: (familyId: number, familyMemberId: number, role: string) => 
      apiClient.put(`/families/${familyId}/members/${familyMemberId}/role`, { role }),
  },

  tasks: {
    getAll: (params: { familyId: number; childId?: number; status?: string }) => 
      apiClient.get('/tasks', { params }),
    getById: (id: number) => apiClient.get(`/tasks/${id}`),
    create: (data: any) => apiClient.post('/tasks', data),
    update: (id: number, data: any) => apiClient.put(`/tasks/${id}`, data),
    complete: (id: number) => apiClient.post(`/tasks/${id}/complete`),
    delete: (id: number) => apiClient.delete(`/tasks/${id}`),
    deleteMultiple: (ids: number[]) => apiClient.post('/tasks/delete-bulk', { ids }),
    deleteByFamily: (familyId: number) => apiClient.delete(`/tasks/family/${familyId}`),
  },

  courses: {
    getAll: (gradeLevel?: number) => apiClient.get('/courses', { params: { gradeLevel } }),
    getById: (id: number) => apiClient.get(`/courses/${id}`),
    create: (data: any) => apiClient.post('/courses', data),
    update: (id: number, data: any) => apiClient.put(`/courses/${id}`, data),
    delete: (id: number) => apiClient.delete(`/courses/${id}`),
    deleteMultiple: (ids: number[]) => apiClient.post('/courses/delete-bulk', { ids }),
    getChapters: (courseId: number) => apiClient.get(`/courses/${courseId}/chapters`),
    getChapter: (chapterId: number) => apiClient.get(`/courses/chapters/${chapterId}`),
    createChapter: (data: any) => apiClient.post('/courses/chapters', data),
    updateChapter: (chapterId: number, data: any) => apiClient.put(`/courses/chapters/${chapterId}`, data),
    deleteChapter: (chapterId: number) => apiClient.delete(`/courses/chapters/${chapterId}`),
    getLessons: (chapterId: number) => apiClient.get(`/courses/chapters/${chapterId}/lessons`),
    getLesson: (lessonId: number) => apiClient.get(`/courses/lessons/${lessonId}`),
    createLesson: (data: any) => apiClient.post('/courses/lessons', data),
    updateLesson: (lessonId: number, data: any) => apiClient.put(`/courses/lessons/${lessonId}`, data),
    deleteLesson: (lessonId: number) => apiClient.delete(`/courses/lessons/${lessonId}`),
  },

  progress: {
    enroll: (data: { childUserId: number; courseId: number }) => 
      apiClient.post('/api/progress/enrollments', data),
    getEnrollments: (childId: number) => apiClient.get(`/api/progress/children/${childId}/enrollments`),
    startLesson: (lessonId: number, data: { childUserId: number }) => 
      apiClient.post(`/api/progress/lessons/${lessonId}/start`, data),
    completeLesson: (lessonId: number, data: { childUserId: number; selfAssessmentScore: number }) => 
      apiClient.post(`/api/progress/lessons/${lessonId}/complete`, data),
    getProgress: (childId: number, courseId?: number) => 
      apiClient.get(`/api/progress/children/${childId}/progress`, { params: { courseId } }),
    recordAttempt: (itemId: number, data: any) => 
      apiClient.post(`/api/progress/practice-items/${itemId}/attempt`, data),
  },
};

export default smartpathService;
