import type { Project, CreateProjectDto, UpdateProjectDto } from '../types/project';
import type { Progress, Challenge } from '../types/progress';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5190/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
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
            await fetch(`${API_BASE}/projects/${id}`, {
                method: 'DELETE',
                credentials: 'include'
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
            addStickers?: number;
        }): Promise<Progress> {
            return request<Progress>('/progress/update', {
                method: 'POST',
                body: JSON.stringify(data)
            });
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
