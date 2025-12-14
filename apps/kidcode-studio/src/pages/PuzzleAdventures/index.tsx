import { useState, useEffect, useCallback, useRef } from "react";
import BlockPalette from "../../components/BlockEditor/BlockPalette";
import BlockScript from "../../components/BlockEditor/BlockScript";
import ControlsBar from "../../components/BlockEditor/ControlsBar";
import { useStore } from "../../core/state/useStore";
import "./PuzzleAdventures.css";

type Cell = "wall" | "path" | "start" | "goal";
type Direction = "up" | "down" | "left" | "right";

const MAZE: Cell[][] = [
  ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
  ["wall", "start", "path", "path", "wall", "path", "path", "wall"],
  ["wall", "wall", "wall", "path", "wall", "path", "wall", "wall"],
  ["wall", "path", "path", "path", "path", "path", "path", "wall"],
  ["wall", "path", "wall", "wall", "wall", "wall", "path", "wall"],
  ["wall", "path", "path", "path", "path", "path", "path", "wall"],
  ["wall", "wall", "wall", "wall", "wall", "path", "goal", "wall"],
  ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
];

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

export default function PuzzleAdventures() {
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [direction, setDirection] = useState<Direction>("right");
  const [won, setWon] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const playerPosRef = useRef(playerPos);
  const directionRef = useRef<Direction>(direction);

  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const blocks = useStore((state) => state.editor.blocks);
  const isPlaying = useStore((state) => state.editor.isPlaying);
  const currentStep = useStore((state) => state.editor.currentStep);
  const step = useStore((state) => state.step);
  const stop = useStore((state) => state.stop);
  const showStickerReward = useStore((state) => state.showStickerReward);
  const setActiveMode = useStore((state) => state.setActiveMode);

  useEffect(() => {
    setActiveMode("puzzle");
  }, [setActiveMode]);

  const resetMaze = useCallback(() => {
    setPlayerPos({ x: 1, y: 1 });
    setDirection("right");
    setWon(false);
    setMessage(null);
  }, []);

  const executeCurrentBlock = useCallback(() => {
    if (currentStep < 0 || currentStep >= blocks.length) return;

    const block = blocks[currentStep];
    const { type } = block;

    switch (type) {
      case "moveForward": {
        const pos = playerPosRef.current;
        const dir = directionRef.current;
        const { dx, dy } = DIRECTION_MAP[dir];
        const newX = pos.x + dx;
        const newY = pos.y + dy;

        if (MAZE[newY]?.[newX] === "wall") {
          setMessage("Oops! Hit a wall! 🧱");
          stop();
          return;
        }

        setPlayerPos({ x: newX, y: newY });

        if (MAZE[newY][newX] === "goal") {
          setWon(true);
          setMessage("You reached the goal! 🎉");
          showStickerReward("maze-master", "You solved the maze!");
          stop();
        }
        break;
      }
      case "turnRight":
        setDirection((prev) => TURN_RIGHT[prev]);
        break;
      case "turnLeft":
        setDirection((prev) => TURN_LEFT[prev]);
        break;
    }
  }, [blocks, currentStep, stop, showStickerReward]);

  useEffect(() => {
    if (!isPlaying) return;

    executeCurrentBlock();

    const timer = setTimeout(() => {
      if (currentStep < blocks.length - 1 && !won) {
        step();
      } else {
        stop();
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    currentStep,
    blocks.length,
    step,
    stop,
    won,
    executeCurrentBlock,
  ]);

  useEffect(() => {
    if (!isPlaying) {
      resetMaze();
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
          <BlockPalette categories={["motion"]} />
        </aside>

        <main className="studio-main">
          <div className="canvas-container">
            <div className="maze-container">
              {message && (
                <div className={`maze-message ${won ? "success" : "error"}`}>
                  {message}
                </div>
              )}
              <div
                className="maze-grid"
                style={{
                  gridTemplateColumns: `repeat(${MAZE[0].length}, 40px)`,
                }}
              >
                {MAZE.map((row, y) =>
                  row.map((cell, x) => {
                    const isPlayer = playerPos.x === x && playerPos.y === y;
                    return (
                      <div
                        key={`${x}-${y}`}
                        className={`maze-cell ${cell} ${
                          isPlayer ? "player" : ""
                        }`}
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
