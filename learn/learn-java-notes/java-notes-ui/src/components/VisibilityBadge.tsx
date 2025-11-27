import './VisibilityBadge.css';

interface VisibilityBadgeProps {
  isPublic: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function VisibilityBadge({ isPublic, size = 'md' }: VisibilityBadgeProps) {
  return (
    <span className={`visibility-badge visibility-badge--${size} ${isPublic ? 'public' : 'private'}`}>
      {isPublic ? '🌍 Public' : '🔒 Private'}
    </span>
  );
}
