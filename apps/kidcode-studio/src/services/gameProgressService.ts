const API_BASE = import.meta.env.PROD
    ? 'https://kidcode.asafarim.be/api'
    : 'http://kidcode.asafarim.local:5190/api';

export interface GameSessionData {
    mode: 'Drawing' | 'Story' | 'Puzzle' | 'Music';
    score: number;
    level?: number;
    starsEarned: number;
    timeSpentSeconds: number;
    completed: boolean;
    metadata?: Record<string, any>;
}

export interface UserStats {
    userId: string;
    username: string;
    totalScore: number;
    totalGamesPlayed: number;
    totalStarsEarned: number;
    currentLevel: number;
    experiencePoints: number;
    highScores: Record<string, number>;
    gamesPlayed: Record<string, number>;
    totalStickers: number;
    badges: string[];
    unlockedLevels: number[];
    currentStreak: number;
    longestStreak: number;
    lastPlayedAt?: string;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    score: number;
    level: number;
    totalStarsEarned: number;
    gamesPlayed: number;
}

export interface LeaderboardResponse {
    mode: string;
    period: string;
    entries: LeaderboardEntry[];
    totalPlayers: number;
    currentUserEntry?: LeaderboardEntry;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

export async function saveGameSession(data: GameSessionData) {
    return fetchWithAuth(`${API_BASE}/gamesessions`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getUserStats(): Promise<UserStats> {
    return fetchWithAuth(`${API_BASE}/stats`);
}

export async function getLeaderboard(
    mode: string = 'Overall',
    period: string = 'AllTime',
    limit: number = 10
): Promise<LeaderboardResponse> {
    const params = new URLSearchParams({ mode, period, limit: limit.toString() });
    return fetchWithAuth(`${API_BASE}/leaderboard?${params}`);
}

export async function getGameHistory(mode?: string, limit: number = 20) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (mode) params.append('mode', mode);
    return fetchWithAuth(`${API_BASE}/gamesessions?${params}`);
}

export async function earnSticker(stickerId: string) {
    return fetchWithAuth(`${API_BASE}/progress/update`, {
        method: 'POST',
        body: JSON.stringify({ earnSticker: stickerId }),
    });
}
