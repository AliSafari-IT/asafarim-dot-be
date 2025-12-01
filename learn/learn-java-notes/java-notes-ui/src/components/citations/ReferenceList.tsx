import { useNavigate } from 'react-router-dom';
import type { ReferenceEntry } from '../../api/citationApi';
import './ReferenceList.css';

interface ReferenceListProps {
  references: ReferenceEntry[];
  title?: string;
}

export default function ReferenceList({ references, title = 'References' }: ReferenceListProps) {
  const navigate = useNavigate();

  if (references.length === 0) {
    return null;
  }

  const handleReferenceClick = (noteId: string) => {
    navigate(`/note/${noteId}`);
  };

  return (
    <div className="reference-list">
      <h3 className="reference-title">{title}</h3>
      <ol className="references">
        {references.map((ref) => (
          <li key={ref.referencedNoteId} className="reference-item">
            <span 
              className="reference-text"
              onClick={() => handleReferenceClick(ref.referencedNoteId)}
              role="button"
              tabIndex={0}
            >
              <span className="reference-formatted">{ref.formatted}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
