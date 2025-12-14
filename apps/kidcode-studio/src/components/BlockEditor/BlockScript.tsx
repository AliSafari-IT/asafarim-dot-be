import { useState, type DragEvent } from "react";
import { useStore } from "../../core/state/useStore";
import { getBlockDefinition } from "../../types/blocks";
import { Trash2, GripVertical } from "lucide-react";
import "./BlockEditor.css";

export default function BlockScript() {
  const blocks = useStore((state) => state.editor.blocks);
  const selectedBlockId = useStore((state) => state.editor.selectedBlockId);
  const currentStep = useStore((state) => state.editor.currentStep);
  const isPlaying = useStore((state) => state.editor.isPlaying);
  const selectBlock = useStore((state) => state.selectBlock);
  const removeBlock = useStore((state) => state.removeBlock);
  const updateBlock = useStore((state) => state.updateBlock);
  const moveBlock = useStore((state) => state.moveBlock);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleDragStart = (e: DragEvent, fromIndex: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(fromIndex));
    setDragIndex(fromIndex);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDragOver = (e: DragEvent, overIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropIndex(overIndex);
  };

  const handleDropOnIndex = (e: DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromRaw = e.dataTransfer.getData("text/plain");
    const fromIndex = Number(fromRaw);
    if (!Number.isFinite(fromIndex)) return;
    if (fromIndex === toIndex) {
      handleDragEnd();
      return;
    }

    const toIndexNormalized =
      fromIndex < toIndex ? Math.max(0, toIndex - 1) : toIndex;
    moveBlock(fromIndex, toIndexNormalized);
    handleDragEnd();
  };

  const handleDropAtEnd = (e: DragEvent) => {
    e.preventDefault();
    const fromRaw = e.dataTransfer.getData("text/plain");
    const fromIndex = Number(fromRaw);
    if (!Number.isFinite(fromIndex)) return;
    if (fromIndex === blocks.length - 1) {
      handleDragEnd();
      return;
    }
    moveBlock(fromIndex, blocks.length - 1);
    handleDragEnd();
  };

  if (blocks.length === 0) {
    return (
      <div className="block-script empty">
        <div className="empty-state">
          <span className="empty-icon">📝</span>
          <p>Drag blocks here to start creating!</p>
          <p className="empty-hint">
            Click on blocks in the palette to add them
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="block-script">
      <h3 className="script-title">📜 My Script</h3>
      <div className="script-blocks">
        {blocks.map((block, index) => {
          const def = getBlockDefinition(block.type);
          if (!def) return null;

          const isSelected = block.id === selectedBlockId;
          const isActive = isPlaying && index === currentStep;

          const isDragging = dragIndex === index;
          const isDropTarget =
            dropIndex === index && dragIndex !== null && dragIndex !== index;

          return (
            <div
              key={block.id}
              className={`script-block ${isSelected ? "selected" : ""} ${
                isActive ? "active" : ""
              } ${isDragging ? "dragging" : ""} ${
                isDropTarget ? "drop-target" : ""
              }`}
              style={{ backgroundColor: def.color }}
              onClick={() => selectBlock(block.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDropOnIndex(e, index)}
            >
              <div
                className="block-drag-handle"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical size={16} />
              </div>
              <span className="block-icon">{def.icon}</span>
              <span className="block-label">{def.label}</span>
              <div className="block-params">
                {def.params.map((param) => (
                  <div key={param.name} className="param-control">
                    {param.type === "select" ? (
                      <select
                        value={block.params[param.name] as string}
                        onChange={(e) =>
                          updateBlock(block.id, {
                            [param.name]: e.target.value,
                          })
                        }
                        onClick={(e) => e.stopPropagation()}
                      >
                        {param.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : param.type === "number" ? (
                      <input
                        type="number"
                        value={block.params[param.name] as number}
                        min={param.min}
                        max={param.max}
                        onChange={(e) =>
                          updateBlock(block.id, {
                            [param.name]: Number(e.target.value),
                          })
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <input
                        type="text"
                        value={block.params[param.name] as string}
                        onChange={(e) =>
                          updateBlock(block.id, {
                            [param.name]: e.target.value,
                          })
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                ))}
              </div>
              <button
                className="block-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  removeBlock(block.id);
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}

        <div
          className={`script-drop-end ${
            dropIndex === blocks.length && dragIndex !== null
              ? "drop-target"
              : ""
          }`}
          onDragOver={(e) => handleDragOver(e, blocks.length)}
          onDrop={handleDropAtEnd}
        />
      </div>
    </div>
  );
}
