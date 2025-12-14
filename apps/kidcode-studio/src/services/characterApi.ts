const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5190/api";

export interface CharacterAssetDto {
    id: string;
    name: string;
    mediaAssetId: string;
    description?: string;
    createdAt: string;
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
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error("Failed to fetch characters");
        }
        return response.json();
    },

    async getCharacter(id: string): Promise<CharacterAssetDto> {
        const response = await fetch(`${API_BASE}/CharacterAssets/${id}`, {
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
            headers: { "Content-Type": "application/json" },
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
            headers: { "Content-Type": "application/json" },
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
