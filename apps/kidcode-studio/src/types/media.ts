export type MediaType = 'image' | 'video';

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  blob: Blob;
  thumbnailBlob?: Blob;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
  source: 'upload' | 'drawing' | 'story' | 'puzzle' | 'music';
  createdAt: Date;
  tags?: string[];
}

export interface Album {
  id: string;
  name: string;
  coverMediaId?: string;
  mediaIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMediaDto {
  type: MediaType;
  title: string;
  blob: Blob;
  mimeType: string;
  source: MediaItem['source'];
  width?: number;
  height?: number;
  duration?: number;
  tags?: string[];
}
