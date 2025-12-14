import { useState, useEffect, useCallback, useRef } from "react";
import BlockPalette from "../../components/BlockEditor/BlockPalette";
import BlockScript from "../../components/BlockEditor/BlockScript";
import ControlsBar from "../../components/BlockEditor/ControlsBar";
import { useStore } from "../../core/state/useStore";
import "./MusicBlocks.css";

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

  const blocks = useStore((state) => state.editor.blocks);
  const isPlaying = useStore((state) => state.editor.isPlaying);
  const currentStep = useStore((state) => state.editor.currentStep);
  const step = useStore((state) => state.step);
  const stop = useStore((state) => state.stop);
  const showStickerReward = useStore((state) => state.showStickerReward);
  const setActiveMode = useStore((state) => state.setActiveMode);

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
          showStickerReward("music-maker", "You created a melody!");
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
