const RAW_API_BASE = import.meta.env.VITE_API_URL || "/api";
const API_BASE = RAW_API_BASE.replace(/\/$/, '').endsWith('/api')
    ? RAW_API_BASE.replace(/\/$/, '')
    : `${RAW_API_BASE.replace(/\/$/, '')}/api`;

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface CharacterAssetDto {
    id: string;
    name: string;
    mediaAssetId: string;
    description?: string;
    createdAt: string;
    userId?: string;
}

export interface CreateCharacterAssetDto {
    name: string;
    mediaAssetId: string;
    description?: string;
}

export interface UpdateCharacterAssetDto {
    name: string;
    description?: string;
}

export const characterApi = {
    async listCharacters(): Promise<CharacterAssetDto[]> {
        const response = await fetch(`${API_BASE}/CharacterAssets`, {
            headers: getAuthHeaders(),
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error("Failed to fetch characters");
        }
        return response.json();
    },

    async getCharacter(id: string): Promise<CharacterAssetDto> {
        const response = await fetch(`${API_BASE}/CharacterAssets/${id}`, {
            headers: getAuthHeaders(),
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error("Failed to fetch character");
        }
        return response.json();
    },

    async createCharacter(
        dto: CreateCharacterAssetDto
    ): Promise<CharacterAssetDto> {
        const response = await fetch(`${API_BASE}/CharacterAssets`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
            credentials: "include",
            body: JSON.stringify(dto),
        });
        if (!response.ok) {
            throw new Error("Failed to create character");
        }
        return response.json();
    },

    async updateCharacter(
        id: string,
        dto: UpdateCharacterAssetDto
    ): Promise<void> {
        const response = await fetch(`${API_BASE}/CharacterAssets/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
            credentials: "include",
            body: JSON.stringify(dto),
        });
        if (!response.ok) {
            throw new Error("Failed to update character");
        }
    },

    async deleteCharacter(id: string): Promise<void> {
        const response = await fetch(`${API_BASE}/CharacterAssets/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error("Failed to delete character");
        }
    },

    getCharacterImageUrl(mediaAssetId: string): string {
        return `${API_BASE}/Media/${mediaAssetId}/content`;
    },
};
