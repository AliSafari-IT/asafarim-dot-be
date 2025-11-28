import { Link, useSearchParams } from "react-router-dom";
import "./NoteCard.css";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import { type StudyNote } from "../api/notesApi";
import TagBadge from "./TagBadge";
import VisibilityBadge from "./VisibilityBadge";

interface NoteCardProps {
  note: StudyNote;
  onDelete: (id: string) => void;
  canDelete?: boolean;
  linkTo?: string;
}

export default function NoteCard({ note, onDelete , canDelete = false, linkTo }: NoteCardProps) {
  const [, setSearchParams] = useSearchParams();

  const getContentPreview = () => {
    if (!note.content) return null;
    const maxLength = 150;
    if (note.content.length <= maxLength) return note.content;
    return note.content.substring(0, maxLength).trim() + "...";
  };

  return (
    <div className="note-card">
      <Link to={linkTo || `/note/${note.id}`} className="note-card-link">
        <div className="note-header">
          <div className="note-icon">📝</div>
          <div className="note-title-section">
            <div className="note-title-row">
              <h2 className="note-title">{note.title}</h2>
              <VisibilityBadge isPublic={note.isPublic} size="sm" />
            </div>
            <div className="note-meta">
              {note.createdBy && (
                <span className="meta-item">
                  👤 by {note.createdBy}
                </span>
              )}
              <span className="meta-item">
                📅 {new Date(note.createdAt).toLocaleDateString()}
              </span>
              <span className="meta-item">
                ⏱️ {note.readingTimeMinutes} min read
              </span>
              <span className="meta-item">
                📊 {note.wordCount} words
              </span>
            </div>
          </div>
        </div>

        <div className="note-content-wrapper">
          <p className="note-content">
            {getContentPreview() || <span className="empty-content">No content yet. Click to add some...</span>}
          </p>
          {note.content && note.content.length > 150 && (
            <span className="read-more">Read more →</span>
          )}
        </div>
      </Link>

      <div className="note-tags-section">
        <div className="note-tags">
          {note.tags && note.tags.length > 0 ? (
            note.tags.map((tag) => (
              <TagBadge
                key={tag}
                tag={tag}
                onClick={(t) => setSearchParams({ tag: t })}
                size="sm"
              />
            ))
          ) : (
            <span className="no-tags">No tags</span>
          )}
        </div>
      </div>
      
      {canDelete && (
        <div className="note-footer">
          <div className="note-actions">
            <Link to={`/edit/${note.id}`}>
              <Button variant="primary" className="action-btn edit-btn">
                ✏️ Edit
              </Button>
            </Link>
            <Button
              variant="danger"
              onClick={() => onDelete(note.id)}
              className="action-btn delete-btn"
            >
              🗑️ Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
