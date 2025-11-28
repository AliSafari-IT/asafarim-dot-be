import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getNote, trackNoteView, type StudyNote } from "../api/notesApi";
import TagBadge from "../components/TagBadge";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import "./NoteDetails.css";

export default function NoteDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [note, setNote] = useState<StudyNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const viewTrackedRef = useRef(false);

  function handleTagClick(tag: string) {
    setSearchParams({ tag });
    navigate(`/?tag=${encodeURIComponent(tag)}`);
  }

  useEffect(() => {
    async function loadNote() {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getNote(id);
        setNote(data);
        
        // Track view (only once per page load)
        if (!viewTrackedRef.current) {
          viewTrackedRef.current = true;
          trackNoteView(id).catch(() => {
            // Silently ignore tracking errors - non-critical
          });
        }
      } catch (err) {
        console.error("Failed to load note:", err);
        setError("Failed to load note. It may have been deleted.");
      } finally {
        setLoading(false);
      }
    }

    loadNote();
  }, [id]);

  const getWordCount = () => {
    return note?.content ? note.content.split(/\s+/).filter(word => word.length > 0).length : 0;
  };

  const getReadingTime = () => {
    const words = getWordCount();
    const readingSpeed = 200;
    return Math.max(1, Math.ceil(words / readingSpeed));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="note-details-loading">
        <div className="loading-spinner">📖</div>
        <p>Loading your note...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="note-details-error">
        <div className="error-icon">😔</div>
        <h2>Oops! Note not found</h2>
        <p>{error || "The note you're looking for doesn't exist."}</p>
        <Button
          variant="primary"
          onClick={() => navigate("/")}
          className="back-btn"
        >
          ← Back to Notes
        </Button>
      </div>
    );
  }

  return (
      <div className="note-details">
        {/* Navigation Bar */}
        <nav className="note-nav">
          <Button
            variant="secondary"
            onClick={() => navigate("/")}
          >
            ← Back to Notes
          </Button>
          <Link to={`/edit/${note.id}`}>
            <Button
              variant="primary"
            >
              ✏️ Edit
            </Button>
          </Link>
        </nav>

        {/* Note Header */}
        <header className="note-details-header">
          <div className="note-icon-large">📝</div>
          <h1 className="note-details-title">{note.title}</h1>
          
          {/* Meta Information */}
          <div className="note-details-meta">
            <div className="meta-row">
              <span className="meta-badge">
                📅 {formatDate(note.createdAt)}
              </span>
              <span className="meta-badge">
                🕐 {formatTime(note.createdAt)}
              </span>
            </div>
            <div className="meta-row">
              <span className="meta-badge reading-time">
                ⏱️ {getReadingTime()} min read
              </span>
              <span className="meta-badge word-count">
                📊 {getWordCount()} words
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="note-details-tags">
            {note.tags && note.tags.length > 0 ? (
              note.tags.map((tag) => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  onClick={handleTagClick}
                  size="md"
                />
              ))
            ) : (
              <span className="no-tags">No tags</span>
            )}
          </div>
        </header>

        {/* Note Content */}
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
              <p>This note is empty. Click "Edit Note" to add some content!</p>
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
                <span className="analytics-value">{note.analytics.publicViews}</span>
                <span className="analytics-label">Public Views</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-value">{note.analytics.privateViews}</span>
                <span className="analytics-label">Private Views</span>
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
              <span className="meta-badge word-count">📝 {getWordCount()} words</span>
              <span className="meta-badge reading-time">⏱️ {getReadingTime()} min read</span>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="note-details-footer">
          <div className="footer-info">
            {note.updatedAt && note.updatedAt !== note.createdAt && (
              <span className="updated-text">
                Last updated: {formatDate(note.updatedAt)} at {formatTime(note.updatedAt)}
              </span>
            )}
          </div>
          <div className="footer-actions">
            <Button
              variant="secondary"
              onClick={() => navigate("/")}
            >
              ← All Notes
            </Button>
            <Link to={`/edit/${note.id}`}>
              <Button
                variant="primary"
              >
                ✏️ Edit
              </Button>
            </Link>
          </div>
        </footer>
      </div>
  );
}
