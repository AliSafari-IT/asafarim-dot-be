import { Play, Square, Trash2, Undo, Redo } from "lucide-react";
import { useStore } from "../../core/state/useStore";
import "./BlockEditor.css";

export default function ControlsBar() {
  const blocks = useStore((state) => state.editor.blocks);
  const isPlaying = useStore((state) => state.editor.isPlaying);
  const undoStack = useStore((state) => state.editor.undoStack);
  const redoStack = useStore((state) => state.editor.redoStack);
  const play = useStore((state) => state.play);
  const stop = useStore((state) => state.stop);
  const clearBlocks = useStore((state) => state.clearBlocks);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);

  return (
    <div className="controls-bar">
      {isPlaying ? (
        <button className="control-btn stop" onClick={stop}>
          <Square size={20} />
          Stop
        </button>
      ) : (
        <button
          className="control-btn play"
          onClick={play}
          disabled={blocks.length === 0}
        >
          <Play size={20} />
          Play
        </button>
      )}

      <button
        className="control-btn clear"
        onClick={clearBlocks}
        disabled={blocks.length === 0}
      >
        <Trash2 size={20} />
        Clear
      </button>

      <button
        className="control-btn undo"
        onClick={undo}
        disabled={undoStack.length === 0}
      >
        <Undo size={20} />
        Undo
      </button>

      <button
        className="control-btn redo"
        onClick={redo}
        disabled={redoStack.length === 0}
      >
        <Redo size={20} />
        Redo
      </button>
    </div>
  );
}
