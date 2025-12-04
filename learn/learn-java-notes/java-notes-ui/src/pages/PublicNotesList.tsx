import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getPublicNotes, getMyNotes, type StudyNote } from "../api/notesApi";
import NoteCard from "../components/NoteCard";
import TagBadge from "../components/TagBadge";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import { useDebounce } from "../hooks/useDebounce";
import "./PublicNotesList.css";
import { useAuth } from "../contexts/useAuth";

export default function PublicNotesList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);
  const activeTag = searchParams.get("tag") || "";
  const activeSort = searchParams.get("sort") || "newest";
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function loadNotes() {
      try {
        setLoading(true);
        let data: StudyNote[];

        // Handle "myNotes" filter
        if (activeSort === "myNotes" && isAuthenticated) {
          const response = await getMyNotes({
            query: debouncedQuery || undefined,
            tag: activeTag || undefined,
            sort: undefined, // Don't pass sort to myNotes endpoint
            page: 0,
            size: 100, // Load more for public view
          });
          data = response.items;
        } else {
          const filter = {
            query: debouncedQuery || undefined,
            tag: activeTag || undefined,
            sort: activeSort || undefined,
          };
          data = await getPublicNotes(filter);
        }

        setNotes(data);
        if (!debouncedQuery && !activeTag) {
          setTotalCount(data.length);
        }

        // Extract unique tags from notes
        const tagSet = new Set<string>();
        data.forEach((note) => note.tags?.forEach((tag) => tagSet.add(tag)));
        setAllTags(Array.from(tagSet).sort());
      } catch (error) {
        console.error("Failed to load public notes:", error);
      } finally {
        setLoading(false);
      }
    }

    loadNotes();
  }, [debouncedQuery, activeTag, activeSort, isAuthenticated]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function handleClearSearch() {
    setSearchQuery("");
  }

  function handleTagClick(tag: string) {
    if (activeTag === tag) {
      searchParams.delete("tag");
    } else {
      searchParams.set("tag", tag);
    }
    setSearchParams(searchParams);
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
  const isFiltering = isSearching || activeTag || activeSort === "myNotes";
  const hasNoResults = !loading && notes.length === 0 && isFiltering;

  const displayTags = useMemo(() => {
    if (allTags.length > 0) return allTags;
    const tagSet = new Set<string>();
    notes.forEach((note) => note.tags?.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [notes, allTags]);

  return (
    <div className="public-notes-page-container">
      <div className="public-notes-list-header">
        <div className="header-text">
          <h1 className="page-title">🌍 Public Notes</h1>
          <p className="page-subtitle">
            Explore community knowledge and learning resources
          </p>
        </div>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate("/")}>
            ← Back to My Notes
          </Button>
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
              placeholder="Search public notes by title or content..."
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
              {isAuthenticated && (
                <option value="myNotes">Notes created by me</option>
              )}
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="az">Title A–Z</option>
              <option value="za">Title Z–A</option>
              <option value="readingTime">Shortest reading time</option>
              <option value="wordCount">Smallest word count</option>
            </select>
          </div>

          {isMobileView && displayTags.length > 0 && (
            <div className="notes-tags-filter-container">
              <span className="notes-tags-filter-label">Filter by tag:</span>
              <div className="notes-tags-filter-list">
                {displayTags.map((tag) => (
                  <TagBadge
                    key={tag}
                    tag={tag}
                    onClick={handleTagClick}
                    isActive={activeTag === tag}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Info */}
        {isFiltering && !loading && (
          <div className="active-filters-info">
            <div className="filter-summary">
              Found <strong>{notes.length}</strong>{" "}
              {notes.length === 1 ? "note" : "notes"}
              {totalCount > 0 && ` out of ${totalCount}`}
              {activeSort === "myNotes" && <> created by me</>}
              {isSearching && (
                <>
                  {activeSort === "myNotes" ? " matching " : " matching "}
                  <em>"{searchQuery}"</em>
                </>
              )}
              {activeTag && (
                <span className="active-tag-filter">
                  {isSearching || activeSort === "myNotes"
                    ? " with tag "
                    : " tagged "}
                  <TagBadge
                    tag={activeTag}
                    onRemove={handleClearTagFilter}
                    isActive
                    size="sm"
                  />
                </span>
              )}
            </div>
            {(isSearching || activeTag || activeSort === "myNotes") && (
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
          <p>{isSearching ? "Searching..." : "Loading public notes..."}</p>
        </div>
      ) : hasNoResults ? (
        <div className="no-results-state">
          <div className="no-results-icon">🔍</div>
          <h2>No notes found</h2>
          <p>
            No public notes match your filters
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
        <div className="notes-grid">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={() => {}}
              canDelete={false}
              linkTo={`/public/note/${note.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="public-empty-state">
          <div className="empty-icon">🌍</div>
          <h2>No public notes yet</h2>
          <p>Be the first to share your knowledge with the community!</p>
          <Button variant="brand" size="lg" onClick={() => navigate("/")}>
            ← Back to My Notes
          </Button>
        </div>
      )}
    </div>
  );
}
