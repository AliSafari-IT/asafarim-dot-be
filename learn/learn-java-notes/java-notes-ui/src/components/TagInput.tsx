import { useState, useEffect, useRef, useMemo } from "react";
import { getTags } from "../api/notesApi";
import "./TagInput.css";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ value, onChange, placeholder = "Add tags..." }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load existing tags for suggestions
  useEffect(() => {
    async function loadTags() {
      try {
        const tags = await getTags();
        setAllTags(tags);
      } catch (error) {
        console.error("Failed to load tags:", error);
      }
    }
    loadTags();
  }, []);

  // Filter suggestions based on input (using useMemo instead of useEffect)
  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return [];
    return allTags.filter(
      (tag) =>
        tag.toLowerCase().includes(inputValue.toLowerCase()) &&
        !value.includes(tag)
    );
  }, [inputValue, allTags, value]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function addTag(tag: string) {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !value.includes(normalizedTag)) {
      onChange([...value, normalizedTag]);
    }
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function removeTag(tagToRemove: string) {
    onChange(value.filter((tag) => tag !== tagToRemove));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div className="tag-input-container" ref={containerRef}>
      <div className="tag-input-wrapper">
        {value.map((tag) => (
          <span key={tag} className="tag-chip">
            <span className="tag-chip-text">{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="tag-chip-remove"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(e.target.value.trim().length > 0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(inputValue.trim().length > 0 && suggestions.length > 0)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="tag-input"
        />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="tag-suggestions">
          {suggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="tag-suggestion-item"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      
      <div className="tag-input-hint">
        Press Enter or comma to add a tag
      </div>
    </div>
  );
}
