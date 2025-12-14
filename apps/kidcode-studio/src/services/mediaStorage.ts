import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { MediaItem, Album, CreateMediaDto } from '../types/media';

interface MediaDB extends DBSchema {
    media: {
        key: string;
        value: MediaItem;
        indexes: { 'by-type': string; 'by-source': string; 'by-created': Date };
    };
    albums: {
        key: string;
        value: Album;
        indexes: { 'by-updated': Date };
    };
}

let mediaDb: IDBPDatabase<MediaDB> | null = null;

async function getMediaDB(): Promise<IDBPDatabase<MediaDB>> {
    if (mediaDb) return mediaDb;

    mediaDb = await openDB<MediaDB>('kidcode-media', 1, {
        upgrade(database) {
            const mediaStore = database.createObjectStore('media', { keyPath: 'id' });
            mediaStore.createIndex('by-type', 'type');
            mediaStore.createIndex('by-source', 'source');
            mediaStore.createIndex('by-created', 'createdAt');

            const albumStore = database.createObjectStore('albums', { keyPath: 'id' });
            albumStore.createIndex('by-updated', 'updatedAt');
        }
    });

    return mediaDb;
}

const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

async function createThumbnail(blob: Blob, maxSize = 200): Promise<Blob | undefined> {
    if (!blob.type.startsWith('image/')) return undefined;

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(undefined);
                return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((thumbBlob) => resolve(thumbBlob || undefined), 'image/jpeg', 0.7);
        };
        img.onerror = () => resolve(undefined);
        img.src = URL.createObjectURL(blob);
    });
}

export const mediaStorage = {
    async saveMedia(dto: CreateMediaDto): Promise<MediaItem> {
        const db = await getMediaDB();
        const thumbnailBlob = await createThumbnail(dto.blob);

        const item: MediaItem = {
            id: generateId(),
            type: dto.type,
            title: dto.title,
            blob: dto.blob,
            thumbnailBlob,
            mimeType: dto.mimeType,
            width: dto.width,
            height: dto.height,
            duration: dto.duration,
            source: dto.source,
            createdAt: new Date(),
            tags: dto.tags
        };

        await db.put('media', item);
        return item;
    },

    async getMedia(id: string): Promise<MediaItem | undefined> {
        const db = await getMediaDB();
        return db.get('media', id);
    },

    async getAllMedia(): Promise<MediaItem[]> {
        const db = await getMediaDB();
        return db.getAll('media');
    },

    async getMediaByType(type: string): Promise<MediaItem[]> {
        const db = await getMediaDB();
        return db.getAllFromIndex('media', 'by-type', type);
    },

    async getMediaBySource(source: string): Promise<MediaItem[]> {
        const db = await getMediaDB();
        return db.getAllFromIndex('media', 'by-source', source);
    },

    async deleteMedia(id: string): Promise<void> {
        const db = await getMediaDB();
        await db.delete('media', id);
    },

    async saveAlbum(album: Album): Promise<void> {
        const db = await getMediaDB();
        await db.put('albums', { ...album, updatedAt: new Date() });
    },

    async getAlbum(id: string): Promise<Album | undefined> {
        const db = await getMediaDB();
        return db.get('albums', id);
    },

    async getAllAlbums(): Promise<Album[]> {
        const db = await getMediaDB();
        return db.getAll('albums');
    },

    async createAlbum(name: string): Promise<Album> {
        const db = await getMediaDB();
        const album: Album = {
            id: generateId(),
            name,
            mediaIds: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await db.put('albums', album);
        return album;
    },

    async deleteAlbum(id: string): Promise<void> {
        const db = await getMediaDB();
        await db.delete('albums', id);
    },

    async addMediaToAlbum(albumId: string, mediaId: string): Promise<void> {
        const db = await getMediaDB();
        const album = await db.get('albums', albumId);
        if (!album) return;
        if (!album.mediaIds.includes(mediaId)) {
            album.mediaIds.push(mediaId);
            album.updatedAt = new Date();
            await db.put('albums', album);
        }
    },

    async removeMediaFromAlbum(albumId: string, mediaId: string): Promise<void> {
        const db = await getMediaDB();
        const album = await db.get('albums', albumId);
        if (!album) return;
        album.mediaIds = album.mediaIds.filter(id => id !== mediaId);
        album.updatedAt = new Date();
        await db.put('albums', album);
    }
};
