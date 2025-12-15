import { create } from 'zustand';
import type { Block } from '../../types/blocks';
import type { Project, ProjectMode } from '../../types/project';
import type { Progress, Challenge } from '../../types/progress';

interface PaintStroke {
    id: string;
    points: { x: number; y: number }[];
    color: string;
    width: number;
    brushType: 'pen' | 'crayon' | 'watercolor';
}

interface PaintStamp {
    id: string;
    x: number;
    y: number;
    imageUrl: string;
    size: number;
}

interface EditorState {
    blocks: Block[];
    selectedBlockId: string | null;
    isPlaying: boolean;
    currentStep: number;
    failedBlockIndex: number | null;
    undoStack: Block[][];
    redoStack: Block[][];
    paintMode: boolean;
    paintStrokes: PaintStroke[];
    paintStamps: PaintStamp[];
    paintBrushType: 'pen' | 'crayon' | 'watercolor';
    paintColor: string;
    paintBrushWidth: number;
    paintUndoStack: PaintStroke[][];
    paintRedoStack: PaintStroke[][];
}

interface CharacterAsset {
    id: string;
    url: string;
    title: string;
}

interface AppState {
    currentProject: Project | null;
    projects: Project[];
    progress: Progress | null;
    challenges: Challenge[];
    dailyChallenge: Challenge | null;
    activeMode: ProjectMode;
    editorsByMode: Record<ProjectMode, EditorState>;
    editor: EditorState;
    showReward: { sticker: string; message: string } | null;
    selectedCharacterAsset: CharacterAsset | null;
    earnedStickers: Set<string>;

    setCurrentProject: (project: Project | null) => void;
    setProjects: (projects: Project[]) => void;
    setProgress: (progress: Progress) => void;
    setChallenges: (challenges: Challenge[]) => void;
    setDailyChallenge: (challenge: Challenge | null) => void;

    addBlock: (block: Block) => void;
    removeBlock: (blockId: string) => void;
    updateBlock: (blockId: string, params: Record<string, number | string>) => void;
    moveBlock: (fromIndex: number, toIndex: number) => void;
    setBlocks: (blocks: Block[]) => void;
    clearBlocks: () => void;
    selectBlock: (blockId: string | null) => void;

    undo: () => void;
    redo: () => void;
    saveToUndo: () => void;

    play: () => void;
    stop: () => void;
    step: () => void;
    setFailedBlockIndex: (index: number | null) => void;

    showStickerReward: (sticker: string, message: string) => boolean;
    hideReward: () => void;

    setSelectedCharacterAsset: (asset: CharacterAsset | null) => void;

    setActiveMode: (mode: ProjectMode) => void;

    createNewProject: (mode: ProjectMode, title?: string) => Project;

    togglePaintMode: () => void;
    addPaintStroke: (stroke: PaintStroke) => void;
    addPaintStamp: (stamp: PaintStamp) => void;
    setPaintBrushType: (type: 'pen' | 'crayon' | 'watercolor') => void;
    setPaintColor: (color: string) => void;
    setPaintBrushWidth: (width: number) => void;
    clearPaintStrokes: () => void;
    undoPaintStroke: () => void;
    redoPaintStroke: () => void;
    savePaintToUndo: () => void;
    loadPaintData: (strokes: PaintStroke[], stamps: PaintStamp[]) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const createEmptyEditor = (): EditorState => ({
    blocks: [],
    selectedBlockId: null,
    isPlaying: false,
    currentStep: -1,
    failedBlockIndex: null,
    undoStack: [],
    redoStack: [],
    paintMode: false,
    paintStrokes: [],
    paintStamps: [],
    paintBrushType: 'pen',
    paintColor: '#2D3436',
    paintBrushWidth: 3,
    paintUndoStack: [],
    paintRedoStack: []
});

export const useStore = create<AppState>((set, get) => ({
    currentProject: null,
    projects: [],
    progress: null,
    challenges: [],
    dailyChallenge: null,
    activeMode: 'drawing',
    editorsByMode: {
        drawing: createEmptyEditor(),
        story: createEmptyEditor(),
        puzzle: createEmptyEditor(),
        music: createEmptyEditor()
    },
    editor: createEmptyEditor(),
    showReward: null,
    selectedCharacterAsset: null,
    earnedStickers: new Set<string>(),

    setCurrentProject: (project) => set((state) => {
        const mode = project?.mode ?? state.activeMode;
        const nextEditor: EditorState = {
            ...state.editor,
            blocks: project?.blocks || [],
            selectedBlockId: null,
            isPlaying: false,
            currentStep: -1,
            undoStack: [],
            redoStack: []
        };

        return {
            currentProject: project,
            activeMode: mode,
            editor: nextEditor,
            editorsByMode: { ...state.editorsByMode, [mode]: nextEditor }
        };
    }),

    setProjects: (projects) => set({ projects }),
    setProgress: (progress) => set({
        progress,
        earnedStickers: new Set(progress?.earnedStickers || [])
    }),
    setChallenges: (challenges) => set({ challenges }),
    setDailyChallenge: (challenge) => set({ dailyChallenge: challenge }),

    addBlock: (block) => {
        get().saveToUndo();
        set((state) => {
            const editor: EditorState = {
                ...state.editor,
                blocks: [...state.editor.blocks, { ...block, id: generateId() }],
                redoStack: []
            };
            return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
        });
    },

    removeBlock: (blockId) => {
        get().saveToUndo();
        set((state) => {
            const editor: EditorState = {
                ...state.editor,
                blocks: state.editor.blocks.filter(b => b.id !== blockId),
                selectedBlockId: state.editor.selectedBlockId === blockId ? null : state.editor.selectedBlockId,
                redoStack: []
            };
            return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
        });
    },

    updateBlock: (blockId, params) => {
        get().saveToUndo();
        set((state) => {
            const editor: EditorState = {
                ...state.editor,
                blocks: state.editor.blocks.map(b =>
                    b.id === blockId ? { ...b, params: { ...b.params, ...params } } : b
                ),
                redoStack: []
            };
            return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
        });
    },

    moveBlock: (fromIndex, toIndex) => {
        get().saveToUndo();
        set((state) => {
            const blocks = [...state.editor.blocks];
            const [removed] = blocks.splice(fromIndex, 1);
            blocks.splice(toIndex, 0, removed);
            const editor: EditorState = { ...state.editor, blocks, redoStack: [] };
            return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
        });
    },

    setBlocks: (blocks) => set((state) => {
        const editor: EditorState = { ...state.editor, blocks };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    clearBlocks: () => {
        get().saveToUndo();
        set((state) => {
            const editor: EditorState = { ...state.editor, blocks: [], selectedBlockId: null, failedBlockIndex: null, redoStack: [] };
            return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
        });
    },

    selectBlock: (blockId) => set((state) => {
        const editor: EditorState = { ...state.editor, selectedBlockId: blockId };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    saveToUndo: () => set((state) => {
        const editor: EditorState = {
            ...state.editor,
            undoStack: [...state.editor.undoStack.slice(-19), state.editor.blocks]
        };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    undo: () => set((state) => {
        if (state.editor.undoStack.length === 0) return state;
        const previous = state.editor.undoStack[state.editor.undoStack.length - 1];
        const editor: EditorState = {
            ...state.editor,
            blocks: previous,
            undoStack: state.editor.undoStack.slice(0, -1),
            redoStack: [...state.editor.redoStack, state.editor.blocks]
        };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    redo: () => set((state) => {
        if (state.editor.redoStack.length === 0) return state;
        const next = state.editor.redoStack[state.editor.redoStack.length - 1];
        const editor: EditorState = {
            ...state.editor,
            blocks: next,
            undoStack: [...state.editor.undoStack, state.editor.blocks],
            redoStack: state.editor.redoStack.slice(0, -1)
        };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    play: () => set((state) => {
        const editor: EditorState = { ...state.editor, isPlaying: true, currentStep: 0, failedBlockIndex: null };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    stop: () => set((state) => {
        const editor: EditorState = { ...state.editor, isPlaying: false, currentStep: -1 };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    step: () => set((state) => {
        const editor: EditorState = {
            ...state.editor,
            currentStep: state.editor.currentStep + 1,
            isPlaying: state.editor.currentStep + 1 < state.editor.blocks.length
        };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    setFailedBlockIndex: (index) => set((state) => {
        const editor: EditorState = { ...state.editor, failedBlockIndex: index };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    showStickerReward: (sticker, message) => {
        const state = get();
        if (state.earnedStickers.has(sticker)) {
            return false;
        }
        const newEarnedStickers = new Set(state.earnedStickers);
        newEarnedStickers.add(sticker);
        set({
            showReward: { sticker, message },
            earnedStickers: newEarnedStickers
        });
        return true;
    },
    hideReward: () => set({ showReward: null }),

    setSelectedCharacterAsset: (asset) => set({ selectedCharacterAsset: asset }),

    setActiveMode: (mode) => set((state) => {
        if (state.activeMode === mode) return state;
        const editorsByMode = { ...state.editorsByMode, [state.activeMode]: state.editor };
        const nextStored = editorsByMode[mode] ?? createEmptyEditor();
        const editor: EditorState = {
            ...nextStored,
            selectedBlockId: null,
            isPlaying: false,
            currentStep: -1
        };
        return {
            activeMode: mode,
            editorsByMode: { ...editorsByMode, [mode]: editor },
            editor
        };
    }),

    createNewProject: (mode, title) => {
        const project: Project = {
            id: generateId(),
            title: title || `My ${mode.charAt(0).toUpperCase() + mode.slice(1)} Project`,
            mode,
            blocks: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        set((state) => {
            const editor: EditorState = { ...createEmptyEditor() };
            return {
                projects: [...state.projects, project],
                currentProject: project,
                activeMode: mode,
                editor,
                editorsByMode: { ...state.editorsByMode, [mode]: editor }
            };
        });
        return project;
    },

    togglePaintMode: () => set((state) => {
        const editor: EditorState = { ...state.editor, paintMode: !state.editor.paintMode };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    addPaintStroke: (stroke) => set((state) => {
        const editor: EditorState = {
            ...state.editor,
            paintStrokes: [...state.editor.paintStrokes, stroke],
            paintRedoStack: []
        };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    addPaintStamp: (stamp) => set((state) => {
        const editor: EditorState = {
            ...state.editor,
            paintStamps: [...state.editor.paintStamps, stamp]
        };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    setPaintBrushType: (type) => set((state) => {
        const editor: EditorState = { ...state.editor, paintBrushType: type };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    setPaintColor: (color) => set((state) => {
        const editor: EditorState = { ...state.editor, paintColor: color };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    setPaintBrushWidth: (width) => set((state) => {
        const editor: EditorState = { ...state.editor, paintBrushWidth: width };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    clearPaintStrokes: () => {
        get().savePaintToUndo();
        set((state) => {
            const editor: EditorState = {
                ...state.editor,
                paintStrokes: [],
                paintStamps: [],
                paintRedoStack: []
            };
            return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
        });
    },

    savePaintToUndo: () => set((state) => {
        const editor: EditorState = {
            ...state.editor,
            paintUndoStack: [...state.editor.paintUndoStack.slice(-19), state.editor.paintStrokes]
        };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    undoPaintStroke: () => set((state) => {
        if (state.editor.paintUndoStack.length === 0) return state;
        const previous = state.editor.paintUndoStack[state.editor.paintUndoStack.length - 1];
        const editor: EditorState = {
            ...state.editor,
            paintStrokes: previous,
            paintUndoStack: state.editor.paintUndoStack.slice(0, -1),
            paintRedoStack: [...state.editor.paintRedoStack, state.editor.paintStrokes]
        };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    redoPaintStroke: () => set((state) => {
        if (state.editor.paintRedoStack.length === 0) return state;
        const next = state.editor.paintRedoStack[state.editor.paintRedoStack.length - 1];
        const editor: EditorState = {
            ...state.editor,
            paintStrokes: next,
            paintUndoStack: [...state.editor.paintUndoStack, state.editor.paintStrokes],
            paintRedoStack: state.editor.paintRedoStack.slice(0, -1)
        };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    }),

    loadPaintData: (strokes, stamps) => set((state) => {
        const editor: EditorState = {
            ...state.editor,
            paintStrokes: strokes,
            paintStamps: stamps,
            paintUndoStack: [],
            paintRedoStack: []
        };
        return { editor, editorsByMode: { ...state.editorsByMode, [state.activeMode]: editor } };
    })
}));
