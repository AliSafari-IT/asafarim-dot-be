import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type MouseEvent,
} from "react";
import { Camera, Check, FolderOpen, Trash2 } from "lucide-react";
import { useAuth } from "@asafarim/shared-ui-react";
import BlockPalette from "../../components/BlockEditor/BlockPalette";
import BlockScript from "../../components/BlockEditor/BlockScript";
import ControlsBar from "../../components/BlockEditor/ControlsBar";
import { useStore } from "../../core/state/useStore";
import { mediaApi, type MediaAssetDto } from "../../services/mediaApi";
import "../../components/Canvas/Canvas.css";
import "./MusicBlocks.css";
import { useProgressSync } from "@/hooks/useProgressSync";

const NOTE_FREQUENCIES: Record<string, number> = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.0,
  A: 440.0,
  B: 493.88,
};

const NOTES = ["C", "D", "E", "F", "G", "A", "B"];

export default function MusicBlocks() {
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const [visualizerBars, setVisualizerBars] = useState<number[]>([
    20, 30, 40, 50, 40, 30, 20,
  ]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedScripts, setSavedScripts] = useState<MediaAssetDto[]>([]);
  const [loadingScripts, setLoadingScripts] = useState(false);
  const [loadedMediaId, setLoadedMediaId] = useState<string | null>(null);

  const blocks = useStore((state) => state.editor.blocks);
  const setBlocks = useStore((state) => state.setBlocks);
  const isPlaying = useStore((state) => state.editor.isPlaying);
  const currentStep = useStore((state) => state.editor.currentStep);
  const step = useStore((state) => state.step);
  const stop = useStore((state) => state.stop);
  const showStickerReward = useStore((state) => state.showStickerReward);
  const setActiveMode = useStore((state) => state.setActiveMode);
  const { user, isAuthenticated } = useAuth();
  const { updateProgress } = useProgressSync();

  const createMusicThumbnail = useCallback(async () => {
    const width = 600;
    const height = 400;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const style = getComputedStyle(document.documentElement);
    const kidPrimary = style.getPropertyValue("--kid-primary").trim();
    const kidSecondary = style.getPropertyValue("--kid-secondary").trim();
    const kidAccent = style.getPropertyValue("--kid-accent").trim();
    const kidSurface = style.getPropertyValue("--kid-surface").trim();
    const kidText = style.getPropertyValue("--kid-text").trim();

    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, kidPrimary || kidSecondary);
    bg.addColorStop(1, kidAccent || kidSecondary);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Decorative bars
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = kidSurface || kidSecondary || kidPrimary;
    const barCount = 7;
    const barW = 44;
    const gap = 18;
    const startX = Math.floor(
      (width - (barCount * barW + (barCount - 1) * gap)) / 2
    );
    for (let i = 0; i < barCount; i++) {
      const h = 40 + ((i * 19) % 80);
      const x = startX + i * (barW + gap);
      const y = height - 40 - h;
      ctx.fillRect(x, y, barW, h);
    }
    ctx.restore();

    // Header overlay
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = kidSurface || kidPrimary || kidSecondary;
    ctx.fillRect(16, 16, width - 32, 72);
    ctx.restore();

    ctx.fillStyle = kidText || "#ffffff";
    ctx.font = "700 26px system-ui";
    ctx.fillText("Music Script", 32, 50);

    ctx.font = "600 16px system-ui";
    ctx.fillText(`Blocks: ${blocks.length}`, 32, 78);

    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
  }, [blocks.length]);

  const handleLoadScript = useCallback(async () => {
    setShowLoadModal(true);
    setLoadingScripts(true);
    try {
      const scripts = await mediaApi.listMedia(
        undefined,
        "music",
        isAuthenticated ? true : undefined
      );
      setSavedScripts(scripts.filter((s) => s.scriptJson));
    } catch (error) {
      console.error("Failed to load music scripts:", error);
    } finally {
      setLoadingScripts(false);
    }
  }, [isAuthenticated]);

  const handleSelectScript = useCallback(
    (script: MediaAssetDto) => {
      if (!script.scriptJson) return;
      try {
        const loadedBlocks = JSON.parse(script.scriptJson);
        setBlocks(loadedBlocks);
        setLoadedMediaId(script.id);
        setShowLoadModal(false);
      } catch (error) {
        console.error("Failed to parse script:", error);
      }
    },
    [setBlocks]
  );

  const handleDeleteScript = useCallback(
    async (scriptId: string, e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (!confirm("Delete this music script?")) return;

      try {
        await mediaApi.deleteMedia(scriptId);
        setSavedScripts((prev) => prev.filter((s) => s.id !== scriptId));
        if (loadedMediaId === scriptId) {
          setLoadedMediaId(null);
        }
      } catch (error) {
        console.error("Failed to delete music script:", error);
        alert("Failed to delete music. Please try again.");
      }
    },
    [loadedMediaId]
  );

  const handleSave = useCallback(async () => {
    if (!loadedMediaId) return;
    if (blocks.length === 0) return;

    setSaveStatus("saving");
    try {
      const blob = await createMusicThumbnail();
      if (!blob) {
        setSaveStatus("idle");
        return;
      }

      await mediaApi.updateMedia(loadedMediaId, {
        file: blob,
        scriptJson: JSON.stringify(blocks),
      });

      const updated = await mediaApi.listMedia(
        undefined,
        "music",
        isAuthenticated ? true : undefined
      );
      setSavedScripts(updated.filter((s) => s.scriptJson));

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save music script:", error);
      setSaveStatus("idle");
    }
  }, [blocks, createMusicThumbnail, loadedMediaId]);

  const handleSaveAs = useCallback(async () => {
    if (blocks.length === 0) return;

    setSaveStatus("saving");
    try {
      const blob = await createMusicThumbnail();
      if (!blob) {
        setSaveStatus("idle");
        return;
      }

      const title = `Music ${new Date().toLocaleString()}`;
      const media = await mediaApi.uploadMedia({
        file: blob,
        title,
        source: "music",
        width: 600,
        height: 400,
        scriptJson: JSON.stringify(blocks),
      });

      setLoadedMediaId(media.id);

      const updated = await mediaApi.listMedia(
        undefined,
        "music",
        isAuthenticated ? true : undefined
      );
      setSavedScripts(updated.filter((s) => s.scriptJson));

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save music script:", error);
      setSaveStatus("idle");
    }
  }, [blocks, createMusicThumbnail]);

  useEffect(() => {
    setActiveMode("music");
  }, [setActiveMode]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playNote = useCallback(
    (note: string) => {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = NOTE_FREQUENCIES[note] || 440;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);

      setActiveNotes((prev) => [...prev, note]);
      setTimeout(() => {
        setActiveNotes((prev) => prev.filter((n) => n !== note));
      }, 300);

      const noteIndex = NOTES.indexOf(note);
      if (noteIndex >= 0) {
        setVisualizerBars((prev) => {
          const newBars = [...prev];
          newBars[noteIndex] = 100;
          return newBars;
        });
        setTimeout(() => {
          setVisualizerBars((prev) => {
            const newBars = [...prev];
            newBars[noteIndex] = 20 + Math.random() * 30;
            return newBars;
          });
        }, 200);
      }
    },
    [getAudioContext]
  );

  const playDrum = useCallback(
    (type: string) => {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      switch (type) {
        case "kick":
          oscillator.frequency.value = 150;
          oscillator.type = "sine";
          break;
        case "snare":
          oscillator.frequency.value = 200;
          oscillator.type = "triangle";
          break;
        case "hihat":
          oscillator.frequency.value = 800;
          oscillator.type = "square";
          break;
        case "clap":
          oscillator.frequency.value = 400;
          oscillator.type = "sawtooth";
          break;
      }

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);

      setVisualizerBars((prev) => prev.map(() => 60 + Math.random() * 40));
      setTimeout(() => {
        setVisualizerBars((prev) => prev.map(() => 20 + Math.random() * 30));
      }, 150);
    },
    [getAudioContext]
  );

  const executeCurrentBlock = useCallback(() => {
    if (currentStep < 0 || currentStep >= blocks.length) return;

    const block = blocks[currentStep];
    const { type, params } = block;

    switch (type) {
      case "playNote":
        playNote(params.note as string);
        break;
      case "playDrum":
        playDrum(params.type as string);
        break;
    }
  }, [blocks, currentStep, playNote, playDrum]);

  useEffect(() => {
    if (!isPlaying) return;

    executeCurrentBlock();

    const timer = setTimeout(() => {
      if (currentStep < blocks.length - 1) {
        step();
      } else {
        stop();
        const noteCount = blocks.filter((b) => b.type === "playNote").length;
        if (noteCount >= 3) {
          const wasShown = showStickerReward(
            "music-maker",
            "You created a melody!"
          );
          if (wasShown) {
            updateProgress({
              mode: "Music",
              addModeSticker: "music-maker",
            }).catch(() => {});
          }
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    currentStep,
    blocks,
    step,
    stop,
    executeCurrentBlock,
    showStickerReward,
    updateProgress,
  ]);

  return (
    <div className="music-blocks">
      <header className="studio-header">
        <h1>🎵 Music Blocks</h1>
        <p>Create melodies and beats with code!</p>
      </header>

      <div className="studio-layout">
        <aside className="studio-palette">
          <BlockPalette categories={["music"]} />
        </aside>

        <main className="studio-main">
          <div className="canvas-container">
            <div className="music-visualizer">
              {visualizerBars.map((height, index) => (
                <div
                  key={index}
                  className={`music-bar ${
                    activeNotes.includes(NOTES[index]) ? "active" : ""
                  }`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="piano-keys">
              {NOTES.map((note) => (
                <button
                  key={note}
                  className={`piano-key ${
                    activeNotes.includes(note) ? "active" : ""
                  }`}
                  onClick={() => playNote(note)}
                >
                  {note}
                </button>
              ))}
            </div>
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
                {saveStatus === "saved" ? (
                  <Check size={18} />
                ) : (
                  <Camera size={18} />
                )}
                {saveStatus === "idle" && "Save As"}
                {saveStatus === "saving" && "Saving..."}
                {saveStatus === "saved" && "Saved!"}
              </button>
            </div>
          </div>
          <ControlsBar />
        </main>

        <aside className="studio-script">
          <BlockScript />
        </aside>
      </div>

      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Load Saved Script</h2>
            {loadingScripts ? (
              <p>Loading...</p>
            ) : savedScripts.length === 0 ? (
              <p>No saved music scripts found.</p>
            ) : (
              <div className="saved-drawings-grid">
                {savedScripts.map((script) => {
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
                    !!currentUserId && script.userId === currentUserId;
                  return (
                    <div
                      key={script.id}
                      className="saved-drawing-card"
                      onClick={() => handleSelectScript(script)}
                    >
                      <img
                        src={mediaApi.getContentUrl(script.id)}
                        alt={script.title}
                      />
                      <p>{script.title}</p>
                      {isOwner && (
                        <button
                          className="delete-drawing-btn"
                          onClick={(e) => handleDeleteScript(script.id, e)}
                          title="Delete this music"
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
