import { useState, useEffect, useCallback } from "react";
import { Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BlockPalette from "../../components/BlockEditor/BlockPalette";
import BlockScript from "../../components/BlockEditor/BlockScript";
import ControlsBar from "../../components/BlockEditor/ControlsBar";
import { useStore } from "../../core/state/useStore";
import {
  characterApi,
  type CharacterAssetDto,
} from "../../services/characterApi";
import "./StoryMode.css";

const CHARACTERS = ["🧒", "👧", "🐱", "🐶", "🦊", "🐻", "🤖", "👽"];
const BACKGROUNDS = ["forest", "space", "city"] as const;

export default function StoryMode() {
  const navigate = useNavigate();
  const [character, setCharacter] = useState<string | null>(null);
  const [customCharacters, setCustomCharacters] = useState<CharacterAssetDto[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [background, setBackground] =
    useState<(typeof BACKGROUNDS)[number]>("forest");
  const [position, setPosition] = useState({ x: 50, y: 70 });
  const [animation, setAnimation] = useState<string | null>(null);
  const [speechText, setSpeechText] = useState<string | null>(null);

  const blocks = useStore((state) => state.editor.blocks);
  const isPlaying = useStore((state) => state.editor.isPlaying);
  const currentStep = useStore((state) => state.editor.currentStep);
  const step = useStore((state) => state.step);
  const stop = useStore((state) => state.stop);
  const showStickerReward = useStore((state) => state.showStickerReward);
  const setActiveMode = useStore((state) => state.setActiveMode);

  useEffect(() => {
    setActiveMode("story");
  }, [setActiveMode]);

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
                <button
                  key={customChar.id}
                  className={`char-btn custom ${
                    character === imageUrl ? "active" : ""
                  }`}
                  onClick={() => setCharacter(imageUrl)}
                  title={customChar.name}
                >
                  <img src={imageUrl} alt={customChar.name} />
                </button>
              );
            })}
          </div>
        </div>
        <div className="bg-picker">
          <label>Background:</label>
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
          </div>
        </div>
      </div>

      <div className="studio-layout">
        <aside className="studio-palette">
          <BlockPalette categories={["animation"]} />
        </aside>

        <main className="studio-main">
          <div className="canvas-container">
            <div className={`story-stage ${background}`}>
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
          </div>
          <ControlsBar />
        </main>

        <aside className="studio-script">
          <BlockScript />
        </aside>
      </div>
    </div>
  );
}
