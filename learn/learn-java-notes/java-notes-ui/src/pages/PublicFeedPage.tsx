import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  getFeaturedNotes,
  getTrendingNotes,
  getRecentPublicNotes,
  getPublicNotesByTag,
  type PublicNoteListItem,
} from "../api/notesApi";
import TagBadge from "../components/TagBadge";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import "./PublicFeedPage.css";

type FeedTab = "featured" | "trending" | "recent";

export default function PublicFeedPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagFilter = searchParams.get("tag");
  
  const [activeTab, setActiveTab] = useState<FeedTab>("featured");
  const [notes, setNotes] = useState<PublicNoteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, [activeTab, tagFilter]);

  const loadNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      let data: PublicNoteListItem[];
      
      if (tagFilter) {
        data = await getPublicNotesByTag(tagFilter);
      } else {
        switch (activeTab) {
          case "featured":
            data = await getFeaturedNotes();
            break;
          case "trending":
            data = await getTrendingNotes();
            break;
          case "recent":
            data = await getRecentPublicNotes();
            break;
          default:
            data = [];
        }
      }
      
      setNotes(data);
    } catch (err) {
      console.error("Failed to load feed:", err);
      setError("Failed to load notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearTagFilter = () => {
    setSearchParams({});
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <Helmet>
        <title>Java Notes Feed – Learn Java Faster</title>
        <meta
          name="description"
          content="Browse curated Java examples, cheat-sheets, and deep dives written in real project context."
        />
      </Helmet>

      <div className="public-feed-page">
        {/* Hero Section */}
        <header className="feed-hero">
          <h1>Learn Java faster with living, searchable notes.</h1>
          <p>
            Browse curated examples, cheat-sheets, and deep dives written in real project
            context — not generic tutorials.
          </p>
          <p className="feed-intro">
            This space is a growing collection of Java notes, experiments, and real-world
            patterns. Every page is backed by an actual codebase: Spring Boot, PostgreSQL,
            full-text search, analytics, tags, and more. Use it as a reference when you're
            stuck, or as a learning path when you want to level up.
          </p>
          <div className="hero-actions">
            <Link to="/search">
              <Button variant="primary">🔍 Search Notes</Button>
            </Link>
          </div>
        </header>

        {/* Tag Filter Banner */}
        {tagFilter && (
          <div className="tag-filter-banner">
            <span>Filtering by tag:</span>
            <TagBadge tag={tagFilter} />
            <button className="clear-filter" onClick={clearTagFilter}>
              × Clear
            </button>
          </div>
        )}

        {/* Tabs */}
        {!tagFilter && (
          <nav className="feed-tabs">
            <button
              className={`feed-tab ${activeTab === "featured" ? "active" : ""}`}
              onClick={() => setActiveTab("featured")}
            >
              ⭐ Featured Notes
            </button>
            <button
              className={`feed-tab ${activeTab === "trending" ? "active" : ""}`}
              onClick={() => setActiveTab("trending")}
            >
              🔥 Trending This Week
            </button>
            <button
              className={`feed-tab ${activeTab === "recent" ? "active" : ""}`}
              onClick={() => setActiveTab("recent")}
            >
              🆕 Fresh from the Lab
            </button>
          </nav>
        )}

        {/* Tab Descriptions */}
        {!tagFilter && (
          <div className="tab-description">
            {activeTab === "featured" && (
              <p>Hand-picked deep dives and "evergreen" pages worth bookmarking.</p>
            )}
            {activeTab === "trending" && (
              <p>Notes that developers have opened, searched for, and shared the most over the last days.</p>
            )}
            {activeTab === "recent" && (
              <p>Newly published notes and experiments — raw, honest, and evolving.</p>
            )}
          </div>
        )}

        {/* Notes List */}
        <section className="feed-notes">
          {loading ? (
            <div className="feed-loading">
              <div className="feed-spinner" />
              <span>Loading notes...</span>
            </div>
          ) : error ? (
            <div className="feed-error">
              <span>{error}</span>
              <Button variant="secondary" size="sm" onClick={loadNotes}>
                Retry
              </Button>
            </div>
          ) : notes.length === 0 ? (
            <div className="feed-empty">
              <span>📭</span>
              <p>No notes found {tagFilter ? `for tag "${tagFilter}"` : "in this section"}.</p>
              {tagFilter && (
                <Button variant="secondary" onClick={clearTagFilter}>
                  Clear Filter
                </Button>
              )}
            </div>
          ) : (
            <div className="notes-grid">
              {notes.map((note) => (
                <article key={note.id} className="feed-note-card">
                  <Link to={`/p/${note.publicId}/${note.slug}`} className="note-link">
                    <h3 className="note-title">{note.title}</h3>
                    <p className="note-excerpt">{note.excerpt}</p>
                    <div className="note-meta">
                      <span>⏱️ {note.readingTimeMinutes} min</span>
                      <span>📅 {formatDate(note.createdAt)}</span>
                      <span>👁️ {note.viewCount} views</span>
                    </div>
                  </Link>
                  {note.tags.length > 0 && (
                    <div className="note-tags">
                      {note.tags.slice(0, 3).map((tag) => (
                        <Link
                          key={tag}
                          to={`/feed?tag=${encodeURIComponent(tag)}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <TagBadge tag={tag} />
                        </Link>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="more-tags">+{note.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Browse by Topic */}
        <section className="browse-by-topic">
          <h2>📚 Browse by Topic</h2>
          <p>Jump straight into collections.</p>
          <div className="topic-chips">
            {["java", "spring-boot", "collections", "streams", "testing", "sql", "architecture"].map(
              (topic) => (
                <Link key={topic} to={`/feed?tag=${topic}`}>
                  <span className="topic-chip">{topic}</span>
                </Link>
              )
            )}
          </div>
        </section>

        {/* Site Footer */}
        <footer className="feed-site-footer">
          <p>
            Built on top of a real Spring Boot + React codebase, learn-java-notes is both a
            learning lab and a living reference. Every improvement in the app becomes a new
            page in the notes — and every page is grounded in working code.
          </p>
        </footer>
      </div>
    </>
  );
}
