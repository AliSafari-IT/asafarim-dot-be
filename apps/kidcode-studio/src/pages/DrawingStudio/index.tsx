import BlockPalette from "../../components/BlockEditor/BlockPalette";
import BlockScript from "../../components/BlockEditor/BlockScript";
import ControlsBar from "../../components/BlockEditor/ControlsBar";
import DrawingCanvas from "../../components/Canvas/DrawingCanvas";
import PaintCanvas from "../../components/Canvas/PaintCanvas";
import { useEffect } from "react";
import { useStore } from "../../core/state/useStore";
import "./DrawingStudio.css";

export default function DrawingStudio() {
  const setActiveMode = useStore((state) => state.setActiveMode);
  const paintMode = useStore((state) => state.editor.paintMode);
  const togglePaintMode = useStore((state) => state.togglePaintMode);

  useEffect(() => {
    setActiveMode("drawing");
  }, [setActiveMode]);

  return (
    <div className="drawing-studio">
      <header className="studio-header">
        <h1>🖌️ Drawing Studio</h1>
        <p>Create beautiful art with code blocks!</p>
        <div className="mode-toggle">
          <button
            className={!paintMode ? "active" : ""}
            onClick={() => paintMode && togglePaintMode()}
          >
            📦 Block Mode
          </button>
          <button
            className={paintMode ? "active" : ""}
            onClick={() => !paintMode && togglePaintMode()}
          >
            🎨 Paint Lab
          </button>
        </div>
      </header>

      {paintMode ? (
        <div className="paint-studio-layout">
          <main className="paint-studio-main">
            <PaintCanvas />
          </main>
        </div>
      ) : (
        <div className="studio-layout">
          <aside className="studio-palette">
            <BlockPalette categories={["draw", "motion", "color", "control"]} />
          </aside>

          <main className="studio-main">
            <DrawingCanvas />
            <ControlsBar />
          </main>

          <aside className="studio-script">
            <BlockScript />
          </aside>
        </div>
      )}
    </div>
  );
}
