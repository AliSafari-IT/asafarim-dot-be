import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type MouseEvent,
} from "react";
import { Camera, Check, FolderOpen, Trash2 } from "lucide-react";
import { useAuth } from "@asafarim/shared-ui-react";
import { useStore } from "../../core/state/useStore";
import { useProgressSync } from "../../hooks/useProgressSync";
import { mediaApi, type MediaAssetDto } from "../../services/mediaApi";
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
  rainbowMode: boolean;
  rainbowSpeed: number;
  rainbowHue: number;
  gradientMode: boolean;
  gradientFrom: string;
  gradientTo: string;
  glowIntensity: number;
  opacity: number;
}

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedDrawings, setSavedDrawings] = useState<MediaAssetDto[]>([]);
  const [loadingDrawings, setLoadingDrawings] = useState(false);
  const [loadedMediaId, setLoadedMediaId] = useState<string | null>(null);
  const blocks = useStore((state) => state.editor.blocks);
  const setBlocks = useStore((state) => state.setBlocks);
  const isPlaying = useStore((state) => state.editor.isPlaying);
  const currentStep = useStore((state) => state.editor.currentStep);
  const step = useStore((state) => state.step);
  const stop = useStore((state) => state.stop);
  const showStickerReward = useStore((state) => state.showStickerReward);
  const { user, isAuthenticated } = useAuth();
  const { updateProgress } = useProgressSync();

  const handleLoadScript = useCallback(async () => {
    setShowLoadModal(true);
    setLoadingDrawings(true);
    try {
      const drawings = await mediaApi.listMedia(
        undefined,
        "drawing",
        isAuthenticated ? true : undefined
      );
      setSavedDrawings(drawings.filter((d) => d.scriptJson));
    } catch (error) {
      console.error("Failed to load drawings:", error);
    } finally {
      setLoadingDrawings(false);
    }
  }, [isAuthenticated]);

  const handleSelectDrawing = useCallback(
    (drawing: MediaAssetDto) => {
      if (drawing.scriptJson) {
        try {
          const loadedBlocks = JSON.parse(drawing.scriptJson);
          setBlocks(loadedBlocks);
          setLoadedMediaId(drawing.id);
          setShowLoadModal(false);
        } catch (error) {
          console.error("Failed to parse script:", error);
        }
      }
    },
    [setBlocks]
  );

  const handleDeleteDrawing = useCallback(
    async (drawingId: string, e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (!confirm("Delete this drawing?")) return;

      try {
        await mediaApi.deleteMedia(drawingId);
        setSavedDrawings((prev) => prev.filter((d) => d.id !== drawingId));
        if (loadedMediaId === drawingId) {
          setLoadedMediaId(null);
        }
      } catch (error) {
        console.error("Failed to delete drawing:", error);
        alert("Failed to delete drawing. Please try again.");
      }
    },
    [loadedMediaId]
  );

  const handleSave = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedMediaId) return;

    setSaveStatus("saving");
    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });

      if (!blob) {
        setSaveStatus("idle");
        return;
      }

      await mediaApi.updateMedia(loadedMediaId, {
        file: blob,
        scriptJson: JSON.stringify(blocks),
      });

      const updatedDrawings = await mediaApi.listMedia(
        undefined,
        "drawing",
        isAuthenticated ? true : undefined
      );
      setSavedDrawings(updatedDrawings.filter((d) => d.scriptJson));

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save drawing:", error);
      setSaveStatus("idle");
    }
  }, [blocks, loadedMediaId]);

  const handleSaveAs = useCallback(async () => {
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
      const newMedia = await mediaApi.uploadMedia({
        file: blob,
        title,
        source: "drawing",
        width: canvas.width,
        height: canvas.height,
        scriptJson: JSON.stringify(blocks),
      });

      setLoadedMediaId(newMedia.id);

      const updatedDrawings = await mediaApi.listMedia(
        undefined,
        "drawing",
        isAuthenticated ? true : undefined
      );
      setSavedDrawings(updatedDrawings.filter((d) => d.scriptJson));

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save drawing:", error);
      setSaveStatus("idle");
    }
  }, [blocks]);

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
        rainbowMode: false,
        rainbowSpeed: 5,
        rainbowHue: 0,
        gradientMode: false,
        gradientFrom: "red",
        gradientTo: "blue",
        glowIntensity: 0,
        opacity: 100,
      };

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const getColor = () => {
        if (turtle.rainbowMode) {
          turtle.rainbowHue = (turtle.rainbowHue + turtle.rainbowSpeed) % 360;
          return `hsl(${turtle.rainbowHue}, 80%, 60%)`;
        }
        if (turtle.gradientMode) {
          const fromColor = COLORS[turtle.gradientFrom] || turtle.gradientFrom;
          const toColor = COLORS[turtle.gradientTo] || turtle.gradientTo;
          const gradient = ctx.createLinearGradient(turtle.x - 50, turtle.y - 50, turtle.x + 50, turtle.y + 50);
          gradient.addColorStop(0, fromColor);
          gradient.addColorStop(1, toColor);
          return gradient;
        }
        return turtle.color;
      };

      const applyEffects = () => {
        ctx.globalAlpha = turtle.opacity / 100;
        if (turtle.glowIntensity > 0) {
          ctx.shadowBlur = turtle.glowIntensity;
          ctx.shadowColor = turtle.color;
        } else {
          ctx.shadowBlur = 0;
        }
      };

      const drawLine = (
        fromX: number,
        fromY: number,
        toX: number,
        toY: number
      ) => {
        if (turtle.penDown) {
          applyEffects();
          ctx.beginPath();
          ctx.strokeStyle = getColor();
          ctx.lineWidth = turtle.brushSize;
          ctx.moveTo(fromX, fromY);
          ctx.lineTo(toX, toY);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }
      };

      const drawShape = (shape: string, size: number) => {
        applyEffects();
        ctx.fillStyle = getColor();
        ctx.strokeStyle = getColor();
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
          case "heart":
            const s = size / 2;
            const x = turtle.x;
            const y = turtle.y;

            ctx.beginPath();

            // Bottom point
            ctx.moveTo(x, y + s * 0.6);

            // Left half
            ctx.bezierCurveTo(
              x - s * 0.8,
              y + s * 0.1,
              x - s * 0.8,
              y - s * 0.4,
              x,
              y - s * 0.1
            );

            // Right half
            ctx.bezierCurveTo(
              x + s * 0.8,
              y - s * 0.4,
              x + s * 0.8,
              y + s * 0.1,
              x,
              y + s * 0.6
            );

            ctx.closePath();
            ctx.fill();
            break;
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
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
          case "drawHeart":
            drawShape("heart", params.size as number);
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
          case "drawSpiral": {
            const turns = params.turns as number;
            const spacing = params.spacing as number;
            const segments = turns * 20;
            for (let i = 0; i < segments; i++) {
              const angle = (i / segments) * turns * Math.PI * 2;
              const radius = (i / segments) * spacing * turns;
              const newX = turtle.x + Math.cos(angle) * radius;
              const newY = turtle.y + Math.sin(angle) * radius;
              drawLine(turtle.x, turtle.y, newX, newY);
              turtle.x = newX;
              turtle.y = newY;
            }
            break;
          }
          case "drawArc": {
            const radius = params.radius as number;
            const arcAngle = params.angle as number;
            const segments = Math.ceil(arcAngle / 5);
            const startAngle = turtle.angle;
            for (let i = 0; i <= segments; i++) {
              const currentAngle = startAngle + (arcAngle * i) / segments;
              const rad = (currentAngle * Math.PI) / 180;
              const newX = turtle.x + Math.cos(rad) * (radius / segments);
              const newY = turtle.y + Math.sin(rad) * (radius / segments);
              drawLine(turtle.x, turtle.y, newX, newY);
              turtle.x = newX;
              turtle.y = newY;
            }
            turtle.angle = startAngle + arcAngle;
            break;
          }
          case "drawZigzag": {
            const segments = params.segments as number;
            const width = params.width as number;
            const segmentLength = 40;
            for (let i = 0; i < segments; i++) {
              const direction = i % 2 === 0 ? 1 : -1;
              const perpAngle = turtle.angle + 90 * direction;
              const rad = (perpAngle * Math.PI) / 180;
              const newX = turtle.x + Math.cos(rad) * width;
              const newY = turtle.y + Math.sin(rad) * width;
              drawLine(turtle.x, turtle.y, newX, newY);
              turtle.x = newX;
              turtle.y = newY;
              const forwardRad = (turtle.angle * Math.PI) / 180;
              const forwardX = turtle.x + Math.cos(forwardRad) * segmentLength;
              const forwardY = turtle.y + Math.sin(forwardRad) * segmentLength;
              drawLine(turtle.x, turtle.y, forwardX, forwardY);
              turtle.x = forwardX;
              turtle.y = forwardY;
            }
            break;
          }
          case "drawWave": {
            const amplitude = params.amplitude as number;
            const frequency = params.frequency as number;
            const segments = frequency * 20;
            const waveLength = 200;
            for (let i = 0; i <= segments; i++) {
              const t = i / segments;
              const forwardRad = (turtle.angle * Math.PI) / 180;
              const perpRad = forwardRad + Math.PI / 2;
              const offset = Math.sin(t * frequency * Math.PI * 2) * amplitude;
              const forwardDist = (waveLength * t);
              const newX = turtle.x + Math.cos(forwardRad) * forwardDist + Math.cos(perpRad) * offset;
              const newY = turtle.y + Math.sin(forwardRad) * forwardDist + Math.sin(perpRad) * offset;
              if (i > 0) {
                drawLine(turtle.x, turtle.y, newX, newY);
              }
              turtle.x = newX;
              turtle.y = newY;
            }
            break;
          }
          case "teleport": {
            const offsetX = params.x as number;
            const offsetY = params.y as number;
            turtle.x = canvas.width / 2 + offsetX;
            turtle.y = canvas.height / 2 + offsetY;
            break;
          }
          case "setColor":
            turtle.color =
              COLORS[params.color as string] || (params.color as string);
            break;
          case "setBrush":
            turtle.brushSize = params.size as number;
            break;
          case "rainbowMode":
            turtle.rainbowMode = true;
            turtle.rainbowSpeed = params.speed as number;
            turtle.gradientMode = false;
            break;
          case "gradientColor":
            turtle.gradientMode = true;
            turtle.gradientFrom = params.from as string;
            turtle.gradientTo = params.to as string;
            turtle.rainbowMode = false;
            break;
          case "glowEffect":
            turtle.glowIntensity = params.intensity as number;
            break;
          case "setOpacity":
            turtle.opacity = params.opacity as number;
            break;
          case "randomColor": {
            const colors = Object.keys(COLORS);
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            turtle.color = COLORS[randomColor];
            turtle.rainbowMode = false;
            turtle.gradientMode = false;
            break;
          }
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
        const wasShown = showStickerReward(
          "first-circle",
          "You drew your first circle!"
        );
        if (wasShown) {
          updateProgress({
            mode: "Drawing",
            addModeSticker: "first-circle",
          }).catch(() => {});
        }
      } else if (colorCount >= 3) {
        const wasShown = showStickerReward(
          "rainbow-artist",
          "Beautiful colors!"
        );
        if (wasShown) {
          updateProgress({
            mode: "Drawing",
            addModeSticker: "rainbow-artist",
          }).catch(() => {});
        }
      } else if (hasRepeat) {
        const wasShown = showStickerReward(
          "pattern-power",
          "Amazing pattern magic!"
        );
        if (wasShown) {
          updateProgress({
            mode: "Drawing",
            addModeSticker: "pattern-power",
          }).catch(() => {});
        }
      }
    },
    [showStickerReward, updateProgress]
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
      <div className="canvas-actions">
        <button
          className="canvas-load-btn"
          onClick={handleLoadScript}
          title="Load Saved Script"
        >
          <FolderOpen size={18} />
          Load
        </button>
        {loadedMediaId && (
          <button
            className={`canvas-save-btn ${saveStatus}`}
            onClick={handleSave}
            disabled={saveStatus === "saving" || blocks.length === 0}
            title="Save (Update Current)"
          >
            {saveStatus === "saved" ? (
              <Check size={18} />
            ) : (
              <Camera size={18} />
            )}
            {saveStatus === "idle" && "Save"}
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "Saved!"}
          </button>
        )}
        <button
          className={`canvas-save-btn ${saveStatus}`}
          onClick={handleSaveAs}
          disabled={saveStatus === "saving" || blocks.length === 0}
          title="Save As (Create New)"
        >
          {saveStatus === "saved" ? <Check size={18} /> : <Camera size={18} />}
          {saveStatus === "idle" && "Save As"}
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "saved" && "Saved!"}
        </button>
      </div>

      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Load Saved Script</h2>
            {loadingDrawings ? (
              <p>Loading...</p>
            ) : savedDrawings.length === 0 ? (
              <p>No saved drawings with scripts found.</p>
            ) : (
              <div className="saved-drawings-grid">
                {savedDrawings.map((drawing) => {
                  const currentUserId =
                    (
                      user as unknown as {
                        id?: string;
                        userId?: string;
                        sub?: string;
                      } | null
                    )?.id ??
                    (
                      user as unknown as {
                        id?: string;
                        userId?: string;
                        sub?: string;
                      } | null
                    )?.userId ??
                    (
                      user as unknown as {
                        id?: string;
                        userId?: string;
                        sub?: string;
                      } | null
                    )?.sub ??
                    null;

                  const isOwner =
                    !!currentUserId && drawing.userId === currentUserId;
                  return (
                    <div
                      key={drawing.id}
                      className="saved-drawing-card"
                      onClick={() => handleSelectDrawing(drawing)}
                    >
                      <img
                        src={mediaApi.getContentUrl(drawing.id)}
                        alt={drawing.title}
                      />
                      <p>{drawing.title}</p>
                      {isOwner && (
                        <button
                          className="delete-drawing-btn"
                          onClick={(e) => handleDeleteDrawing(drawing.id, e)}
                          title="Delete this drawing"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <button
              className="btn-secondary"
              onClick={() => setShowLoadModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
