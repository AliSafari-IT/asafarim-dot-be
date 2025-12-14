import {
  BLOCK_DEFINITIONS,
  type BlockDefinition,
  type BlockCategory,
} from "../../types/blocks";
import { useStore } from "../../core/state/useStore";
import "./BlockEditor.css";

interface BlockPaletteProps {
  categories?: BlockCategory[];
}

const categoryLabels: Record<BlockCategory, { label: string; emoji: string }> =
  {
    draw: { label: "Draw", emoji: "✏️" },
    motion: { label: "Motion", emoji: "🏃" },
    color: { label: "Color", emoji: "🎨" },
    control: { label: "Control", emoji: "✨" },
    animation: { label: "Animation", emoji: "🎬" },
    logic: { label: "Logic", emoji: "🧠" },
    music: { label: "Music", emoji: "🎵" },
    system: { label: "System", emoji: "⚙️" },
  };

export default function BlockPalette({ categories }: BlockPaletteProps) {
  const addBlock = useStore((state) => state.addBlock);

  const filteredDefs = categories
    ? BLOCK_DEFINITIONS.filter((def) => categories.includes(def.category))
    : BLOCK_DEFINITIONS;

  const groupedBlocks = filteredDefs.reduce((acc, def) => {
    if (!acc[def.category]) acc[def.category] = [];
    acc[def.category].push(def);
    return acc;
  }, {} as Record<BlockCategory, BlockDefinition[]>);

  const handleAddBlock = (def: BlockDefinition) => {
    const params: Record<string, number | string> = {};
    def.params.forEach((p) => {
      params[p.name] = p.default;
    });
    addBlock({ id: "", type: def.type, params });

    const audio = new Audio();
    audio.src =
      "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU";
  };

  return (
    <div className="block-palette">
      <h3 className="palette-title">🧱 Blocks</h3>
      {Object.entries(groupedBlocks).map(([category, blocks]) => (
        <div key={category} className="palette-category">
          <div className="category-header">
            <span>{categoryLabels[category as BlockCategory]?.emoji}</span>
            <span>{categoryLabels[category as BlockCategory]?.label}</span>
          </div>
          <div className="category-blocks">
            {blocks.map((def) => (
              <button
                key={def.id}
                className="palette-block"
                style={{ backgroundColor: def.color }}
                onClick={() => handleAddBlock(def)}
                title={def.label}
              >
                <span className="block-icon">{def.icon}</span>
                <span className="block-label">{def.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
