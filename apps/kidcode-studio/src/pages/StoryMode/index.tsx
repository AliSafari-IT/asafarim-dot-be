import { useState, useEffect, useCallback, type MouseEvent } from "react";
import { Camera, Check, FolderOpen, Trash2, ImagePlus, X } from "lucide-react";
import { useAuth, useNotifications } from "@asafarim/shared-ui-react";
import { useProgressSync } from "../../hooks/useProgressSync";
import { useNavigate } from "react-router-dom";
import BlockPalette from "../../components/BlockEditor/BlockPalette";
import BlockScript from "../../components/BlockEditor/BlockScript";
import ControlsBar from "../../components/BlockEditor/ControlsBar";
import { useStore } from "../../core/state/useStore";
import { mediaApi, type MediaAssetDto } from "../../services/mediaApi";
import {
  characterApi,
  type CharacterAssetDto,
} from "../../services/characterApi";
import "../../components/Canvas/Canvas.css";
import "./StoryMode.css";

const SETTINGS_ALBUM_NAME = "settings-images";
const MAX_TOTAL_BACKGROUNDS = 10;
const DEFAULT_BACKGROUNDS_COUNT = 3;
const MAX_CUSTOM_BACKGROUNDS =
  MAX_TOTAL_BACKGROUNDS - DEFAULT_BACKGROUNDS_COUNT;

interface CustomBackground {
  id: string;
  url: string;
  title: string;
}

const CHARACTERS = ["🧒", "👧", "🐱", "🐶", "🦊", "🐻", "🤖", "👽"];
const BACKGROUNDS = ["forest", "space", "city"] as const;
type BackgroundType = (typeof BACKGROUNDS)[number] | string;

export default function StoryMode() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [character, setCharacter] = useState<string | null>(null);
  const [customCharacters, setCustomCharacters] = useState<CharacterAssetDto[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedScripts, setSavedScripts] = useState<MediaAssetDto[]>([]);
  const [loadingScripts, setLoadingScripts] = useState(false);
  const [loadedMediaId, setLoadedMediaId] = useState<string | null>(null);
  const [background, setBackground] = useState<BackgroundType>("forest");
  const [customBackgrounds, setCustomBackgrounds] = useState<
    CustomBackground[]
  >([]);
  const [settingsAlbumId, setSettingsAlbumId] = useState<string | null>(null);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [albumImages, setAlbumImages] = useState<MediaAssetDto[]>([]);
  const [loadingAlbumImages, setLoadingAlbumImages] = useState(false);
  const [addingBackground, setAddingBackground] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 70 });
  const [animation, setAnimation] = useState<string | null>(null);
  const [speechText, setSpeechText] = useState<string | null>(null);

  const blocks = useStore((state) => state.editor.blocks);
  const setBlocks = useStore((state) => state.setBlocks);
  const isPlaying = useStore((state) => state.editor.isPlaying);
  const currentStep = useStore((state) => state.editor.currentStep);
  const step = useStore((state) => state.step);
  const stop = useStore((state) => state.stop);
  const showStickerReward = useStore((state) => state.showStickerReward);
  const setActiveMode = useStore((state) => state.setActiveMode);
  const { updateProgress } = useProgressSync();

  const createStoryThumbnail = useCallback(async () => {
    const width = 700;
    const height = 500;
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

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    if (background === "space") {
      grad.addColorStop(0, kidPrimary || kidSecondary);
      grad.addColorStop(1, kidAccent || kidSecondary);
    } else if (background === "city") {
      grad.addColorStop(0, kidAccent || kidSecondary);
      grad.addColorStop(1, kidPrimary || kidSecondary);
    } else {
      grad.addColorStop(0, kidSecondary || kidPrimary);
      grad.addColorStop(1, kidAccent || kidPrimary);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = kidSurface || kidPrimary || kidSecondary;
    ctx.fillRect(16, 16, width - 32, 64);
    ctx.restore();

    ctx.fillStyle = kidText || "#ffffff";
    ctx.font = "700 28px system-ui";
    ctx.fillText("Story Script", 32, 58);

    ctx.font = "600 16px system-ui";
    ctx.fillText(`Blocks: ${blocks.length}`, 32, 90);

    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
  }, [background, blocks.length]);

  const { user, isAuthenticated } = useAuth();

  const handleLoadScript = useCallback(async () => {
    setShowLoadModal(true);
    setLoadingScripts(true);
    try {
      const scripts = await mediaApi.listMedia(
        undefined,
        "story",
        isAuthenticated ? true : undefined
      );
      setSavedScripts(scripts.filter((s) => s.scriptJson));
    } catch (error) {
      console.error("Failed to load story scripts:", error);
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
      if (!confirm("Delete this story script?")) return;

      try {
        await mediaApi.deleteMedia(scriptId);
        setSavedScripts((prev) => prev.filter((s) => s.id !== scriptId));
        if (loadedMediaId === scriptId) {
          setLoadedMediaId(null);
        }
      } catch (error) {
        console.error("Failed to delete story script:", error);
        alert("Failed to delete story. Please try again.");
      }
    },
    [loadedMediaId]
  );

  const handleSave = useCallback(async () => {
    if (!loadedMediaId) return;
    if (blocks.length === 0) return;

    setSaveStatus("saving");
    try {
      const blob = await createStoryThumbnail();
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
        "story",
        isAuthenticated ? true : undefined
      );
      setSavedScripts(updated.filter((s) => s.scriptJson));

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save story script:", error);
      setSaveStatus("idle");
    }
  }, [blocks, createStoryThumbnail, loadedMediaId]);

  const handleSaveAs = useCallback(async () => {
    if (blocks.length === 0) return;

    setSaveStatus("saving");
    try {
      const blob = await createStoryThumbnail();
      if (!blob) {
        setSaveStatus("idle");
        return;
      }

      const title = `Story ${new Date().toLocaleString()}`;
      const media = await mediaApi.uploadMedia({
        file: blob,
        title,
        source: "story",
        width: 700,
        height: 500,
        scriptJson: JSON.stringify(blocks),
      });

      setLoadedMediaId(media.id);

      const updated = await mediaApi.listMedia(
        undefined,
        "story",
        isAuthenticated ? true : undefined
      );
      setSavedScripts(updated.filter((s) => s.scriptJson));

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save story script:", error);
      setSaveStatus("idle");
    }
  }, [blocks, createStoryThumbnail]);

  useEffect(() => {
    setActiveMode("story");
  }, [setActiveMode]);

  useEffect(() => {
    loadSettingsAlbum();
  }, []);

  async function loadSettingsAlbum() {
    try {
      const albums = await mediaApi.listAlbums(true);
      let settingsAlbum = albums.find((a) => a.name === SETTINGS_ALBUM_NAME);

      if (!settingsAlbum) {
        settingsAlbum = await mediaApi.createAlbum(
          SETTINGS_ALBUM_NAME,
          "Stage backgrounds and settings images"
        );
      }

      setSettingsAlbumId(settingsAlbum.id);

      const backgrounds = await mediaApi.listMedia(
        settingsAlbum.id,
        "story-background"
      );
      setCustomBackgrounds(
        backgrounds.map((b) => ({
          id: b.id,
          url: mediaApi.getContentUrl(b.id),
          title: b.title,
        }))
      );
    } catch (error) {
      console.error("Failed to load settings album:", error);
    }
  }

  const handleOpenBackgroundPicker = useCallback(async () => {
    setShowBackgroundPicker(true);
    setLoadingAlbumImages(true);
    try {
      const images = await mediaApi.listMedia(undefined, undefined, true);
      const imageOnly = images.filter(
        (m) =>
          m.contentType.startsWith("image/") && m.source !== "story-background"
      );
      setAlbumImages(imageOnly);
    } catch (error) {
      console.error("Failed to load album images:", error);
      addNotification("error", "Could not load your images");
    } finally {
      setLoadingAlbumImages(false);
    }
  }, [addNotification]);

  const handleSelectBackgroundImage = useCallback(
    async (image: MediaAssetDto) => {
      if (!settingsAlbumId) return;
      if (customBackgrounds.length >= MAX_CUSTOM_BACKGROUNDS) {
        addNotification("warning", "You've reached the maximum stage images!");
        return;
      }

      setAddingBackground(true);
      try {
        const response = await fetch(mediaApi.getContentUrl(image.id), {
          credentials: "include",
        });
        const blob = await response.blob();

        const newMedia = await mediaApi.uploadMedia({
          file: blob,
          title: image.title || "Stage Background",
          source: "story-background",
          albumId: settingsAlbumId,
        });

        const newBackground: CustomBackground = {
          id: newMedia.id,
          url: mediaApi.getContentUrl(newMedia.id),
          title: newMedia.title,
        };

        setCustomBackgrounds((prev) => [...prev, newBackground]);
        setBackground(newBackground.url);
        setShowBackgroundPicker(false);
        addNotification("success", "Stage image added! 🎨");
      } catch (error) {
        console.error("Failed to add background:", error);
        addNotification("error", "Could not add stage image");
      } finally {
        setAddingBackground(false);
      }
    },
    [settingsAlbumId, customBackgrounds.length, addNotification]
  );

  const handleDeleteCustomBackground = useCallback(
    async (bg: CustomBackground, e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      try {
        await mediaApi.deleteMedia(bg.id);
        setCustomBackgrounds((prev) => prev.filter((b) => b.id !== bg.id));

        if (background === bg.url) {
          setBackground("forest");
        }

        addNotification("success", "Stage image removed");
      } catch (error) {
        console.error("Failed to delete background:", error);
        addNotification("error", "Could not remove stage image");
      }
    },
    [background, addNotification]
  );

  const isCustomBackground = !BACKGROUNDS.includes(
    background as (typeof BACKGROUNDS)[number]
  );
  const canAddMoreBackgrounds =
    customBackgrounds.length < MAX_CUSTOM_BACKGROUNDS;

  useEffect(() => {
    loadCustomCharacters();
  }, []);

  async function loadCustomCharacters() {
    try {
      const characters = await characterApi.listCharacters();
      setCustomCharacters(characters);
    } catch (error) {
      console.error("Failed to load custom characters:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteCustomCharacter = useCallback(
    async (customChar: CharacterAssetDto, e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      try {
        await characterApi.deleteCharacter(customChar.id);
        setCustomCharacters((prev) =>
          prev.filter((c) => c.id !== customChar.id)
        );
        const imageUrl = characterApi.getCharacterImageUrl(
          customChar.mediaAssetId
        );
        if (character === imageUrl) {
          setCharacter("🧒");
        }
        addNotification("success", "Character removed");
      } catch (error) {
        console.error("Failed to delete character:", error);
        addNotification("error", "Could not remove character");
      }
    },
    [character, addNotification]
  );

  useEffect(() => {
    if (!character) {
      setCharacter("🧒");
    }
  }, [character]);

  const executeCurrentBlock = useCallback(() => {
    if (currentStep < 0 || currentStep >= blocks.length) return;

    const block = blocks[currentStep];
    const { type, params } = block;

    setAnimation(null);
    setSpeechText(null);

    switch (type) {
      case "walk":
        setAnimation("walking");
        setPosition((prev) => ({
          ...prev,
          x: Math.min(90, prev.x + (params.steps as number) / 10),
        }));
        setTimeout(() => setAnimation(null), 500);
        break;
      case "jump":
        setAnimation("jumping");
        setTimeout(() => setAnimation(null), 500);
        break;
      case "wave":
        setAnimation("waving");
        setTimeout(() => setAnimation(null), 500);
        break;
      case "say":
        setSpeechText(params.text as string);
        setTimeout(() => setSpeechText(null), 2000);
        break;
      case "wait":
        break;
    }
  }, [blocks, currentStep]);

  useEffect(() => {
    if (!isPlaying) return;

    executeCurrentBlock();

    const delay =
      blocks[currentStep]?.type === "wait"
        ? (blocks[currentStep].params.seconds as number) * 1000
        : 800;

    const timer = setTimeout(() => {
      if (currentStep < blocks.length - 1) {
        step();
      } else {
        stop();
        const hasWalk = blocks.some((b) => b.type === "walk");
        const hasJump = blocks.some((b) => b.type === "jump");
        const hasSay = blocks.some((b) => b.type === "say");

        if (hasWalk && hasJump) {
          showStickerReward("director-star", "Your character can move!");
        } else if (hasSay) {
          showStickerReward("chatty-star", "Your character can talk!");
        }
      }
    }, delay);

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

  useEffect(() => {
    if (!isPlaying) {
      setPosition({ x: 50, y: 70 });
      setAnimation(null);
      setSpeechText(null);
    }
  }, [isPlaying]);

  return (
    <div className="story-mode">
      <header className="studio-header">
        <h1>🎬 Story Mode</h1>
        <p>Bring your characters to life!</p>
      </header>

      <div className="story-controls">
        <div className="character-picker">
          <div className="character-header">
            <label>Character:</label>
            <button
              className="album-character-btn"
              onClick={() => navigate("/photo-album")}
              type="button"
              title="Add character from Album"
              aria-label="Add character from Album"
            >
              <span
                className="album-character-btn__icon"
                title="Add character from Album"
                aria-hidden="true"
              >
                <Camera size={16} />
              </span>
              <span className="album-character-btn__text">From Album</span>
            </button>
          </div>
          <div className="character-options">
            {CHARACTERS.map((char) => (
              <button
                key={char}
                className={`char-btn ${character === char ? "active" : ""}`}
                onClick={() => setCharacter(char)}
              >
                {char}
              </button>
            ))}
            {customCharacters.map((customChar) => {
              const imageUrl = characterApi.getCharacterImageUrl(
                customChar.mediaAssetId
              );
              return (
                <div key={customChar.id} className="custom-char-wrapper">
                  <button
                    className={`char-btn custom ${
                      character === imageUrl ? "active" : ""
                    }`}
                    onClick={() => setCharacter(imageUrl)}
                    title={customChar.name}
                  >
                    <img src={imageUrl} alt={customChar.name} />
                  </button>
                  <button
                    className="custom-char-delete"
                    onClick={(e) => handleDeleteCustomCharacter(customChar, e)}
                    title="Remove this character"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-picker">
          <label>Stage:</label>
          <div className="bg-options">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg}
                className={`bg-btn ${background === bg ? "active" : ""}`}
                onClick={() => setBackground(bg)}
              >
                {bg === "forest" ? "🌲" : bg === "space" ? "🌌" : "🏙️"} {bg}
              </button>
            ))}
            {customBackgrounds.map((bg) => (
              <div key={bg.id} className="custom-bg-wrapper">
                <button
                  className={`bg-btn custom-bg-btn ${
                    background === bg.url ? "active" : ""
                  }`}
                  onClick={() => setBackground(bg.url)}
                  title={bg.title}
                >
                  <img src={bg.url} alt={bg.title} />
                </button>
                <button
                  className="custom-bg-delete"
                  onClick={(e) => handleDeleteCustomBackground(bg, e)}
                  title="Remove this stage image"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              className="bg-btn add-bg-btn"
              onClick={handleOpenBackgroundPicker}
              disabled={!canAddMoreBackgrounds}
              title={
                canAddMoreBackgrounds
                  ? "Add Stage Image"
                  : "Maximum stage images reached"
              }
            >
              <ImagePlus size={18} />
              <span className="add-bg-text">Add</span>
            </button>
          </div>
        </div>
      </div>

      <div className="studio-layout">
        <aside className="studio-palette">
          <BlockPalette categories={["animation"]} />
        </aside>

        <main className="studio-main">
          <div className="canvas-container">
            <div
              className={`story-stage ${
                isCustomBackground ? "custom" : background
              }`}
              style={
                isCustomBackground
                  ? {
                      backgroundImage: `url(${background})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <div
                className={`character ${animation || ""} ${
                  character && !CHARACTERS.includes(character) ? "image" : ""
                }`}
                style={{ left: `${position.x}%`, bottom: `${position.y}%` }}
              >
                {character && CHARACTERS.includes(character) ? (
                  character
                ) : character ? (
                  <img
                    src={character}
                    alt="Character"
                    className="character-image"
                  />
                ) : null}
              </div>
              {speechText && (
                <div
                  className="speech-bubble"
                  style={{
                    left: `${position.x}%`,
                    bottom: `${position.y + 15}%`,
                  }}
                >
                  {speechText}
                </div>
              )}
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
              <p>No saved story scripts found.</p>
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
                          title="Delete this story"
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

      {showBackgroundPicker && (
        <div
          className="modal-overlay"
          onClick={() => setShowBackgroundPicker(false)}
        >
          <div
            className="modal-content bg-picker-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>🖼️ Pick a Stage Image</h2>
            <p className="modal-hint">
              Choose an image from your album to use as a stage background.
              {!canAddMoreBackgrounds && (
                <span className="limit-warning">
                  {" "}
                  You've reached the maximum of {MAX_CUSTOM_BACKGROUNDS} custom
                  backgrounds.
                </span>
              )}
            </p>
            {loadingAlbumImages ? (
              <div className="loading-state">
                <span className="loading-spinner">🎨</span>
                <p>Loading your images...</p>
              </div>
            ) : albumImages.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📷</span>
                <p>No images found in your album!</p>
                <p className="empty-hint">
                  Upload some images to your Photo Album first.
                </p>
              </div>
            ) : (
              <div className="bg-picker-grid">
                {albumImages.map((image) => (
                  <button
                    key={image.id}
                    className="bg-picker-item"
                    onClick={() => handleSelectBackgroundImage(image)}
                    disabled={addingBackground || !canAddMoreBackgrounds}
                  >
                    <img
                      src={mediaApi.getContentUrl(image.id)}
                      alt={image.title}
                      loading="lazy"
                    />
                    <span className="bg-picker-title">{image.title}</span>
                  </button>
                ))}
              </div>
            )}
            {addingBackground && (
              <div className="adding-overlay">
                <span className="loading-spinner">✨</span>
                <p>Adding stage image...</p>
              </div>
            )}
            <button
              className="btn-secondary"
              onClick={() => setShowBackgroundPicker(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
