import { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "../../core/state/useStore";
import BlockPalette from "../../components/BlockEditor/BlockPalette";
import BlockScript from "../../components/BlockEditor/BlockScript";
import ControlsBar from "../../components/BlockEditor/ControlsBar";
import "./SimpleMazePuzzle.css";

type Cell = "wall" | "path" | "start" | "goal";
type Direction = "up" | "down" | "left" | "right";

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

function createSimpleMaze(): Cell[][] {
  return [
    ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
    ["wall", "start", "path", "path", "wall", "path", "path", "wall"],
    ["wall", "wall", "wall", "path", "wall", "path", "wall", "wall"],
    ["wall", "path", "path", "path", "path", "path", "path", "wall"],
    ["wall", "path", "wall", "wall", "wall", "wall", "path", "wall"],
    ["wall", "path", "path", "path", "path", "path", "path", "wall"],
    ["wall", "wall", "wall", "path", "wall", "path", "goal", "wall"],
    ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
  ];
}

export default function SimpleMazePuzzle() {
  const [maze] = useState<Cell[][]>(createSimpleMaze());
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [direction, setDirection] = useState<Direction>("right");
  const [won, setWon] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failedCell, setFailedCell] = useState<{ x: number; y: number } | null>(null);

  const blocks = useStore((state) => state.editor.blocks);
  const isPlaying = useStore((state) => state.editor.isPlaying);
  const currentStep = useStore((state) => state.editor.currentStep);
  const step = useStore((state) => state.step);
  const stop = useStore((state) => state.stop);
  const setActiveMode = useStore((state) => state.setActiveMode);
  const setFailedBlockIndex = useStore((state) => state.setFailedBlockIndex);

  useEffect(() => {
    setActiveMode("puzzle");
  }, [setActiveMode]);

  const resetMaze = useCallback(() => {
    setPlayerPos({ x: 1, y: 1 });
    setDirection("right");
    setWon(false);
    setMessage(null);
    setFailedCell(null);
    setFailedBlockIndex(-1);
  }, [setFailedBlockIndex]);

  const executeBlock = useCallback(() => {
    if (currentStep < 0 || currentStep >= blocks.length || won) return;

    const block = blocks[currentStep];
    const { type } = block;

    switch (type) {
      case "moveForward":
      case "move-forward": {
        const steps = typeof block.params?.steps === "number" ? block.params.steps : 1;
        
        setPlayerPos((prevPos) => {
          const dir = DIRECTION_MAP[direction];
          const newX = prevPos.x + dir.dx;
          const newY = prevPos.y + dir.dy;

          const isOutOfBounds =
            newY < 0 || newY >= maze.length || newX < 0 || newX >= maze[0].length;
          const isWall = !isOutOfBounds && maze[newY][newX] === "wall";

          if (isOutOfBounds || isWall) {
            setFailedCell({ x: newX, y: newY });
            setFailedBlockIndex(currentStep);
            setMessage("Hit a wall! 🧱");
            stop();
            return prevPos;
          }

          if (maze[newY][newX] === "goal") {
            setWon(true);
            setMessage("You reached the goal! 🎉");
            stop();
            return { x: newX, y: newY };
          }

          return { x: newX, y: newY };
        });
        break;
      }
      case "turnRight":
        setDirection((prev) => TURN_RIGHT[prev]);
        break;
      case "turnLeft":
        setDirection((prev) => TURN_LEFT[prev]);
        break;
    }
  }, [blocks, currentStep, direction, maze, won, stop, setFailedBlockIndex]);

  useEffect(() => {
    if (!isPlaying) return;

    executeBlock();

    const timer = setTimeout(() => {
      if (currentStep < blocks.length - 1 && !won) {
        step();
      } else {
        stop();
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, blocks.length, won, executeBlock, step, stop]);

  useEffect(() => {
    if (!isPlaying) {
      resetMaze();
    }
  }, [isPlaying, resetMaze]);

  const getDirectionEmoji = () => {
    switch (direction) {
      case "up": return "⬆️";
      case "down": return "⬇️";
      case "left": return "⬅️";
      case "right": return "➡️";
    }
  };

  return (
    <div className="simple-maze-puzzle">
      <header className="studio-header">
        <h1>🧩 Simple Maze Puzzle</h1>
        <p>Guide the explorer through the maze!</p>
      </header>

      <div className="studio-layout">
        <aside className="studio-sidebar">
          <BlockPalette />
        </aside>

        <main className="studio-main">
          <div className="maze-container">
            <div className="maze-grid">
              {maze.map((row, y) =>
                row.map((cell, x) => {
                  const isPlayer = playerPos.x === x && playerPos.y === y;
                  const isFailed = failedCell?.x === x && failedCell?.y === y;

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`maze-cell ${cell} ${isPlayer ? "player" : ""} ${
                        isFailed ? "failed" : ""
                      }`}
                    >
                      {isPlayer && <span className="player-icon">{getDirectionEmoji()}</span>}
                      {cell === "goal" && !isPlayer && "🎯"}
                    </div>
                  );
                })
              )}
            </div>
            {message && <div className="maze-message">{message}</div>}
          </div>

          <ControlsBar />
        </main>

        <aside className="studio-sidebar">
          <BlockScript />
        </aside>
      </div>
    </div>
  );
}
