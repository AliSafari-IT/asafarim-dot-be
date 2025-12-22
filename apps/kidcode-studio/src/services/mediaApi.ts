const RAW_API_BASE = import.meta.env.VITE_API_URL || '/api';
const API_BASE = RAW_API_BASE.replace(/\/$/, '').endsWith('/api')
    ? RAW_API_BASE.replace(/\/$/, '')
    : `${RAW_API_BASE.replace(/\/$/, '')}/api`;

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export enum AlbumVisibility {
    Private = 0,
    Public = 1,
    MembersOnly = 2
}

export interface MediaAssetDto {
    id: string;
    fileName: string;
    contentType: string;
    size: number;
    title: string;
    source: string | null;
    width: number | null;
    height: number | null;
    duration: number | null;
    scriptJson: string | null;
    albumId: string | null;
    userId: string | null;
    createdAt: string;
}

export interface AlbumDto {
    id: string;
    name: string;
    description: string | null;
    coverMediaId: string | null;
    coverUrl: string | null;
    visibility: AlbumVisibility;
    mediaCount: number;
    userId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UploadMediaParams {
    file: File | Blob;
    title: string;
    source?: string;
    width?: number;
    height?: number;
    duration?: number;
    scriptJson?: string;
    albumId?: string;
}

export const mediaApi = {
    async uploadMedia(params: UploadMediaParams): Promise<MediaAssetDto> {
        const formData = new FormData();

        if (params.file instanceof File) {
            formData.append('file', params.file);
        } else {
            formData.append('file', params.file, `${params.title}.png`);
        }

        formData.append('title', params.title);
        if (params.source) formData.append('source', params.source);
        if (params.width) formData.append('width', params.width.toString());
        if (params.height) formData.append('height', params.height.toString());
        if (params.duration) formData.append('duration', params.duration.toString());
        if (params.scriptJson) formData.append('scriptJson', params.scriptJson);
        if (params.albumId) formData.append('albumId', params.albumId);

        const response = await fetch(`${API_BASE}/media`, {
            method: 'POST',
            body: formData,
            headers: getAuthHeaders(),
            credentials: 'include'
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `Upload failed: ${response.status}`);
        }

        return response.json();
    },

    async updateMedia(id: string, params: { file?: File | Blob; title?: string; scriptJson?: string }): Promise<MediaAssetDto> {
        const formData = new FormData();

        if (params.file) {
            if (params.file instanceof File) {
                formData.append('file', params.file);
            } else {
                formData.append('file', params.file, 'drawing.png');
            }
        }

        if (params.title) formData.append('title', params.title);
        if (params.scriptJson) formData.append('scriptJson', params.scriptJson);

        const response = await fetch(`${API_BASE}/media/${id}`, {
            method: 'PUT',
            body: formData,
            headers: getAuthHeaders(),
            credentials: 'include'
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `Update failed: ${response.status}`);
        }

        return response.json();
    },

    async listMedia(albumId?: string, source?: string, myMediaOnly?: boolean): Promise<MediaAssetDto[]> {
        const params = new URLSearchParams();
        if (albumId) params.set('albumId', albumId);
        if (source) params.set('source', source);
        if (myMediaOnly !== undefined) params.set('myMediaOnly', myMediaOnly.toString());
        const query = params.toString();

        const response = await fetch(`${API_BASE}/media${query ? `?${query}` : ''}`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to list media: ${response.status}`);
        }

        return response.json();
    },

    async getMedia(id: string): Promise<MediaAssetDto> {
        const response = await fetch(`${API_BASE}/media/${id}`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to get media: ${response.status}`);
        }

        return response.json();
    },

    getContentUrl(id: string): string {
        return `${API_BASE}/media/${id}/content`;
    },

    async deleteMedia(id: string): Promise<void> {
        const response = await fetch(`${API_BASE}/media/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete media: ${response.status}`);
        }
    },

    async listAlbums(myAlbumsOnly?: boolean, visibility?: string): Promise<AlbumDto[]> {
        const params = new URLSearchParams();
        if (myAlbumsOnly !== undefined) params.set('myAlbumsOnly', myAlbumsOnly.toString());
        if (visibility) params.set('visibility', visibility);
        const query = params.toString();

        const response = await fetch(`${API_BASE}/media/albums${query ? `?${query}` : ''}`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to list albums: ${response.status}`);
        }

        return response.json();
    },

    async getAlbum(id: string): Promise<AlbumDto> {
        const response = await fetch(`${API_BASE}/media/albums/${id}`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to get album: ${response.status}`);
        }

        return response.json();
    },

    async createAlbum(name: string, description?: string, visibility?: AlbumVisibility): Promise<AlbumDto> {
        const response = await fetch(`${API_BASE}/media/albums`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({
                name,
                description: description || null,
                visibility: visibility ?? AlbumVisibility.Private
            }),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to create album: ${response.status}`);
        }

        return response.json();
    },

    async updateAlbum(id: string, data: {
        name?: string;
        description?: string;
        coverMediaId?: string;
        visibility?: AlbumVisibility;
    }): Promise<AlbumDto> {
        const response = await fetch(`${API_BASE}/media/albums/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify(data),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to update album: ${response.status}`);
        }

        return response.json();
    },

    async deleteAlbum(id: string): Promise<void> {
        const response = await fetch(`${API_BASE}/media/albums/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete album: ${response.status}`);
        }
    },

    async addMediaToAlbum(albumId: string, mediaId: string): Promise<MediaAssetDto> {
        const response = await fetch(`${API_BASE}/media/albums/${albumId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mediaId }),
            credentials: 'include'
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `Failed to add media to album: ${response.status}`);
        }

        return response.json();
    },

    async removeMediaFromAlbum(albumId: string, mediaId: string): Promise<void> {
        const response = await fetch(`${API_BASE}/media/albums/${albumId}/media/${mediaId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to remove media from album: ${response.status}`);
        }
    }
};
