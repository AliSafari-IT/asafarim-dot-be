import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getPublicNoteByPublicId,
  trackPublicNoteViewById,
  getPublicAttachments,
  type PublicNoteResponse,
  type Attachment,
} from "../api/notesApi";
import TagBadge from "../components/TagBadge";
import AttachmentList from "../components/AttachmentList";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import "./PublicNotePage.css";

export default function PublicNotePage() {
  const { publicId } = useParams<{ publicId: string; slug?: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<PublicNoteResponse | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const viewTrackedRef = useRef(false);

  useEffect(() => {
    async function loadNote() {
      if (!publicId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getPublicNoteByPublicId(publicId);
        setNote(data);

        // Load public attachments
        try {
          const noteAttachments = await getPublicAttachments(data.id);
          setAttachments(noteAttachments);
        } catch (err) {
          console.error("Failed to load attachments:", err);
        }

        // Track view (only once per page load)
        if (!viewTrackedRef.current) {
          viewTrackedRef.current = true;
          trackPublicNoteViewById(publicId).catch(() => {
            // Silently ignore tracking errors
          });
        }
      } catch (err) {
        console.error("Failed to load note:", err);
        setError("This note isn't available.");
      } finally {
        setLoading(false);
      }
    }

    loadNote();
  }, [publicId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="public-note-loading">
        <div className="loading-spinner">📖</div>
        <p>Loading note...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="public-note-error">
        <Helmet>
          <title>Note Not Found – Java Notes</title>
        </Helmet>
        <div className="error-icon">😔</div>
        <h1>This note isn't available.</h1>
        <p>
          The link you used points to a note that is private, unlisted, or no longer exists.
          If you received this URL directly from someone, ask them to check the visibility
          settings or send you an updated link.
        </p>
        <Button variant="primary" onClick={() => navigate("/feed")}>
          ← Back to Feed
        </Button>
      </div>
    );
  }

  const seoDescription = note.excerpt || `${note.title} – A note about ${note.tags.join(", ")}`;

  return (
    <>
      <Helmet>
        <title>{note.title} – Java Notes by ASafariM</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={`${note.title} – Java Notes`} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={note.title} />
        <meta name="twitter:description" content={seoDescription} />
      </Helmet>

      <div className="public-note-page">
        {/* Navigation */}
        <nav className="public-note-nav">
          <Link to="/feed">
            <Button variant="secondary">← Back to Feed</Button>
          </Link>
        </nav>

        {/* Header */}
        <header className="public-note-header">
          <h1 className="public-note-title">{note.title}</h1>

          <div className="public-note-meta">
            <span className="meta-item">
              ⏱️ {note.readingTimeMinutes} min read
            </span>
            <span className="meta-item">
              📊 {note.wordCount} words
            </span>
            <span className="meta-item">
              📅 {formatDate(note.createdAt)}
            </span>
            {note.authorDisplayName && (
              <span className="meta-item">
                👤 by {note.authorDisplayName}
              </span>
            )}
            <span className="meta-item">
              👁️ {note.viewCount} views
            </span>
          </div>

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="public-note-tags">
              {note.tags.map((tag) => (
                <Link key={tag} to={`/feed?tag=${encodeURIComponent(tag)}`}>
                  <TagBadge tag={tag} />
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <article className="public-note-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {note.content}
          </ReactMarkdown>
        </article>

        {/* Attachments */}
        {attachments.length > 0 && (
          <section className="public-note-attachments">
            <h2>📎 Attachments</h2>
            <AttachmentList
              attachments={attachments}
              isPublicContext={true}
              canDelete={false}
            />
          </section>
        )}

        {/* What Next Section */}
        <section className="public-note-footer">
          <h3>Keep exploring</h3>
          <p>
            Learning doesn't happen in isolation. If this note helped, open the feed or
            search for a related topic. Most of these notes are connected — you'll often
            find follow-ups, refactors, and "what I'd do differently now" posts.
          </p>
          <div className="footer-actions">
            {note.tags.length > 0 && (
              <Link to={`/feed?tag=${encodeURIComponent(note.tags[0])}`}>
                <Button variant="secondary">
                  See more notes tagged "{note.tags[0]}"
                </Button>
              </Link>
            )}
            <Link to="/search">
              <Button variant="secondary">🔍 Search all notes</Button>
            </Link>
            <Link to="/feed">
              <Button variant="primary">📚 Open the notes feed</Button>
            </Link>
          </div>
        </section>

        {/* Site Footer */}
        <footer className="public-site-footer">
          <p>
            Built on top of a real Spring Boot + React codebase, learn-java-notes is both
            a learning lab and a living reference. Every improvement in the app becomes a
            new page in the notes — and every page is grounded in working code.
          </p>
        </footer>
      </div>
    </>
  );
}
