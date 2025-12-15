import type { Block } from '../../types/blocks';

export interface ExecutionContext {
    x: number;
    y: number;
    angle: number;
    penDown: boolean;
    color: string;
    brushSize: number;
    stepCount: number;
}

export interface ExecutionResult {
    success: boolean;
    context: ExecutionContext;
    error?: string;
    events: ExecutionEvent[];
}

export interface ExecutionEvent {
    type: 'draw' | 'move' | 'turn' | 'color' | 'sound' | 'animation' | 'speech';
    data: Record<string, unknown>;
    timestamp: number;
}

const MAX_STEPS = 500;
const MAX_EXECUTION_TIME = 3000;

export function createInitialContext(): ExecutionContext {
    return {
        x: 300,
        y: 200,
        angle: -90,
        penDown: true,
        color: '#2D3436',
        brushSize: 3,
        stepCount: 0
    };
}

export function interpretBlocks(blocks: Block[]): ExecutionResult {
    const context = createInitialContext();
    const events: ExecutionEvent[] = [];
    const startTime = Date.now();

    function checkLimits(): string | null {
        if (context.stepCount >= MAX_STEPS) {
            return 'Too many steps! Maximum is 500.';
        }
        if (Date.now() - startTime > MAX_EXECUTION_TIME) {
            return 'Execution took too long! Maximum is 3 seconds.';
        }
        return null;
    }

    function executeBlock(block: Block): string | null {
        context.stepCount++;
        const limitError = checkLimits();
        if (limitError) return limitError;

        const { type, params, children } = block;
        const timestamp = Date.now() - startTime;

        switch (type) {
            case 'drawCircle':
                events.push({
                    type: 'draw',
                    data: { shape: 'circle', x: context.x, y: context.y, size: params.size, color: context.color },
                    timestamp
                });
                break;

            case 'drawSquare':
                events.push({
                    type: 'draw',
                    data: { shape: 'square', x: context.x, y: context.y, size: params.size, color: context.color },
                    timestamp
                });
                break;

            case 'drawTriangle':
                events.push({
                    type: 'draw',
                    data: { shape: 'triangle', x: context.x, y: context.y, size: params.size, color: context.color },
                    timestamp
                });
                break;

            case 'drawStar':
                events.push({
                    type: 'draw',
                    data: { shape: 'star', x: context.x, y: context.y, size: params.size, color: context.color },
                    timestamp
                });
                break;

            case 'drawHeart':
                events.push({
                    type: 'draw',
                    data: { shape: 'heart', x: context.x, y: context.y, size: params.size, color: context.color },
                    timestamp
                });
                break;

            case 'moveForward': {
                const steps = params.steps as number;
                const rad = (context.angle * Math.PI) / 180;
                const oldX = context.x;
                const oldY = context.y;
                context.x += Math.cos(rad) * steps;
                context.y += Math.sin(rad) * steps;

                if (context.penDown) {
                    events.push({
                        type: 'draw',
                        data: {
                            shape: 'line',
                            fromX: oldX, fromY: oldY,
                            toX: context.x, toY: context.y,
                            color: context.color,
                            size: context.brushSize
                        },
                        timestamp
                    });
                }

                events.push({
                    type: 'move',
                    data: { x: context.x, y: context.y },
                    timestamp
                });
                break;
            }

            case 'turnRight':
                context.angle += params.degrees as number;
                events.push({
                    type: 'turn',
                    data: { angle: context.angle },
                    timestamp
                });
                break;

            case 'turnLeft':
                context.angle -= params.degrees as number;
                events.push({
                    type: 'turn',
                    data: { angle: context.angle },
                    timestamp
                });
                break;

            case 'penUp':
                context.penDown = false;
                break;

            case 'penDown':
                context.penDown = true;
                break;

            case 'setColor':
                context.color = params.color as string;
                events.push({
                    type: 'color',
                    data: { color: context.color },
                    timestamp
                });
                break;

            case 'setBrush':
                context.brushSize = params.size as number;
                break;

            case 'repeatMagic': {
                const times = params.times as number;
                if (children && children.length > 0) {
                    for (let i = 0; i < times; i++) {
                        for (const child of children) {
                            const error = executeBlock(child);
                            if (error) return error;
                        }
                    }
                }
                break;
            }

            case 'walk':
                events.push({
                    type: 'animation',
                    data: { action: 'walk', steps: params.steps },
                    timestamp
                });
                break;

            case 'jump':
                events.push({
                    type: 'animation',
                    data: { action: 'jump', height: params.height },
                    timestamp
                });
                break;

            case 'wave':
                events.push({
                    type: 'animation',
                    data: { action: 'wave' },
                    timestamp
                });
                break;

            case 'say':
                events.push({
                    type: 'speech',
                    data: { text: params.text },
                    timestamp
                });
                break;

            case 'wait':
                break;

            case 'playNote':
                events.push({
                    type: 'sound',
                    data: { soundType: 'note', note: params.note },
                    timestamp
                });
                break;

            case 'playDrum':
                events.push({
                    type: 'sound',
                    data: { soundType: 'drum', drumType: params.type },
                    timestamp
                });
                break;
        }

        return null;
    }

    for (const block of blocks) {
        const error = executeBlock(block);
        if (error) {
            return { success: false, context, error, events };
        }
    }

    return { success: true, context, events };
}

export function serializeBlocks(blocks: Block[]): string {
    return JSON.stringify(blocks);
}

export function deserializeBlocks(json: string): Block[] {
    try {
        return JSON.parse(json);
    } catch {
        return [];
    }
}
