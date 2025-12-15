export interface ModeProgress {
    level: number;
    stickers: string[];
    badges: string[];
    completedChallenges: string[];
}

export interface Progress {
    userId: string;
    unlockedLevels: number[];
    badges: string[];
    completedChallenges: string[];
    earnedStickers: string[];
    totalStickers: number;
    drawing: ModeProgress;
    story: ModeProgress;
    music: ModeProgress;
    puzzle: ModeProgress;
}

export interface Challenge {
    id: string;
    title: string;
    mode: string;
    prompt: string;
    starterBlocksJson?: string;
    successCriteria?: string;
    level: number;
    rewardSticker?: string;
    isDaily: boolean;
}

export interface Sticker {
    id: string;
    name: string;
    icon: string;
    earned: boolean;
    earnedAt?: Date;
}

export const STICKERS: Record<string, Sticker> = {
    'first-circle': { id: 'first-circle', name: 'First Circle', icon: '⭕', earned: false },
    'rainbow-artist': { id: 'rainbow-artist', name: 'Rainbow Artist', icon: '🌈', earned: false },
    'pattern-power': { id: 'pattern-power', name: 'Pattern Power', icon: '✨', earned: false },
    'director-star': { id: 'director-star', name: 'Director Star', icon: '🌟', earned: false },
    'chatty-star': { id: 'chatty-star', name: 'Chatty Star', icon: '💬', earned: false },
    'maze-master': { id: 'maze-master', name: 'Maze Master', icon: '🏆', earned: false },
    'music-maker': { id: 'music-maker', name: 'Music Maker', icon: '🎵', earned: false }
};
