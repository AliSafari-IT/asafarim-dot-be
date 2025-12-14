import type { Block } from './blocks';

export type ProjectMode = 'drawing' | 'story' | 'puzzle' | 'music';

export interface Project {
    id: string;
    title: string;
    mode: ProjectMode;
    blocks: Block[];
    assets?: ProjectAssets;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectAssets {
    background?: string;
    character?: string;
    sounds?: string[];
}

export interface CreateProjectDto {
    title: string;
    mode: ProjectMode;
    blocksJson?: string;
    assets?: string;
}

export interface UpdateProjectDto {
    title?: string;
    blocksJson?: string;
    assets?: string;
}
