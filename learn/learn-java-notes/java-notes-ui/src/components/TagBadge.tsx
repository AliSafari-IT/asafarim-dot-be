import { useState } from "react";
import { getTagColorStyle } from "../utils/colorUtils";
import "./TagBadge.css";

interface TagBadgeProps {
  tag: string;
  onClick?: (tag: string) => void;
  onRemove?: (tag: string) => void;
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
  usageCount?: number;
  showTooltip?: boolean;
}

export default function TagBadge({ 
  tag, 
  onClick, 
  onRemove, 
  isActive = false,
  size = "md",
  usageCount,
  showTooltip = true
}: TagBadgeProps) {
  const [showTip, setShowTip] = useState(false);
  const isClickable = !!onClick;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const colorStyle = getTagColorStyle(tag, isDark);
  
  return (
    <span 
      className={`tag-badge tag-badge-${size} ${isActive ? "tag-badge-active" : ""} ${isClickable ? "tag-badge-clickable" : ""}`}
      style={colorStyle}
      onClick={isClickable ? () => onClick(tag) : undefined}
      onMouseEnter={() => showTooltip && setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === "Enter" && onClick(tag) : undefined}
    >
      <span className="tag-badge-icon">#</span>
      <span className="tag-badge-text">{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          className="tag-badge-remove"
          aria-label={`Remove ${tag} filter`}
        >
          ×
        </button>
      )}
      {showTip && showTooltip && (
        <span className="tag-tooltip">
          <strong>{tag}</strong>
          {usageCount !== undefined && <span> • {usageCount} note{usageCount !== 1 ? 's' : ''}</span>}
          {isClickable && <span className="tooltip-hint">Click to filter</span>}
        </span>
      )}
    </span>
  );
}
