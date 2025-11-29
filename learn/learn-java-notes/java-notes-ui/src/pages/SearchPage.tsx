import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  advancedSearch,
  publicAdvancedSearch,
  trackSearchClick,
  getTags,
  type AdvancedSearchRequest,
  type AdvancedSearchResult,
  type SearchHit,
} from "../api/notesApi";
import { useAuth } from "../contexts/useAuth";
import SearchBar from "../components/SearchBar";
import { getTagColorStyle } from "../utils/colorUtils";
import "./SearchPage.css";

type SortOption = "relevance" | "date" | "updated" | "popularity";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Search state
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tags")?.split(",").filter(Boolean) || []
  );
  const [hasAttachments, setHasAttachments] = useState(
    searchParams.get("attachments") === "true"
  );
  const [sort, setSort] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "relevance"
  );
  const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "");

  // Results state
  const [result, setResult] = useState<AdvancedSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Pagination
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Load tags for filter
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getTags();
        setAllTags(tags);
      } catch (err) {
        console.error("Failed to load tags:", err);
      }
    };
    loadTags();
  }, []);

  // Execute search when params change
  const executeSearch = useCallback(async (resetOffset = true) => {
    setLoading(true);
    setError(null);
    
    const request: AdvancedSearchRequest = {
      query: query || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      hasAttachments: hasAttachments || undefined,
      sort,
      limit,
      offset: resetOffset ? 0 : offset,
    };

    // Apply date filter
    if (dateFilter) {
      const now = new Date();
      switch (dateFilter) {
        case "today":
          request.createdAfter = new Date(now.setHours(0, 0, 0, 0)).toISOString();
          break;
        case "week":
          request.createdAfter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case "month":
          request.createdAfter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case "year":
          request.createdAfter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
          break;
      }
    }

    if (resetOffset) {
      setOffset(0);
    }

    try {
      const searchFn = isAuthenticated ? advancedSearch : publicAdvancedSearch;
      const data = await searchFn(request);
      setResult(data);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query, selectedTags, hasAttachments, sort, dateFilter, offset, isAuthenticated]);

  // Search on mount only (intentionally not including executeSearch in deps)
  useEffect(() => {
    executeSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-search when query or filters change (from handleSearch or filters)
  useEffect(() => {
    executeSearch(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedTags, hasAttachments, sort, dateFilter]);

  // Update URL when search params change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    if (hasAttachments) params.set("attachments", "true");
    if (sort !== "relevance") params.set("sort", sort);
    if (dateFilter) params.set("date", dateFilter);
    setSearchParams(params, { replace: true });
  }, [query, selectedTags, hasAttachments, sort, dateFilter, setSearchParams]);

  const handleSearch = (newQuery: string, newTags: string[]) => {
    setQuery(newQuery);
    setSelectedTags(newTags);
    // Note: executeSearch will be called by useEffect when query/selectedTags change
  };

  const handleResultClick = (hit: SearchHit, index: number) => {
    trackSearchClick(hit.id, index);
    navigate(`/note/${hit.id}`);
  };

  const handleLoadMore = () => {
    setOffset(offset + limit);
    executeSearch(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery || !text) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="search-highlight">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="search-page">
      <div className="search-page-header">
        <h1>Search Notes</h1>
        <SearchBar
          initialQuery={query}
          onSearch={handleSearch}
          showAdvancedLink={false}
          className="search-page-bar"
        />
      </div>

      {/* Advanced Filters */}
      <div className="search-filters">
        <div className="search-filter-group">
          <label className="search-filter-label">Sort by</label>
          <select
            className="search-filter-select"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption);
              executeSearch(true);
            }}
          >
            <option value="relevance">Relevance</option>
            <option value="date">Newest First</option>
            <option value="updated">Recently Updated</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>

        <div className="search-filter-group">
          <label className="search-filter-label">Date</label>
          <select
            className="search-filter-select"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              executeSearch(true);
            }}
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="year">Past Year</option>
          </select>
        </div>

        <div className="search-filter-group">
          <label className="search-filter-checkbox">
            <input
              type="checkbox"
              checked={hasAttachments}
              onChange={(e) => {
                setHasAttachments(e.target.checked);
                executeSearch(true);
              }}
            />
            <span>Has Attachments</span>
          </label>
        </div>
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="search-tag-filters">
          <span className="search-tag-filters-label">Tags:</span>
          <div className="search-tag-chips">
            {allTags.slice(0, 15).map((tag) => (
              <button
                key={tag}
                type="button"
                className={`search-tag-chip ${selectedTags.includes(tag) ? "active" : ""}`}
                style={getTagColorStyle(tag)}
                onClick={() => {
                  const newTags = selectedTags.includes(tag)
                    ? selectedTags.filter((t) => t !== tag)
                    : [...selectedTags, tag];
                  setSelectedTags(newTags);
                  executeSearch(true);
                }}
              >
                {tag}
              </button>
            ))}
            {allTags.length > 15 && (
              <span className="search-tag-more">+{allTags.length - 15} more</span>
            )}
          </div>
        </div>
      )}

      {/* Search Info */}
      {result && !loading && (
        <div className="search-info">
          <span className="search-info-count">
            {result.totalCount} {result.totalCount === 1 ? "result" : "results"}
            {query && ` for "${query}"`}
          </span>
          <span className="search-info-time">
            ({result.searchTimeMs}ms)
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="search-error">
          <span>{error}</span>
          <button onClick={() => executeSearch(true)}>Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="search-loading">
          <div className="search-loading-spinner" />
          <span>Searching...</span>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="search-results">
          {result.hits.length === 0 ? (
            <div className="search-no-results">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <h3>No results found</h3>
              <p>Try different keywords or remove some filters.</p>
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="search-suggestions-box">
                  <p>Try searching for:</p>
                  <div className="search-suggestions-list">
                    {result.suggestions.map((s) => (
                      <button
                        key={s}
                        className="search-suggestion-btn"
                        onClick={() => {
                          setQuery(s);
                          executeSearch(true);
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {result.hits.map((hit, index) => (
                <div
                  key={hit.id}
                  className="search-result-card"
                  onClick={() => handleResultClick(hit, index)}
                >
                  <div className="search-result-header">
                    <h3 className="search-result-title">
                      {highlightText(hit.title, query)}
                    </h3>
                    <div className="search-result-meta">
                      {hit.isPublic && (
                        <span className="search-result-badge public">Public</span>
                      )}
                      {hit.attachmentCount > 0 && (
                        <span className="search-result-badge attachment">
                          📎 {hit.attachmentCount}
                        </span>
                      )}
                      <span className="search-result-views">
                        👁 {hit.viewCount}
                      </span>
                    </div>
                  </div>

                  <p className="search-result-preview">
                    {highlightText(hit.contentPreview, query)}
                  </p>

                  <div className="search-result-footer">
                    <div className="search-result-tags">
                      {hit.allTags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className={`search-result-tag ${hit.matchedTags.includes(tag) ? "matched" : ""}`}
                          style={getTagColorStyle(tag)}
                        >
                          {tag}
                        </span>
                      ))}
                      {hit.allTags.length > 5 && (
                        <span className="search-result-tag-more">
                          +{hit.allTags.length - 5}
                        </span>
                      )}
                    </div>
                    <span className="search-result-date">
                      {formatDate(hit.updatedAt)}
                    </span>
                  </div>

                  {/* Relevance indicator */}
                  {sort === "relevance" && hit.relevanceScore > 0 && (
                    <div
                      className="search-result-relevance"
                      style={{ width: `${Math.min(hit.relevanceScore, 100)}%` }}
                    />
                  )}
                </div>
              ))}

              {/* Load More */}
              {result.hits.length < result.totalCount && (
                <button
                  className="search-load-more"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  Load More ({result.totalCount - result.hits.length - offset} remaining)
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Related Tags */}
      {result && result.relatedTags && result.relatedTags.length > 0 && (
        <div className="search-related">
          <h4>Related Tags</h4>
          <div className="search-related-tags">
            {result.relatedTags.map((tag) => (
              <button
                key={tag.name}
                className="search-related-tag"
                style={getTagColorStyle(tag.name)}
                onClick={() => {
                  if (!selectedTags.includes(tag.name)) {
                    setSelectedTags([...selectedTags, tag.name]);
                    executeSearch(true);
                  }
                }}
              >
                {tag.name} <span className="tag-count">({tag.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
