const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5190/api';

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
    albumId: string | null;
    createdAt: string;
}

export interface AlbumDto {
    id: string;
    name: string;
    coverMediaId: string | null;
    mediaCount: number;
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
        if (params.albumId) formData.append('albumId', params.albumId);

        const response = await fetch(`${API_BASE}/media`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `Upload failed: ${response.status}`);
        }

        return response.json();
    },

    async listMedia(albumId?: string, source?: string): Promise<MediaAssetDto[]> {
        const params = new URLSearchParams();
        if (albumId) params.set('albumId', albumId);
        if (source) params.set('source', source);
        const query = params.toString();

        const response = await fetch(`${API_BASE}/media${query ? `?${query}` : ''}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to list media: ${response.status}`);
        }

        return response.json();
    },

    async getMedia(id: string): Promise<MediaAssetDto> {
        const response = await fetch(`${API_BASE}/media/${id}`, {
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
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete media: ${response.status}`);
        }
    },

    async listAlbums(): Promise<AlbumDto[]> {
        const response = await fetch(`${API_BASE}/media/albums`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to list albums: ${response.status}`);
        }

        return response.json();
    },

    async createAlbum(name: string): Promise<AlbumDto> {
        const response = await fetch(`${API_BASE}/media/albums`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to create album: ${response.status}`);
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
    }
};
