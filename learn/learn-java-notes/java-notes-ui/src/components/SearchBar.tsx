import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSearchSuggestions, getTags } from "../api/notesApi";
import { getTagColorStyle } from "../utils/colorUtils";
import "./SearchBar.css";

interface SearchBarProps {
  initialQuery?: string;
  initialTags?: string[];
  onSearch?: (query: string, tags: string[]) => void;
  placeholder?: string;
  showAdvancedLink?: boolean;
  className?: string;
}

export default function SearchBar({
  initialQuery = "",
  initialTags = [],
  onSearch,
  placeholder = "Search notes...",
  showAdvancedLink = true,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Sync selectedTags when initialTags prop changes
  useEffect(() => {
    setSelectedTags(initialTags);
  }, [initialTags]);

  // Load all tags for filter dropdown
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

  // Debounced autosuggest
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await getSearchSuggestions(query, 8);
        setSuggestions(results);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Failed to get suggestions:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(e.target as Node)
      ) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback(() => {
    if (onSearch) {
      onSearch(query, selectedTags);
    } else {
      // Navigate to search page with params
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
      navigate(`/search?${params.toString()}`);
    }
    setShowSuggestions(false);
  }, [query, selectedTags, onSearch, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selected = suggestions[selectedIndex];
          if (selected.startsWith("tag:")) {
            const tagName = selected.replace("tag:", "");
            if (!selectedTags.includes(tagName)) {
              setSelectedTags([...selectedTags, tagName]);
            }
            setQuery("");
          } else {
            setQuery(selected);
            handleSearch();
          }
        } else {
          handleSearch();
        }
        setShowSuggestions(false);
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion.startsWith("tag:")) {
      const tagName = suggestion.replace("tag:", "");
      if (!selectedTags.includes(tagName)) {
        setSelectedTags([...selectedTags, tagName]);
      }
      setQuery("");
    } else {
      setQuery(suggestion);
      setTimeout(handleSearch, 0);
    }
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const toggleTagFilter = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className={`search-bar-container ${className}`}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="search-selected-tags">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="search-tag"
              style={getTagColorStyle(tag)}
            >
              {tag}
              <button
                type="button"
                className="search-tag-remove"
                onClick={() => removeTag(tag)}
                aria-label={`Remove tag ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input Row */}
      <div className="search-input-row">
        <div className="search-input-wrapper">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Search"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
          />
          {isLoading && <span className="search-loading" />}
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Tag Filter Button */}
        <div className="search-tag-filter" ref={tagDropdownRef}>
          <button
            type="button"
            className="search-tag-btn"
            onClick={() => setShowTagDropdown(!showTagDropdown)}
            aria-label="Filter by tags"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            {selectedTags.length > 0 && (
              <span className="search-tag-count">{selectedTags.length}</span>
            )}
          </button>
          {showTagDropdown && (
            <div className="search-tag-dropdown">
              <div className="search-tag-dropdown-header">Filter by tags</div>
              <div className="search-tag-dropdown-list">
                {allTags.length === 0 ? (
                  <div className="search-tag-empty">No tags available</div>
                ) : (
                  allTags.map((tag) => (
                    <label key={tag} className="search-tag-option">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => toggleTagFilter(tag)}
                      />
                      <span
                        className="search-tag-option-name"
                        style={getTagColorStyle(tag)}
                      >
                        {tag}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          type="button"
          className="search-btn"
          onClick={handleSearch}
          aria-label="Search"
        >
          Search
        </button>

        {/* Advanced Search Link */}
        {showAdvancedLink && (
          <button
            type="button"
            className="search-advanced-link"
            onClick={() => {
              const params = new URLSearchParams();
              if (query) params.set("q", query);
              if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
              navigate(`/search?${params.toString()}`);
            }}
          >
            Advanced
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions" ref={suggestionsRef} role="listbox">
          {suggestions.map((suggestion, index) => {
            const isTag = suggestion.startsWith("tag:");
            const displayText = isTag ? suggestion.replace("tag:", "") : suggestion;
            return (
              <div
                key={suggestion}
                className={`search-suggestion ${
                  index === selectedIndex ? "selected" : ""
                } ${isTag ? "is-tag" : ""}`}
                onClick={() => handleSuggestionClick(suggestion)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                {isTag ? (
                  <>
                    <svg
                      className="suggestion-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    <span className="suggestion-tag" style={getTagColorStyle(displayText)}>
                      {displayText}
                    </span>
                  </>
                ) : (
                  <>
                    <svg
                      className="suggestion-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <span className="suggestion-text">{displayText}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
