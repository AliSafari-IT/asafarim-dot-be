import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getNote, type StudyNote } from "../api/notesApi";
import Layout from "../components/Layout";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import "./NoteDetails.css";

export default function NoteDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<StudyNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNote() {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getNote(Number(id));
        setNote(data);
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
      <Layout>
        <div className="note-details-loading">
          <div className="loading-spinner">📖</div>
          <p>Loading your note...</p>
        </div>
      </Layout>
    );
  }

  if (error || !note) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="note-details">
        {/* Navigation Bar */}
        <nav className="note-nav">
          <Button
            variant="secondary"
            onClick={() => navigate("/")}
            className="nav-btn back-btn"
          >
            ← Back to Notes
          </Button>
          <Link to={`/edit/${note.id}`}>
            <Button
              variant="primary"
              className="nav-btn edit-btn"
            >
              ✏️ Edit Note
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
            <span className="tag">📚 study</span>
            <span className="tag">📝 notes</span>
            <span className="tag">☕ java</span>
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
              className="footer-btn"
            >
              ← All Notes
            </Button>
            <Link to={`/edit/${note.id}`}>
              <Button
                variant="primary"
                className="footer-btn"
              >
                ✏️ Edit
              </Button>
            </Link>
          </div>
        </footer>
      </div>
    </Layout>
  );
}
