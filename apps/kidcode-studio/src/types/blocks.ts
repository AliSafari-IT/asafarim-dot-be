export type BlockCategory = 'draw' | 'motion' | 'color' | 'control' | 'animation' | 'logic' | 'music' | 'system';

export interface BlockParam {
    name: string;
    type: 'number' | 'string' | 'color' | 'select';
    default: number | string;
    options?: string[];
    min?: number;
    max?: number;
}

export interface BlockDefinition {
    id: string;
    type: string;
    category: BlockCategory;
    label: string;
    color: string;
    icon: string;
    params: BlockParam[];
}

export interface Block {
    id: string;
    type: string;
    params: Record<string, number | string>;
    children?: Block[];
}

export interface BlockScript {
    blocks: Block[];
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
    {
        id: 'draw-circle',
        type: 'drawCircle',
        category: 'draw',
        label: 'Draw Circle',
        color: '#FF6B6B',
        icon: '⭕',
        params: [{ name: 'size', type: 'number', default: 50, min: 10, max: 200 }]
    },
    {
        id: 'draw-square',
        type: 'drawSquare',
        category: 'draw',
        label: 'Draw Square',
        color: '#FF6B6B',
        icon: '⬜',
        params: [{ name: 'size', type: 'number', default: 50, min: 10, max: 200 }]
    },
    {
        id: 'draw-triangle',
        type: 'drawTriangle',
        category: 'draw',
        label: 'Draw Triangle',
        color: '#FF6B6B',
        icon: '🔺',
        params: [{ name: 'size', type: 'number', default: 50, min: 10, max: 200 }]
    },
    {
        id: 'draw-star',
        type: 'drawStar',
        category: 'draw',
        label: 'Draw Star',
        color: '#FF6B6B',
        icon: '⭐',
        params: [{ name: 'size', type: 'number', default: 50, min: 10, max: 200 }]
    },
    {
        id: 'draw-heart',
        type: 'drawHeart',
        category: 'draw',
        label: 'Draw Heart',
        color: '#FF6B6B',
        icon: '❤️',
        params: [{ name: 'size', type: 'number', default: 50, min: 10, max: 200 }]
    },
    {
        id: 'move-forward',
        type: 'moveForward',
        category: 'motion',
        label: 'Move Forward',
        color: '#4ECDC4',
        icon: '➡️',
        params: [{ name: 'steps', type: 'number', default: 1, min: -12, max: 12 }]
    },
    {
        id: 'turn-right',
        type: 'turnRight',
        category: 'motion',
        label: 'Turn Right',
        color: '#4ECDC4',
        icon: '↩️',
        params: [{ name: 'degrees', type: 'number', default: 90, min: 1, max: 360 }]
    },
    {
        id: 'turn-left',
        type: 'turnLeft',
        category: 'motion',
        label: 'Turn Left',
        color: '#4ECDC4',
        icon: '↪️',
        params: [{ name: 'degrees', type: 'number', default: 90, min: 1, max: 360 }]
    },
    {
        id: 'pen-up',
        type: 'penUp',
        category: 'motion',
        label: 'Pen Up',
        color: '#4ECDC4',
        icon: '✏️',
        params: []
    },
    {
        id: 'pen-down',
        type: 'penDown',
        category: 'motion',
        label: 'Pen Down',
        color: '#4ECDC4',
        icon: '🖊️',
        params: []
    },
    {
        id: 'draw-spiral',
        type: 'drawSpiral',
        category: 'motion',
        label: 'Draw Spiral',
        color: '#4ECDC4',
        icon: '🌀',
        params: [
            { name: 'turns', type: 'number', default: 3, min: 1, max: 10 },
            { name: 'spacing', type: 'number', default: 10, min: 5, max: 30 }
        ]
    },
    {
        id: 'draw-arc',
        type: 'drawArc',
        category: 'motion',
        label: 'Draw Arc',
        color: '#4ECDC4',
        icon: '🌙',
        params: [
            { name: 'radius', type: 'number', default: 50, min: 20, max: 150 },
            { name: 'angle', type: 'number', default: 180, min: 30, max: 360 }
        ]
    },
    {
        id: 'draw-zigzag',
        type: 'drawZigzag',
        category: 'motion',
        label: 'Draw Zigzag',
        color: '#4ECDC4',
        icon: '⚡',
        params: [
            { name: 'segments', type: 'number', default: 5, min: 2, max: 15 },
            { name: 'width', type: 'number', default: 30, min: 10, max: 80 }
        ]
    },
    {
        id: 'draw-wave',
        type: 'drawWave',
        category: 'motion',
        label: 'Draw Wave',
        color: '#4ECDC4',
        icon: '〰️',
        params: [
            { name: 'amplitude', type: 'number', default: 30, min: 10, max: 80 },
            { name: 'frequency', type: 'number', default: 3, min: 1, max: 8 }
        ]
    },
    {
        id: 'teleport',
        type: 'teleport',
        category: 'motion',
        label: 'Teleport',
        color: '#4ECDC4',
        icon: '✨',
        params: [
            { name: 'x', type: 'number', default: 0, min: -300, max: 300 },
            { name: 'y', type: 'number', default: 0, min: -200, max: 200 }
        ]
    },
    {
        id: 'set-color',
        type: 'setColor',
        category: 'color',
        label: 'Set Color',
        color: '#A06CD5',
        icon: '🎨',
        params: [{
            name: 'color',
            type: 'select',
            default: 'red',
            options: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'black', 'white']
        }]
    },
    {
        id: 'set-brush',
        type: 'setBrush',
        category: 'color',
        label: 'Set Brush Size',
        color: '#A06CD5',
        icon: '🖌️',
        params: [{ name: 'size', type: 'number', default: 3, min: 1, max: 20 }]
    },
    {
        id: 'rainbow-mode',
        type: 'rainbowMode',
        category: 'color',
        label: 'Rainbow Mode',
        color: '#A06CD5',
        icon: '🌈',
        params: [{ name: 'speed', type: 'number', default: 5, min: 1, max: 20 }]
    },
    {
        id: 'gradient-color',
        type: 'gradientColor',
        category: 'color',
        label: 'Gradient',
        color: '#A06CD5',
        icon: '🎨',
        params: [
            {
                name: 'from',
                type: 'select',
                default: 'red',
                options: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink']
            },
            {
                name: 'to',
                type: 'select',
                default: 'blue',
                options: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink']
            }
        ]
    },
    {
        id: 'glow-effect',
        type: 'glowEffect',
        category: 'color',
        label: 'Glow Effect',
        color: '#A06CD5',
        icon: '✨',
        params: [{ name: 'intensity', type: 'number', default: 10, min: 0, max: 30 }]
    },
    {
        id: 'set-opacity',
        type: 'setOpacity',
        category: 'color',
        label: 'Set Opacity',
        color: '#A06CD5',
        icon: '👻',
        params: [{ name: 'opacity', type: 'number', default: 100, min: 10, max: 100 }]
    },
    {
        id: 'random-color',
        type: 'randomColor',
        category: 'color',
        label: 'Random Color',
        color: '#A06CD5',
        icon: '🎲',
        params: []
    },
    {
        id: 'repeat-magic',
        type: 'repeatMagic',
        category: 'control',
        label: 'Repeat Magic',
        color: '#FFE66D',
        icon: '✨',
        params: [{ name: 'times', type: 'number', default: 4, min: 1, max: 20 }]
    },
    {
        id: 'walk',
        type: 'walk',
        category: 'animation',
        label: 'Walk',
        color: '#95D5B2',
        icon: '🚶',
        params: [{ name: 'steps', type: 'number', default: 100, min: 10, max: 500 }]
    },
    {
        id: 'jump',
        type: 'jump',
        category: 'animation',
        label: 'Jump',
        color: '#95D5B2',
        icon: '🦘',
        params: [{ name: 'height', type: 'number', default: 50, min: 10, max: 200 }]
    },
    {
        id: 'wave',
        type: 'wave',
        category: 'animation',
        label: 'Wave',
        color: '#95D5B2',
        icon: '👋',
        params: []
    },
    {
        id: 'say',
        type: 'say',
        category: 'animation',
        label: 'Say',
        color: '#95D5B2',
        icon: '💬',
        params: [{ name: 'text', type: 'string', default: 'Hello!' }]
    },
    {
        id: 'wait',
        type: 'wait',
        category: 'animation',
        label: 'Wait',
        color: '#95D5B2',
        icon: '⏰',
        params: [{ name: 'seconds', type: 'number', default: 1, min: 0.1, max: 10 }]
    },
    {
        id: 'play-note',
        type: 'playNote',
        category: 'music',
        label: 'Play Note',
        color: '#FF85A2',
        icon: '🎵',
        params: [{
            name: 'note',
            type: 'select',
            default: 'C',
            options: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
        }]
    },
    {
        id: 'play-drum',
        type: 'playDrum',
        category: 'music',
        label: 'Play Drum',
        color: '#FF85A2',
        icon: '🥁',
        params: [{
            name: 'type',
            type: 'select',
            default: 'kick',
            options: ['kick', 'snare', 'hihat', 'clap']
        }]
    }
];

export const getBlockDefinition = (type: string): BlockDefinition | undefined => {
    return BLOCK_DEFINITIONS.find(def => def.type === type);
};

export const getBlocksByCategory = (category: BlockCategory): BlockDefinition[] => {
    return BLOCK_DEFINITIONS.filter(def => def.category === category);
};
