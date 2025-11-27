import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotes, deleteNote, type StudyNote } from "../api/notesApi";
import Layout from "../components/Layout";
import NoteCard from "../components/NoteCard";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import { useDebounce } from "../hooks/useDebounce";
import "./NotesList.css";

export default function NotesList() {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  
  // Debounce search query by 300ms
  const debouncedQuery = useDebounce(searchQuery, 300);

  async function load(query?: string) {
    try {
      setLoading(true);
      const data = await getNotes(query);
      setNotes(data);
      // Update total count only when not searching
      if (!query) {
        setTotalCount(data.length);
      }
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setLoading(false);
    }
  }

  // Load notes when debounced query changes (includes initial load)
  useEffect(() => {
    load(debouncedQuery || undefined);
  }, [debouncedQuery]);

  async function handleDelete(id: number) {
    await deleteNote(id);
    load(debouncedQuery || undefined);
  }

  function handleClearSearch() {
    setSearchQuery("");
  }

  const isSearching = searchQuery.trim().length > 0;
  const hasNoResults = !loading && notes.length === 0 && isSearching;

  return (
    <Layout>
      <div className="notes-list-header">
        <div className="header-text">
          <h1 className="page-title">Study Notes</h1>
          <p className="page-subtitle">
            Organize your learning journey with beautiful, searchable notes
          </p>
        </div>
        <div className="header-actions">
          <Link to="/create">
            <Button
              variant="primary"
              className="create-note-btn"
            >
              ✨ Create New Note
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title or content..."
            className="search-input"
          />
          {isSearching && (
            <button
              onClick={handleClearSearch}
              className="clear-search-btn"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {isSearching && !loading && (
          <div className="search-results-info">
            Found <strong>{notes.length}</strong> {notes.length === 1 ? "note" : "notes"} 
            {totalCount > 0 && ` out of ${totalCount}`} matching "{searchQuery}"
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner">📚</div>
          <p>{isSearching ? "Searching..." : "Loading your notes..."}</p>
        </div>
      ) : hasNoResults ? (
        <div className="no-results-state">
          <div className="no-results-icon">🔍</div>
          <h2>No notes found</h2>
          <p>No notes match your search for "{searchQuery}"</p>
          <Button
            variant="secondary"
            onClick={handleClearSearch}
            className="clear-search-action-btn"
          >
            ✕ Clear Search
          </Button>
        </div>
      ) : notes.length > 0 ? (
        <div className="notes-grid">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h2>No notes yet</h2>
          <p>Start your learning journey by creating your first study note!</p>
          <Link to="/create">
            <Button
              variant="primary"
              className="empty-action-btn"
            >
              🚀 Create Your First Note
            </Button>
          </Link>
        </div>
      )}
    </Layout>
  );
}
