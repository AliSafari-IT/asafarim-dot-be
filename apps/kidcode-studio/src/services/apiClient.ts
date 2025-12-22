// Cache bust: 2024-12-21-22-49-FIXED
import type { Project, CreateProjectDto, UpdateProjectDto } from '../types/project';
import type { Progress, Challenge } from '../types/progress';

const RAW_API_BASE = import.meta.env.VITE_API_URL || '/api';
const API_BASE = RAW_API_BASE.replace(/\/$/, '').endsWith('/api')
    ? RAW_API_BASE.replace(/\/$/, '')
    : `${RAW_API_BASE.replace(/\/$/, '')}/api`;

function getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options?.headers
        },
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

export const api = {
    projects: {
        async list(): Promise<Project[]> {
            return request<Project[]>('/projects');
        },

        async get(id: string): Promise<Project> {
            return request<Project>(`/projects/${id}`);
        },

        async create(data: CreateProjectDto): Promise<Project> {
            return request<Project>('/projects', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        async update(id: string, data: UpdateProjectDto): Promise<Project> {
            return request<Project>(`/projects/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },

        async delete(id: string): Promise<void> {
            const token = getAuthToken();
            await fetch(`${API_BASE}/projects/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
        }
    },

    progress: {
        async get(): Promise<Progress> {
            return request<Progress>('/progress');
        },

        async update(data: {
            unlockLevel?: number;
            addBadge?: string;
            completeChallenge?: string;
            earnSticker?: string;
            addStickers?: number;
            mode?: string;
            setModeLevel?: number;
            addModeSticker?: string;
            addModeBadge?: string;
            completeModeChallenge?: string;
        }): Promise<Progress> {
            const updated = await request<Progress>('/progress/update', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            // Save to local storage immediately
            if (updated) {
                localStorage.setItem('progress', JSON.stringify(updated));
            }
            return updated;
        },

        async getLeaderboard(mode: string, limit: number = 10): Promise<any[]> {
            return request<any[]>(`/progress/leaderboard/${mode}?limit=${limit}`);
        }
    },

    challenges: {
        async list(mode?: string, level?: number): Promise<Challenge[]> {
            const params = new URLSearchParams();
            if (mode) params.set('mode', mode);
            if (level) params.set('level', level.toString());
            const query = params.toString();
            return request<Challenge[]>(`/challenges${query ? `?${query}` : ''}`);
        },

        async getDaily(): Promise<Challenge> {
            return request<Challenge>('/challenges/daily');
        }
    }
};
