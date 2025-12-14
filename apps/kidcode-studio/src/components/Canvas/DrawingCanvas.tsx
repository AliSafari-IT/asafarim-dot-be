import { useRef, useEffect, useCallback, useState } from "react";
import { Camera, Check } from "lucide-react";
import { useStore } from "../../core/state/useStore";
import { mediaApi } from "../../services/mediaApi";
import type { Block } from "../../types/blocks";
import "./Canvas.css";

const COLORS: Record<string, string> = {
  red: "#FF6B6B",
  orange: "#FF9F43",
  yellow: "#FFE66D",
  green: "#95D5B2",
  blue: "#45B7D1",
  purple: "#A06CD5",
  pink: "#FF85A2",
  black: "#2D3436",
  white: "#FFFFFF",
};

interface TurtleState {
  x: number;
  y: number;
  angle: number;
  penDown: boolean;
  color: string;
  brushSize: number;
}

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const blocks = useStore((state) => state.editor.blocks);
  const isPlaying = useStore((state) => state.editor.isPlaying);
  const currentStep = useStore((state) => state.editor.currentStep);
  const step = useStore((state) => state.step);
  const stop = useStore((state) => state.stop);
  const showStickerReward = useStore((state) => state.showStickerReward);

  const handleSaveToAlbum = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSaveStatus("saving");
    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });

      if (!blob) {
        setSaveStatus("idle");
        return;
      }

      const title = `Drawing ${new Date().toLocaleString()}`;
      await mediaApi.uploadMedia({
        file: blob,
        title,
        source: "drawing",
        width: canvas.width,
        height: canvas.height,
      });

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save drawing:", error);
      setSaveStatus("idle");
    }
  }, []);

  const executeBlocks = useCallback(
    (ctx: CanvasRenderingContext2D, blocksToRun: Block[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const turtle: TurtleState = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        angle: -90,
        penDown: true,
        color: "#2D3436",
        brushSize: 3,
      };

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const drawLine = (
        fromX: number,
        fromY: number,
        toX: number,
        toY: number
      ) => {
        if (turtle.penDown) {
          ctx.beginPath();
          ctx.strokeStyle = turtle.color;
          ctx.lineWidth = turtle.brushSize;
          ctx.moveTo(fromX, fromY);
          ctx.lineTo(toX, toY);
          ctx.stroke();
        }
      };

      const drawShape = (shape: string, size: number) => {
        ctx.fillStyle = turtle.color;
        ctx.strokeStyle = turtle.color;
        ctx.lineWidth = turtle.brushSize;

        switch (shape) {
          case "circle":
            ctx.beginPath();
            ctx.arc(turtle.x, turtle.y, size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "square":
            ctx.fillRect(turtle.x - size / 2, turtle.y - size / 2, size, size);
            break;
          case "triangle":
            ctx.beginPath();
            ctx.moveTo(turtle.x, turtle.y - size / 2);
            ctx.lineTo(turtle.x - size / 2, turtle.y + size / 2);
            ctx.lineTo(turtle.x + size / 2, turtle.y + size / 2);
            ctx.closePath();
            ctx.fill();
            break;
          case "star":
            const spikes = 5;
            const outerRadius = size / 2;
            const innerRadius = size / 4;
            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
              const radius = i % 2 === 0 ? outerRadius : innerRadius;
              const angle = (Math.PI / spikes) * i - Math.PI / 2;
              const x = turtle.x + Math.cos(angle) * radius;
              const y = turtle.y + Math.sin(angle) * radius;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            break;
        }
      };

      const executeBlock = (block: Block) => {
        const { type, params } = block;

        switch (type) {
          case "drawCircle":
            drawShape("circle", params.size as number);
            break;
          case "drawSquare":
            drawShape("square", params.size as number);
            break;
          case "drawTriangle":
            drawShape("triangle", params.size as number);
            break;
          case "drawStar":
            drawShape("star", params.size as number);
            break;
          case "moveForward": {
            const steps = params.steps as number;
            const rad = (turtle.angle * Math.PI) / 180;
            const newX = turtle.x + Math.cos(rad) * steps;
            const newY = turtle.y + Math.sin(rad) * steps;
            drawLine(turtle.x, turtle.y, newX, newY);
            turtle.x = newX;
            turtle.y = newY;
            break;
          }
          case "turnRight":
            turtle.angle += params.degrees as number;
            break;
          case "turnLeft":
            turtle.angle -= params.degrees as number;
            break;
          case "penUp":
            turtle.penDown = false;
            break;
          case "penDown":
            turtle.penDown = true;
            break;
          case "setColor":
            turtle.color =
              COLORS[params.color as string] || (params.color as string);
            break;
          case "setBrush":
            turtle.brushSize = params.size as number;
            break;
          case "repeatMagic": {
            const times = params.times as number;
            const angleStep = 360 / times;
            for (let i = 0; i < times; i++) {
              turtle.angle += angleStep;
            }
            break;
          }
        }
      };

      const expandBlocks = (inputBlocks: Block[]): Block[] => {
        const expanded: Block[] = [];
        for (const block of inputBlocks) {
          if (block.type === "repeatMagic") {
            const times = block.params.times as number;
            const children = block.children || [];
            for (let i = 0; i < times; i++) {
              expanded.push(...children);
            }
          } else {
            expanded.push(block);
          }
        }
        return expanded;
      };

      const expandedBlocks = expandBlocks(blocksToRun);
      expandedBlocks.forEach(executeBlock);

      const hasCircle = blocksToRun.some((b) => b.type === "drawCircle");
      const colorCount = new Set(
        blocksToRun
          .filter((b) => b.type === "setColor")
          .map((b) => b.params.color)
      ).size;
      const hasRepeat = blocksToRun.some((b) => b.type === "repeatMagic");

      if (hasCircle && blocksToRun.length === 1) {
        showStickerReward("first-circle", "You drew your first circle!");
      } else if (colorCount >= 3) {
        showStickerReward("rainbow-artist", "Beautiful colors!");
      } else if (hasRepeat) {
        showStickerReward("pattern-power", "Amazing pattern magic!");
      }
    },
    [showStickerReward]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    executeBlocks(ctx, blocks);
  }, [blocks, executeBlocks]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < blocks.length) {
        step();
      } else {
        stop();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, blocks.length, step, stop]);

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="drawing-canvas"
      />
      <button
        className={`canvas-save-btn ${saveStatus}`}
        onClick={handleSaveToAlbum}
        disabled={saveStatus === "saving" || blocks.length === 0}
        title="Save to Photo Album"
      >
        {saveStatus === "saved" ? <Check size={18} /> : <Camera size={18} />}
        {saveStatus === "idle" && "Save"}
        {saveStatus === "saving" && "Saving..."}
        {saveStatus === "saved" && "Saved!"}
      </button>
    </div>
  );
}
