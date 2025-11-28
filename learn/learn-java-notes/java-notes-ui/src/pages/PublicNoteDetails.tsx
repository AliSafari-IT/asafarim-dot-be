import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPublicNote, trackPublicNoteView, type StudyNote } from "../api/notesApi";
import TagBadge from "../components/TagBadge";
import VisibilityBadge from "../components/VisibilityBadge";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import "./PublicNoteDetails.css";

export default function PublicNoteDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<StudyNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const viewTrackedRef = useRef(false);

  useEffect(() => {
    async function loadNote() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getPublicNote(id);
        setNote(data);
        
        // Track view (only once per page load)
        if (!viewTrackedRef.current) {
          viewTrackedRef.current = true;
          trackPublicNoteView(id);
        }
      } catch (err) {
        console.error("Failed to load public note:", err);
        setError("Failed to load note. It may be private or deleted.");
      } finally {
        setLoading(false);
      }
    }

    loadNote();
  }, [id]);

  if (loading) {
    return (
      <div className="note-details-loading">
        <div className="loading-spinner">📖</div>
        <p>Loading note...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="note-details-error">
        <div className="error-icon">😔</div>
        <h2>Note not found</h2>
        <p>{error || "This note doesn't exist or is private."}</p>
        <Button
          variant="primary"
          onClick={() => navigate("/public")}
        >
          ← Back to Public Notes
        </Button>
      </div>
    );
  }

  return (
    <div className="note-details">
      <nav className="note-nav">
        <Button
          variant="secondary"
          onClick={() => navigate("/public")}
        >
          ← Back to Public Notes
        </Button>
      </nav>

      <header className="note-details-header">
        <div className="note-icon-large">📝</div>
        <h1 className="note-details-title">{note.title}</h1>
        <VisibilityBadge isPublic={note.isPublic} size="lg" />

        <div className="note-details-meta">
          <div className="meta-row">
            <span className="meta-badge">
              📅 {new Date(note.createdAt).toLocaleDateString()}
            </span>
            <span className="meta-badge">
              ⏱️ {note.readingTimeMinutes} min read
            </span>
            <span className="meta-badge">
              📊 {note.wordCount} words
            </span>
          </div>
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="note-details-tags">
            {note.tags.map((tag) => (
              <TagBadge
                key={tag}
                tag={tag}
                onClick={() => navigate(`/public?tag=${tag}`)}
                size="md"
              />
            ))}
          </div>
        )}
      </header>

      <article className="note-details-content">
        {note.content ? (
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {note.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="empty-content">
            <div className="empty-icon">📄</div>
            <p>This note has no content yet.</p>
          </div>
        )}
      </article>

      {/* Analytics Section */}
      {note.analytics && (
        <section className="note-analytics">
          <h3 className="analytics-title">📊 Analytics</h3>
          <div className="analytics-grid">
            <div className="analytics-card">
              <span className="analytics-value">{note.analytics.totalViews}</span>
              <span className="analytics-label">Total Views</span>
            </div>
            <div className="analytics-card">
              <span className="analytics-value">{note.analytics.viewsLast7Days}</span>
              <span className="analytics-label">Last 7 Days</span>
            </div>
            <div className="analytics-card">
              <span className="analytics-value">{note.analytics.viewsLast30Days}</span>
              <span className="analytics-label">Last 30 Days</span>
            </div>
            <div className="analytics-card">
              <span className="analytics-value">{note.analytics.uniqueViewers}</span>
              <span className="analytics-label">Unique Viewers</span>
            </div>
          </div>
          <div className="analytics-extra">
            <span className="meta-badge">📝 {note.wordCount} words</span>
            <span className="meta-badge">⏱️ {note.readingTimeMinutes} min read</span>
          </div>
        </section>
      )}
    </div>
  );
}
