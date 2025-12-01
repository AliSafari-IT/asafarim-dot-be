import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReferenceEntry } from '../../api/citationApi';
import './CitationInline.css';

interface CitationInlineProps {
  publicId: string;
  label: string;
  reference?: ReferenceEntry;
  onHover?: (publicId: string) => void;
}

export default function CitationInline({ publicId, label, reference, onHover }: CitationInlineProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (reference?.referencedNoteId) {
      navigate(`/notes/${reference.referencedNoteId}`);
    }
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
    onHover?.(publicId);
  };

  return (
    <span 
      className="citation-inline"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title={reference?.title || publicId}
    >
      <span className="citation-label">{label}</span>
      {showTooltip && reference && (
        <div className="citation-tooltip">
          <div className="tooltip-title">{reference.title}</div>
          {reference.authors && <div className="tooltip-authors">{reference.authors}</div>}
          {reference.year && <div className="tooltip-year">{reference.year}</div>}
          <div className="tooltip-hint">Click to view note</div>
        </div>
      )}
    </span>
  );
}
