import DOMPurify from 'dompurify';
import './RichTextViewer.css';

interface RichTextViewerProps {
  html?: string | null;
  className?: string;
}

export const RichTextViewer: React.FC<RichTextViewerProps> = ({
  html,
  className = '',
}) => {
  if (!html) {
    return <div className={`rtv-empty ${className}`}>No content</div>;
  }

  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
  });

  return (
    <div
      className={`rtv-container ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
