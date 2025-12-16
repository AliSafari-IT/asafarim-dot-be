import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type MouseEvent,
} from "react";
import { Camera, Check, FolderOpen, Trash2 } from "lucide-react";
import BlockPalette from "../../components/BlockEditor/BlockPalette";
import BlockScript from "../../components/BlockEditor/BlockScript";
import ControlsBar from "../../components/BlockEditor/ControlsBar";
import { useStore } from "../../core/state/useStore";
import { mediaApi, type MediaAssetDto } from "../../services/mediaApi";
import { useAuth } from "../../hooks/useAuth";
import { useProgressSync } from "../../hooks/useProgressSync";
import { useNotifications } from "@asafarim/shared-ui-react";
import "../../components/Canvas/Canvas.css";
import "./PuzzleAdventures.css";

type Cell = "wall" | "path" | "start" | "goal";
type Direction = "up" | "down" | "left" | "right";
type GridSize = 8 | 10 | 12;
type Difficulty = "easy" | "medium" | "hard";

function generateMaze(size: GridSize, difficulty: Difficulty): Cell[][] {
  const maze: Cell[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill("wall"));

  const visited = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false));

  const directions = [
    { dx: 0, dy: -2 },
    { dx: 2, dy: 0 },
    { dx: 0, dy: 2 },
    { dx: -2, dy: 0 },
  ];

  function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function carve(x: number, y: number) {
    visited[y][x] = true;
    maze[y][x] = "path";

    const shuffledDirs = shuffle(directions);

    for (const { dx, dy } of shuffledDirs) {
      const nx = x + dx;
      const ny = y + dy;

      if (
        nx > 0 &&
        nx < size - 1 &&
        ny > 0 &&
        ny < size - 1 &&
        !visited[ny][nx]
      ) {
        maze[y + dy / 2][x + dx / 2] = "path";
        carve(nx, ny);
      }
    }
  }

  carve(1, 1);

  const complexityMap: Record<Difficulty, number> = {
    easy: 0.15,
    medium: 0.08,
    hard: 0.03,
  };

  const extraPaths = Math.floor(size * size * complexityMap[difficulty]);

  for (let i = 0; i < extraPaths; i++) {
    const x = Math.floor(Math.random() * (size - 2)) + 1;
    const y = Math.floor(Math.random() * (size - 2)) + 1;
    if (maze[y][x] === "wall") {
      const neighbors = [
        maze[y - 1]?.[x],
        maze[y + 1]?.[x],
        maze[y]?.[x - 1],
        maze[y]?.[x + 1],
      ].filter((cell) => cell === "path");

      if (neighbors.length >= 2) {
        maze[y][x] = "path";
      }
    }
  }

  maze[1][1] = "start";

  // Find a valid path cell for the goal (prefer bottom-right area)
  let goalPlaced = false;

  // Try to place goal in bottom-right quadrant first
  for (let y = size - 2; y >= Math.floor(size / 2) && !goalPlaced; y--) {
    for (let x = size - 2; x >= Math.floor(size / 2) && !goalPlaced; x--) {
      if (maze[y][x] === "path") {
        maze[y][x] = "goal";
        goalPlaced = true;
      }
    }
  }

  // If no path found in bottom-right, search entire maze
  if (!goalPlaced) {
    for (let y = size - 2; y > 0 && !goalPlaced; y--) {
      for (let x = size - 2; x > 0 && !goalPlaced; x--) {
        if (maze[y][x] === "path" && !(x === 1 && y === 1)) {
          maze[y][x] = "goal";
          goalPlaced = true;
        }
      }
    }
  }

  return maze;
}

const DIRECTION_MAP: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

const TURN_RIGHT: Record<Direction, Direction> = {
  up: "right",
  right: "down",
  down: "left",
  left: "up",
};

const TURN_LEFT: Record<Direction, Direction> = {
  up: "left",
  left: "down",
  down: "right",
  right: "up",
};

function generatePuzzleHash(maze: Cell[][]): string {
  const mazeString = maze.map((row) => row.join("")).join("");
  let hash = 0;
  for (let i = 0; i < mazeString.length; i++) {
    const char = mazeString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function toIntSteps(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return Math.trunc(raw);
  if (typeof raw === "string") {
    const n = Number(raw);
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  return 1;
}

export default function PuzzleAdventures() {
  const { user, isAuthenticated } = useAuth();
  const { updateProgress } = useProgressSync();
  const { addNotification } = useNotifications();

  const [gridSize, setGridSize] = useState<GridSize>(8);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [maze, setMaze] = useState<Cell[][]>(() => generateMaze(8, "easy"));

  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [direction, setDirection] = useState<Direction>("right");
  const [won, setWon] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failedCell, setFailedCell] = useState<{ x: number; y: number } | null>(
    null
  );

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedScripts, setSavedScripts] = useState<MediaAssetDto[]>([]);
  const [loadingScripts, setLoadingScripts] = useState(false);
  const [loadedMediaId, setLoadedMediaId] = useState<string | null>(null);
  const [currentPuzzleHash, setCurrentPuzzleHash] = useState<string>("");

  // Internal tick used to advance multi-step movement without stepping to next block.
  const [moveTick, setMoveTick] = useState(0);

  const playerPosRef = useRef(playerPos);
  const directionRef = useRef<Direction>(direction);
  const wonRef = useRef(false);

  // Multi-step moveForward execution state (per-block)
  const remainingStepsRef = useRef(0);
  const remainingBlockIndexRef = useRef<number | null>(null);

  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const blocks = useStore((state) => state.editor.blocks);
  const setBlocks = useStore((state) => state.setBlocks);
  const progress = useStore((state) => state.progress);
  const isPlaying = useStore((state) => state.editor.isPlaying);
  const currentStep = useStore((state) => state.editor.currentStep);
  const step = useStore((state) => state.step);
  const stop = useStore((state) => state.stop);
  const clearBlocks = useStore((state) => state.clearBlocks);
  const showStickerReward = useStore((state) => state.showStickerReward);
  const setActiveMode = useStore((state) => state.setActiveMode);
  const setFailedBlockIndex = useStore((state) => state.setFailedBlockIndex);

  const createPuzzleThumbnail = useCallback(async () => {
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

    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = kidSurface || kidSecondary || kidPrimary;
    for (let i = 0; i < 8; i++) ctx.fillRect(60 + i * 60, 90, 44, 44);
    for (let i = 0; i < 6; i++) ctx.fillRect(120 + i * 60, 150, 44, 44);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = kidSurface || kidPrimary || kidSecondary;
    ctx.fillRect(16, 16, width - 32, 70);
    ctx.restore();

    ctx.fillStyle = kidText || "#ffffff";
    ctx.font = "700 26px system-ui";
    ctx.fillText("Puzzle Script", 32, 50);

    ctx.font = "600 16px system-ui";
    ctx.fillText(`Blocks: ${blocks.length}`, 32, 76);
    ctx.fillText(`Grid: ${gridSize}×${gridSize}`, 180, 76);
    ctx.fillText(`Difficulty: ${difficulty}`, 330, 76);

    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
  }, [blocks.length, difficulty, gridSize]);

  const resetMaze = useCallback((preserveFailedCell = false) => {
    wonRef.current = false;

    const resetPos = { x: 1, y: 1 };
    playerPosRef.current = resetPos;
    setPlayerPos(resetPos);

    directionRef.current = "right";
    setDirection("right");

    setWon(false);
    setMessage(null);
    if (!preserveFailedCell) setFailedCell(null);
  }, []);

  useEffect(() => {
    setCurrentPuzzleHash(generatePuzzleHash(maze));
  }, [maze]);

  const handleLoadScript = useCallback(async () => {
    setShowLoadModal(true);
    setLoadingScripts(true);
    try {
      const scripts = await mediaApi.listMedia(
        undefined,
        "puzzle",
        isAuthenticated ? true : undefined
      );
      setSavedScripts(scripts.filter((s) => s.scriptJson));
    } catch (error) {
      console.error("Failed to load puzzle scripts:", error);
    } finally {
      setLoadingScripts(false);
    }
  }, [isAuthenticated]);

  const handleSelectScript = useCallback(
    (script: MediaAssetDto) => {
      if (!script.scriptJson) return;
      try {
        const data = JSON.parse(script.scriptJson);

        if (data.blocks) setBlocks(data.blocks);
        if (data.maze) setMaze(data.maze);
        if (data.gridSize) setGridSize(data.gridSize);
        if (data.difficulty) setDifficulty(data.difficulty);

        resetMaze();
        setLoadedMediaId(script.id);
        setShowLoadModal(false);
      } catch (error) {
        console.error("Failed to parse script:", error);
      }
    },
    [resetMaze, setBlocks]
  );

  const handleDeleteScript = useCallback(
    async (scriptId: string, e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (!window.confirm("Are you sure you want to delete this puzzle?")) {
        return;
      }

      try {
        await mediaApi.deleteMedia(scriptId);
        setSavedScripts((prev) => prev.filter((s) => s.id !== scriptId));
        if (loadedMediaId === scriptId) setLoadedMediaId(null);
      } catch (error) {
        console.error("Failed to delete puzzle script:", error);
        alert("Failed to delete puzzle. Please try again.");
      }
    },
    [loadedMediaId]
  );

  const handleSave = useCallback(async () => {
    if (!loadedMediaId) return;
    if (blocks.length === 0) return;

    setSaveStatus("saving");
    try {
      const blob = await createPuzzleThumbnail();
      if (!blob) {
        setSaveStatus("idle");
        return;
      }

      const puzzleData = { blocks, maze, gridSize, difficulty };

      await mediaApi.updateMedia(loadedMediaId, {
        file: blob,
        scriptJson: JSON.stringify(puzzleData),
      });

      const updated = await mediaApi.listMedia(
        undefined,
        "puzzle",
        isAuthenticated ? true : undefined
      );
      setSavedScripts(updated.filter((s) => s.scriptJson));

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save puzzle script:", error);
      setSaveStatus("idle");
    }
  }, [
    blocks,
    createPuzzleThumbnail,
    difficulty,
    gridSize,
    isAuthenticated,
    loadedMediaId,
    maze,
  ]);

  const handleSaveAs = useCallback(async () => {
    if (blocks.length === 0) return;

    setSaveStatus("saving");
    try {
      const blob = await createPuzzleThumbnail();
      if (!blob) {
        setSaveStatus("idle");
        return;
      }

      const title = `Puzzle ${new Date().toLocaleString()}`;
      const puzzleData = { blocks, maze, gridSize, difficulty };

      const media = await mediaApi.uploadMedia({
        file: blob,
        title,
        source: "puzzle",
        width: 600,
        height: 400,
        scriptJson: JSON.stringify(puzzleData),
      });

      setLoadedMediaId(media.id);

      const updated = await mediaApi.listMedia(
        undefined,
        "puzzle",
        isAuthenticated ? true : undefined
      );
      setSavedScripts(updated.filter((s) => s.scriptJson));

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save puzzle script:", error);
      setSaveStatus("idle");
    }
  }, [blocks, createPuzzleThumbnail, difficulty, gridSize, isAuthenticated, maze]);

  useEffect(() => {
    setActiveMode("puzzle");
  }, [setActiveMode]);

  useEffect(() => {
    if (blocks.length === 0) setFailedCell(null);
  }, [blocks.length]);

  const handleGenerateMaze = useCallback(() => {
    const newMaze = generateMaze(gridSize, difficulty);
    setMaze(newMaze);
    setFailedCell(null);
    resetMaze();
    clearBlocks();
    stop();
  }, [clearBlocks, difficulty, gridSize, resetMaze, stop]);

  const executeCurrentBlock = useCallback(() => {
    if (currentStep < 0 || currentStep >= blocks.length) return;

    const block = blocks[currentStep];
    const { type } = block;

    switch (type) {
      case "moveForward":
      case "move-forward": {
        const pos = playerPosRef.current;
        const dir = directionRef.current;
        const { dx, dy } = DIRECTION_MAP[dir];

        const totalStepsRaw = toIntSteps(block.params?.steps);
        const totalSteps = Math.max(0, totalStepsRaw);

        if (totalSteps === 0) {
          // No-op; ensure multi-step state for this block is cleared.
          if (remainingBlockIndexRef.current === currentStep) {
            remainingBlockIndexRef.current = null;
            remainingStepsRef.current = 0;
          }
          break;
        }

        // Initialize per-block remaining steps ONCE
        if (remainingBlockIndexRef.current !== currentStep) {
          remainingBlockIndexRef.current = currentStep;
          remainingStepsRef.current = totalSteps;

          // Validate entire path BEFORE starting movement
          let checkX = pos.x;
          let checkY = pos.y;
          for (let i = 0; i < totalSteps; i++) {
            checkX += dx;
            checkY += dy;

            const out =
              checkY < 0 ||
              checkY >= maze.length ||
              checkX < 0 ||
              checkX >= maze[0].length;
            const wall = !out && maze[checkY][checkX] === "wall";

            if (out || wall) {
              const failedPos = { x: checkX, y: checkY };
              setFailedCell(failedPos);
              setFailedBlockIndex(currentStep);
              setMessage("Oops! Hit a wall! 🧱");

              remainingStepsRef.current = 0;
              remainingBlockIndexRef.current = null;
              stop();
              return;
            }
          }
        }

        if (remainingStepsRef.current <= 0) {
          remainingStepsRef.current = 0;
          remainingBlockIndexRef.current = null;
          break;
        }

        // Move ONE cell per tick (refs are updated immediately so repeated calls progress correctly)
        const nextX = pos.x + dx;
        const nextY = pos.y + dy;

        const nextPos = { x: nextX, y: nextY };
        playerPosRef.current = nextPos;
        setPlayerPos(nextPos);

        remainingStepsRef.current -= 1;

        // Goal check
        if (maze[nextY]?.[nextX] === "goal") {
          remainingStepsRef.current = 0;
          remainingBlockIndexRef.current = null;

          wonRef.current = true;
          setWon(true);
          setMessage("You reached the goal! 🎉");

          const puzzleStickerId = `puzzle-${currentPuzzleHash}`;
          const hasSolvedThisPuzzle =
            progress?.puzzle?.stickers?.includes(puzzleStickerId) ?? false;

          if (!hasSolvedThisPuzzle) {
            const wasShown = showStickerReward(
              puzzleStickerId,
              "You solved the maze!"
            );

            if (wasShown) {
              updateProgress({
                mode: "Puzzle",
                addModeSticker: puzzleStickerId,
              }).catch(() => {
                // best-effort
              });
            }
          } else {
            addNotification("success", "You solved the puzzle successfully!");
          }

          stop();
          return;
        }

        // Reset multi-step state when complete
        if (remainingStepsRef.current <= 0) {
          remainingStepsRef.current = 0;
          remainingBlockIndexRef.current = null;
        }

        break;
      }

      case "turnRight": {
        setDirection((prev) => {
          const next = TURN_RIGHT[prev];
          directionRef.current = next;
          return next;
        });
        break;
      }

      case "turnLeft": {
        setDirection((prev) => {
          const next = TURN_LEFT[prev];
          directionRef.current = next;
          return next;
        });
        break;
      }
    }
  }, [
    addNotification,
    blocks,
    currentPuzzleHash,
    currentStep,
    maze,
    progress,
    setFailedBlockIndex,
    showStickerReward,
    stop,
    updateProgress,
  ]);

  useEffect(() => {
    if (!isPlaying) return;

    executeCurrentBlock();

    const timer = window.setTimeout(() => {
      const currentBlock = blocks[currentStep];
      const isMoveForward =
        currentBlock?.type === "moveForward" ||
        currentBlock?.type === "move-forward";

      const hasRemainingSteps =
        isMoveForward &&
        remainingBlockIndexRef.current === currentStep &&
        remainingStepsRef.current > 0;

      // If we're still inside the SAME moveForward block, schedule another tick
      if (hasRemainingSteps) {
        setMoveTick((t) => t + 1);
        return;
      }

      if (currentStep < blocks.length - 1 && !wonRef.current) {
        step();
      } else {
        stop();
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [
    blocks,
    currentStep,
    executeCurrentBlock,
    isPlaying,
    moveTick,
    step,
    stop,
  ]);

  const prevIsPlayingRef = useRef(isPlaying);

  useEffect(() => {
    const wasPlaying = prevIsPlayingRef.current;
    prevIsPlayingRef.current = isPlaying;

    if (!isPlaying && wasPlaying) {
      // run ended
      if (!wonRef.current) resetMaze(true);
      remainingStepsRef.current = 0;
      remainingBlockIndexRef.current = null;
    } else if (isPlaying && !wasPlaying) {
      // run started
      wonRef.current = false;
      setFailedCell(null);
      remainingStepsRef.current = 0;
      remainingBlockIndexRef.current = null;
    }
  }, [isPlaying, resetMaze]);

  const getDirectionEmoji = () => {
    switch (direction) {
      case "up":
        return "⬆️";
      case "down":
        return "⬇️";
      case "left":
        return "⬅️";
      case "right":
        return "➡️";
    }
  };

  return (
    <div className="puzzle-adventures">
      <header className="studio-header">
        <h1>🧩 Puzzle Adventures</h1>
        <p>Guide the explorer through the maze!</p>
      </header>

      <div className="studio-layout">
        <aside className="studio-palette">
          <BlockPalette
            categories={["motion"]}
            excludeTypes={["penUp", "penDown"]}
          />
        </aside>

        <main className="studio-main">
          <div className="puzzle-workspace">
            <div className="maze-container">
              {message && (
                <div className={`maze-message ${won ? "success" : "error"}`}>
                  {message}
                </div>
              )}

              <div
                className="maze-grid"
                style={{ gridTemplateColumns: `repeat(${maze[0].length}, 1fr)` }}
              >
                {maze.map((row, y) =>
                  row.map((cell, x) => {
                    const isPlayer = playerPos.x === x && playerPos.y === y;
                    const isFailed =
                      failedCell && failedCell.x === x && failedCell.y === y;

                    return (
                      <div
                        key={`${x}-${y}`}
                        className={`maze-cell ${cell} ${
                          isPlayer ? "player" : ""
                        } ${isFailed ? "failed" : ""}`}
                        data-failed={isFailed ? "true" : undefined}
                        data-pos={`${x},${y}`}
                      >
                        {isPlayer && getDirectionEmoji()}
                        {!isPlayer && cell === "start" && "🚩"}
                        {!isPlayer && cell === "goal" && "⭐"}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="maze-controls-panel">
              <div className="control-section">
                <h3>⚙️ Settings</h3>

                <div className="control-group">
                  <label>Grid Size</label>
                  <div className="button-group">
                    <button
                      className={`size-btn ${gridSize === 8 ? "active" : ""}`}
                      onClick={() => setGridSize(8)}
                    >
                      8×8
                    </button>
                    <button
                      className={`size-btn ${gridSize === 10 ? "active" : ""}`}
                      onClick={() => setGridSize(10)}
                    >
                      10×10
                    </button>
                    <button
                      className={`size-btn ${gridSize === 12 ? "active" : ""}`}
                      onClick={() => setGridSize(12)}
                    >
                      12×12
                    </button>
                  </div>
                </div>

                <div className="control-group">
                  <label>Difficulty</label>
                  <div className="button-group-vertical">
                    <button
                      className={`difficulty-btn easy ${
                        difficulty === "easy" ? "active" : ""
                      }`}
                      onClick={() => setDifficulty("easy")}
                    >
                      😊 Easy
                    </button>
                    <button
                      className={`difficulty-btn medium ${
                        difficulty === "medium" ? "active" : ""
                      }`}
                      onClick={() => setDifficulty("medium")}
                    >
                      😐 Medium
                    </button>
                    <button
                      className={`difficulty-btn hard ${
                        difficulty === "hard" ? "active" : ""
                      }`}
                      onClick={() => setDifficulty("hard")}
                    >
                      😤 Hard
                    </button>
                  </div>
                </div>

                <button className="generate-btn" onClick={handleGenerateMaze}>
                  🎲 Generate New Maze
                </button>
              </div>
            </div>
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
                {saveStatus === "saved" ? <Check size={18} /> : <Camera size={18} />}
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
              <p>No saved puzzle scripts found.</p>
            ) : (
              <div className="saved-drawings-grid">
                {savedScripts.map((script) => {
                  const currentUserId =
                    (
                      user as unknown as { id?: string; userId?: string; sub?: string } | null
                    )?.id ??
                    (
                      user as unknown as { id?: string; userId?: string; sub?: string } | null
                    )?.userId ??
                    (
                      user as unknown as { id?: string; userId?: string; sub?: string } | null
                    )?.sub ??
                    null;

                  const isOwner = !!currentUserId && script.userId === currentUserId;

                  return (
                    <div
                      key={script.id}
                      className="saved-drawing-card"
                      onClick={() => handleSelectScript(script)}
                    >
                      <img src={mediaApi.getContentUrl(script.id)} alt={script.title} />
                      <p>{script.title}</p>

                      {isOwner && (
                        <button
                          className="delete-btn"
                          onClick={(e) => handleDeleteScript(script.id, e)}
                          title="Delete puzzle"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <button className="btn-secondary" onClick={() => setShowLoadModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
