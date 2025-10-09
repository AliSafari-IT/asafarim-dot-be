import type { LayoutType } from './types.tsx';
import './layout-selector.css';

interface LayoutSelectorProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  onExportPDF?: () => void;
}

const LAYOUTS = [
  { value: 'online' as LayoutType, label: 'Online', icon: '🌐', desc: 'Full interactive view' },
  { value: 'print' as LayoutType, label: 'Print', icon: '🖨️', desc: 'Print ready' },
];

export const LayoutSelector = ({ 
  currentLayout, 
  onLayoutChange,
  onExportPDF 
}: LayoutSelectorProps) => {
  return (
    <div className="layout-selector">
      <div className="layout-buttons">
        {LAYOUTS.map((layout) => (
          <button
            key={layout.value}
            className={`layout-btn ${currentLayout === layout.value ? 'active' : ''}`}
            onClick={() => onLayoutChange(layout.value)}
            title={layout.desc}
          >
            <span className="layout-icon">{layout.icon}</span>
            <span className="layout-label">{layout.label}</span>
          </button>
        ))}
        
        {/* PDF Export Button */}
        {onExportPDF && currentLayout === 'print' && (
          <button
            className="layout-btn export-pdf-btn"
            onClick={onExportPDF}
            title="Export as PDF"
          >
            <span className="layout-icon">📑</span>
            <span className="layout-label">Export PDF</span>
          </button>
        )}
      </div>
    </div>
  );
};
