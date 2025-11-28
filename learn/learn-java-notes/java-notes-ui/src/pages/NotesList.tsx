import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getNotes, getPublicNotes, deleteNote, type StudyNote } from "../api/notesApi";
import NoteCard from "../components/NoteCard";
import TagBadge from "../components/TagBadge";
import { ButtonComponent as Button, ConfirmDialog } from "@asafarim/shared-ui-react";
import { useDebounce } from "../hooks/useDebounce";
import { useAuth } from "../contexts/useAuth";
import "./NotesList.css";

export default function NotesList() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [noteIdToDelete, setNoteIdToDelete] = useState<string | null>(null);
  
  // Get active tag & sort from URL
  const activeTag = searchParams.get("tag") || "";
  const activeSort = searchParams.get("sort") || "newest";
  
  // Debounce search query by 300ms
  const debouncedQuery = useDebounce(searchQuery, 300);


  const load = useCallback(async (query?: string, tag?: string, sort?: string) => {
    try {
      setLoading(true);
      const filter = {
        query: query || undefined,
        tag: tag || undefined,
        sort: sort || undefined,
      };
      const data = !isAuthenticated
        ? await getPublicNotes(filter)
        : await getNotes(filter);
      setNotes(data);
      // Update total count only when not filtering
      if (!query && !tag) {
        setTotalCount(data.length);
      }
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load notes when debounced query or active tag changes
  useEffect(() => {
    load(debouncedQuery || undefined, activeTag || undefined, activeSort || undefined);
  }, [debouncedQuery, activeTag, activeSort, load]);


  async function handleDelete(id: string) {
    if (!isAuthenticated) {
      return;
    }
    setNoteIdToDelete(id);
    setConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!noteIdToDelete) return;

    await deleteNote(noteIdToDelete);
    setConfirmOpen(false);
    setNoteIdToDelete(null);
    load(debouncedQuery || undefined, activeTag || undefined, activeSort || undefined);
  }

  function handleClearSearch() {
    setSearchQuery("");
  }


  function handleClearTagFilter() {
    searchParams.delete("tag");
    setSearchParams(searchParams);
  }

  function handleClearAllFilters() {
    setSearchQuery("");
    searchParams.delete("tag");
    searchParams.delete("sort");
    setSearchParams(searchParams);
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    if (value === "newest") {
      searchParams.delete("sort");
    } else {
      searchParams.set("sort", value);
    }
    setSearchParams(searchParams);
  }

  const isSearching = searchQuery.trim().length > 0;
  const isFiltering = isSearching || activeTag;
  const hasNoResults = !loading && notes.length === 0 && isFiltering;


  return (
    <div className="notes-page-container">
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
              variant="info"
            >
              ✨ Create New Note
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="search-filter-section">
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
        </div>

        {/* Sort & Tags Filter */}
        <div className="notes-sort-filter-row">
          <div className="notes-sort-control">
            <label className="notes-sort-label" htmlFor="sort">
              Sort by
            </label>
            <select
              id="sort"
              value={activeSort}
              onChange={handleSortChange}
              className="notes-sort-select"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="az">Title A–Z</option>
              <option value="za">Title Z–A</option>
              <option value="readingTime">Shortest reading time</option>
              <option value="wordCount">Smallest word count</option>
            </select>
          </div>
        </div>

        {/* Active Filters Info */}
        {isFiltering && !loading && (
          <div className="active-filters-info">
            <div className="filter-summary">
              Found <strong>{notes.length}</strong> {notes.length === 1 ? "note" : "notes"}
              {totalCount > 0 && ` out of ${totalCount}`}
              {isSearching && <> matching "<em>{searchQuery}</em>"</>}
              {activeTag && (
                <span className="active-tag-filter">
                  {isSearching ? " with tag " : " tagged "}
                  <TagBadge
                    tag={activeTag}
                    onRemove={handleClearTagFilter}
                    isActive
                    size="sm"
                  />
                </span>
              )}
            </div>
            {(isSearching || activeTag) && (
              <button
                onClick={handleClearAllFilters}
                className="clear-all-filters-btn"
              >
                Clear all filters
              </button>
            )}
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
          <p>
            No notes match your filters
            {isSearching && <> for "{searchQuery}"</>}
            {activeTag && <> with tag "{activeTag}"</>}
          </p>
          <Button
            variant="secondary"
            onClick={handleClearAllFilters}
            className="clear-search-action-btn"
          >
            ✕ Clear All Filters
          </Button>
        </div>
      ) : notes.length > 0 ? (
        <>
          <div className="notes-grid">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={handleDelete}
                canDelete={isAuthenticated}
                linkTo={isAuthenticated ? undefined : `/public/note/${note.id}`}
              />
            ))}
          </div>

          <ConfirmDialog
            open={confirmOpen}
            title="Delete note?"
            description="This action will permanently delete the note and cannot be undone."
            confirmLabel="Delete"
            cancelLabel="Cancel"
            confirmVariant="danger"
            onConfirm={handleConfirmDelete}
            onCancel={() => {
              setConfirmOpen(false);
              setNoteIdToDelete(null);
            }}
          />
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h2>No notes yet</h2>
          <p>Start your learning journey by creating your first study note!</p>
          <Link to="/create">
            <Button
              variant="brand"
              size="lg"

            >
              🚀 Create Your First Note
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
