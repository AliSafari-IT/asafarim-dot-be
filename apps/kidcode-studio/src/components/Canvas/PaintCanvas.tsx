import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type PointerEvent,
} from "react";
import {
  Camera,
  Check,
  FolderOpen,
  Trash2,
  Undo,
  Redo,
  Eraser,
} from "lucide-react";
import { useAuth } from "@asafarim/shared-ui-react";
import { useStore } from "../../core/state/useStore";
import { useProgressSync } from "../../hooks/useProgressSync";
import { mediaApi, type MediaAssetDto } from "../../services/mediaApi";
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

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function PaintCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<
    { x: number; y: number }[]
  >([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedDrawings, setSavedDrawings] = useState<MediaAssetDto[]>([]);
  const [loadingDrawings, setLoadingDrawings] = useState(false);
  const [loadedMediaId, setLoadedMediaId] = useState<string | null>(null);

  const paintStrokes = useStore((state) => state.editor.paintStrokes);
  const paintStamps = useStore((state) => state.editor.paintStamps);
  const paintBrushType = useStore((state) => state.editor.paintBrushType);
  const paintColor = useStore((state) => state.editor.paintColor);
  const paintBrushWidth = useStore((state) => state.editor.paintBrushWidth);
  const addPaintStroke = useStore((state) => state.addPaintStroke);
  const setPaintBrushType = useStore((state) => state.setPaintBrushType);
  const setPaintColor = useStore((state) => state.setPaintColor);
  const setPaintBrushWidth = useStore((state) => state.setPaintBrushWidth);
  const clearPaintStrokes = useStore((state) => state.clearPaintStrokes);
  const undoPaintStroke = useStore((state) => state.undoPaintStroke);
  const redoPaintStroke = useStore((state) => state.redoPaintStroke);
  const savePaintToUndo = useStore((state) => state.savePaintToUndo);
  const loadPaintData = useStore((state) => state.loadPaintData);
  const showStickerReward = useStore((state) => state.showStickerReward);

  const { isAuthenticated } = useAuth();
  const { updateProgress } = useProgressSync();

  const getCanvasPoint = (e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const point = getCanvasPoint(e);
    setCurrentPoints([point]);
  };

  const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const point = getCanvasPoint(e);
    setCurrentPoints((prev) => [...prev, point]);
  };

  const handlePointerUp = () => {
    if (!isDrawing || currentPoints.length === 0) return;

    savePaintToUndo();
    addPaintStroke({
      id: generateId(),
      points: currentPoints,
      color: paintColor,
      width: paintBrushWidth,
      brushType: paintBrushType,
    });

    setIsDrawing(false);
    setCurrentPoints([]);

    if (paintStrokes.length === 0) {
      const wasShown = showStickerReward(
        "first-circle",
        "Your first paint stroke!"
      );
      if (wasShown) {
        updateProgress({
          mode: "Drawing",
          addModeSticker: "first-circle",
        }).catch(() => {});
      }
    }

    const uniqueColors = new Set(
      paintStrokes.map((s) => s.color).concat([paintColor])
    );
    if (uniqueColors.size >= 3) {
      const wasShown = showStickerReward("rainbow-artist", "Beautiful colors!");
      if (wasShown) {
        updateProgress({
          mode: "Drawing",
          addModeSticker: "rainbow-artist",
        }).catch(() => {});
      }
    }
  };

  const renderStroke = (
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    color: string,
    width: number,
    brushType: string
  ) => {
    if (points.length === 0) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (brushType === "pen") {
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    } else if (brushType === "crayon") {
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = width * 1.5;
      for (let i = 0; i < points.length - 1; i++) {
        const jitter = Math.random() * 2 - 1;
        ctx.beginPath();
        ctx.moveTo(points[i].x + jitter, points[i].y + jitter);
        ctx.lineTo(points[i + 1].x + jitter, points[i + 1].y + jitter);
        ctx.stroke();
      }
    } else if (brushType === "watercolor") {
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = width * 2;
      ctx.filter = "blur(2px)";
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.filter = "none";
    }

    ctx.globalAlpha = 1.0;
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    paintStrokes.forEach((stroke) => {
      renderStroke(
        ctx,
        stroke.points,
        stroke.color,
        stroke.width,
        stroke.brushType
      );
    });

    paintStamps.forEach((stamp) => {
      const img = new Image();
      img.src = stamp.imageUrl;
      img.onload = () => {
        ctx.drawImage(
          img,
          stamp.x - stamp.size / 2,
          stamp.y - stamp.size / 2,
          stamp.size,
          stamp.size
        );
      };
    });

    if (isDrawing && currentPoints.length > 0) {
      renderStroke(
        ctx,
        currentPoints,
        paintColor,
        paintBrushWidth,
        paintBrushType
      );
    }
  }, [
    paintStrokes,
    paintStamps,
    isDrawing,
    currentPoints,
    paintColor,
    paintBrushWidth,
    paintBrushType,
  ]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const handleLoadScript = useCallback(async () => {
    setShowLoadModal(true);
    setLoadingDrawings(true);
    try {
      const drawings = await mediaApi.listMedia(
        undefined,
        "paint-lab",
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
          const data = JSON.parse(drawing.scriptJson);
          loadPaintData(data.strokes || [], data.stamps || []);
          setLoadedMediaId(drawing.id);
          setShowLoadModal(false);
        } catch (error) {
          console.error("Failed to parse script:", error);
        }
      }
    },
    [loadPaintData]
  );

  const handleDeleteDrawing = useCallback(
    async (drawingId: string, e: React.MouseEvent<HTMLButtonElement>) => {
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

      const scriptData = {
        strokes: paintStrokes,
        stamps: paintStamps,
      };

      await mediaApi.updateMedia(loadedMediaId, {
        file: blob,
        scriptJson: JSON.stringify(scriptData),
      });

      const updatedDrawings = await mediaApi.listMedia(
        undefined,
        "paint-lab",
        isAuthenticated ? true : undefined
      );
      setSavedDrawings(updatedDrawings.filter((d) => d.scriptJson));

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save drawing:", error);
      setSaveStatus("idle");
    }
  }, [paintStrokes, paintStamps, loadedMediaId, isAuthenticated]);

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

      const title = `Paint Lab ${new Date().toLocaleString()}`;
      const scriptData = {
        strokes: paintStrokes,
        stamps: paintStamps,
      };

      const newMedia = await mediaApi.uploadMedia({
        file: blob,
        title,
        source: "paint-lab",
        width: canvas.width,
        height: canvas.height,
        scriptJson: JSON.stringify(scriptData),
      });

      setLoadedMediaId(newMedia.id);

      const updatedDrawings = await mediaApi.listMedia(
        undefined,
        "paint-lab",
        isAuthenticated ? true : undefined
      );
      setSavedDrawings(updatedDrawings.filter((d) => d.scriptJson));

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save drawing:", error);
      setSaveStatus("idle");
    }
  }, [paintStrokes, paintStamps, isAuthenticated]);

  return (
    <div className="canvas-container">
      <div className="paint-toolbar">
        <div className="brush-types">
          <button
            className={paintBrushType === "pen" ? "active" : ""}
            onClick={() => setPaintBrushType("pen")}
            title="Pen"
          >
            🖊️
          </button>
          <button
            className={paintBrushType === "crayon" ? "active" : ""}
            onClick={() => setPaintBrushType("crayon")}
            title="Crayon"
          >
            🖍️
          </button>
          <button
            className={paintBrushType === "watercolor" ? "active" : ""}
            onClick={() => setPaintBrushType("watercolor")}
            title="Watercolor"
          >
            🎨
          </button>
        </div>

        <div className="color-picker">
          {Object.entries(COLORS).map(([name, hex]) => (
            <button
              key={name}
              className={paintColor === hex ? "active" : ""}
              style={{ backgroundColor: hex }}
              onClick={() => setPaintColor(hex)}
              title={name}
            />
          ))}
        </div>

        <div className="brush-width">
          <input
            type="range"
            min="1"
            max="20"
            value={paintBrushWidth}
            onChange={(e) => setPaintBrushWidth(Number(e.target.value))}
            title="Brush Width"
          />
          <span>{paintBrushWidth}px</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={960}
        height={600}
        className="drawing-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: "none" }}
      />

      <div className="canvas-actions">
        <button
          className="canvas-action-btn"
          onClick={undoPaintStroke}
          title="Undo"
        >
          <Undo size={18} />
        </button>
        <button
          className="canvas-action-btn"
          onClick={redoPaintStroke}
          title="Redo"
        >
          <Redo size={18} />
        </button>
        <button
          className="canvas-action-btn"
          onClick={clearPaintStrokes}
          title="Clear"
        >
          <Eraser size={18} />
        </button>
        <button
          className="canvas-load-btn"
          onClick={handleLoadScript}
          title="Load Saved"
        >
          <FolderOpen size={18} />
          Load
        </button>
        {loadedMediaId && (
          <button
            className={`canvas-save-btn ${saveStatus}`}
            onClick={handleSave}
            disabled={saveStatus === "saving" || paintStrokes.length === 0}
            title="Save"
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
          disabled={saveStatus === "saving" || paintStrokes.length === 0}
          title="Save As"
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
            <h2>Load Saved Drawing</h2>
            {loadingDrawings ? (
              <p>Loading...</p>
            ) : savedDrawings.length === 0 ? (
              <p>No saved drawings found.</p>
            ) : (
              <div className="saved-drawings-grid">
                {savedDrawings.map((drawing) => (
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
                    <button
                      className="delete-drawing-btn"
                      onClick={(e) => handleDeleteDrawing(drawing.id, e)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
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
