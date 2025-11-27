import "./TagBadge.css";

interface TagBadgeProps {
  tag: string;
  onClick?: (tag: string) => void;
  onRemove?: (tag: string) => void;
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function TagBadge({ 
  tag, 
  onClick, 
  onRemove, 
  isActive = false,
  size = "md" 
}: TagBadgeProps) {
  const isClickable = !!onClick;
  
  return (
    <span 
      className={`tag-badge tag-badge-${size} ${isActive ? "tag-badge-active" : ""} ${isClickable ? "tag-badge-clickable" : ""}`}
      onClick={isClickable ? () => onClick(tag) : undefined}
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
    </span>
  );
}
