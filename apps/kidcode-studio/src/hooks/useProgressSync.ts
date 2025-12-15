import { useCallback } from 'react';
import { useStore } from '../core/state/useStore';
import { api } from '../services/apiClient';
import type { Progress } from '../types/progress';

export function useProgressSync() {
    const setProgress = useStore((state) => state.setProgress);

    const syncProgress = useCallback(async (updatedProgress: Progress) => {
        // Update the store immediately
        setProgress(updatedProgress);
        // Save to localStorage
        localStorage.setItem('progress', JSON.stringify(updatedProgress));
    }, [setProgress]);

    const updateProgress = useCallback(async (data: {
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
    }) => {
        try {
            const updated = await api.progress.update(data);
            if (updated) {
                await syncProgress(updated);
            }
            return updated;
        } catch (error) {
            console.error('Failed to update progress:', error);
            throw error;
        }
    }, [syncProgress]);

    return { updateProgress, syncProgress };
}
