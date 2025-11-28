import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getTags } from "../api/notesApi";
import TagBadge from "./TagBadge";
import "./TagsSidebar.css";

export default function TagsSidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tags, setTags] = useState<string[]>([]);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const activeTag = searchParams.get("tag") || "";

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredTags(
        tags.filter((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredTags(tags);
    }
  }, [searchQuery, tags]);

  const loadTags = async () => {
    try {
      const tagsList = await getTags();
      setTags(tagsList);
      setFilteredTags(tagsList);
    } catch (error) {
      console.error("Failed to load tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      searchParams.delete("tag");
    } else {
      searchParams.set("tag", tag);
    }
    setSearchParams(searchParams);
  };

  const handleClearTag = () => {
    searchParams.delete("tag");
    setSearchParams(searchParams);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <aside className="tags-sidebar" aria-label="Tags Sidebar" data-testid="tags-sidebar">
      <div className="tags-sidebar-header">
        <div className="tags-sidebar-title">
          <h3>
            🏷️ Tags
            {tags.length > 0 && <span className="tag-count">{tags.length}</span>}
          </h3>
          {activeTag && (
            <button
              onClick={handleClearTag}
              className="clear-tag-btn"
              title="Clear filter"
              aria-label="Clear filter"
              data-testid="clear-tag-btn"
            >
              ✕
            </button>
          )}
        </div>

        <div className="tags-search-wrapper">
          <span className="tags-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="tags-search-input"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="tags-search-clear"
              title="Clear search"
              aria-label="Clear search"
              data-testid="clear-search-btn"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="tags-list-container">
        {loading ? (
          <div className="tags-loading">Loading tags...</div>
        ) : filteredTags.length === 0 ? (
          <div className="tags-empty">
            {searchQuery ? "No tags found" : "No tags yet"}
          </div>
        ) : (
          <ul className="tags-list">
            {filteredTags.map((tag, index) => (
              <li
                key={tag}
                className={`tag-item ${activeTag === tag ? "active" : ""}`}
                onClick={() => handleTagClick(tag)}
                aria-label={`Tag: ${tag}`}
                data-testid={"tag-item" + index}
                role="button"
                tabIndex={0}
              >
                <TagBadge tag={tag} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
