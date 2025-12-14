import BlockPalette from "../../components/BlockEditor/BlockPalette";
import BlockScript from "../../components/BlockEditor/BlockScript";
import ControlsBar from "../../components/BlockEditor/ControlsBar";
import DrawingCanvas from "../../components/Canvas/DrawingCanvas";
import { useEffect } from "react";
import { useStore } from "../../core/state/useStore";
import "./DrawingStudio.css";

export default function DrawingStudio() {
  const setActiveMode = useStore((state) => state.setActiveMode);

  useEffect(() => {
    setActiveMode("drawing");
  }, [setActiveMode]);

  return (
    <div className="drawing-studio">
      <header className="studio-header">
        <h1>🖌️ Drawing Studio</h1>
        <p>Create beautiful art with code blocks!</p>
      </header>

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
    </div>
  );
}
