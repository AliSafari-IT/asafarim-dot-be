import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Project } from '../types/project';
import type { Progress } from '../types/progress';

interface KidCodeDB extends DBSchema {
    projects: {
        key: string;
        value: Project;
        indexes: { 'by-mode': string; 'by-updated': Date };
    };
    progress: {
        key: string;
        value: Progress;
    };
}

let db: IDBPDatabase<KidCodeDB> | null = null;

async function getDB(): Promise<IDBPDatabase<KidCodeDB>> {
    if (db) return db;

    db = await openDB<KidCodeDB>('kidcode-studio', 1, {
        upgrade(database) {
            const projectStore = database.createObjectStore('projects', { keyPath: 'id' });
            projectStore.createIndex('by-mode', 'mode');
            projectStore.createIndex('by-updated', 'updatedAt');

            database.createObjectStore('progress', { keyPath: 'userId' });
        }
    });

    return db;
}

export const storage = {
    async saveProject(project: Project): Promise<void> {
        const database = await getDB();
        await database.put('projects', {
            ...project,
            updatedAt: new Date()
        });
    },

    async getProject(id: string): Promise<Project | undefined> {
        const database = await getDB();
        return database.get('projects', id);
    },

    async getAllProjects(): Promise<Project[]> {
        const database = await getDB();
        return database.getAll('projects');
    },

    async getProjectsByMode(mode: string): Promise<Project[]> {
        const database = await getDB();
        return database.getAllFromIndex('projects', 'by-mode', mode);
    },

    async deleteProject(id: string): Promise<void> {
        const database = await getDB();
        await database.delete('projects', id);
    },

    async saveProgress(progress: Progress): Promise<void> {
        const database = await getDB();
        await database.put('progress', progress);
    },

    async getProgress(userId: string): Promise<Progress | undefined> {
        const database = await getDB();
        return database.get('progress', userId);
    },

    async getOrCreateProgress(userId: string): Promise<Progress> {
        const existing = await this.getProgress(userId);
        if (existing) return existing;

        const defaultModeProgress = {
            level: 1,
            stickers: [],
            badges: [],
            completedChallenges: []
        };

        const newProgress: Progress = {
            userId,
            unlockedLevels: [1],
            badges: [],
            completedChallenges: [],
            earnedStickers: [],
            totalStickers: 0,
            drawing: { ...defaultModeProgress },
            story: { ...defaultModeProgress },
            music: { ...defaultModeProgress },
            puzzle: { ...defaultModeProgress }
        };
        await this.saveProgress(newProgress);
        return newProgress;
    }
};
