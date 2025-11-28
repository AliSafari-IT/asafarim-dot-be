import { useState, useEffect, useRef } from "react";
import { getTags } from "../api/notesApi";
import TagBadge from "./TagBadge";
import "./TagPicker.css";

interface TagPickerProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagPicker({ selectedTags, onChange, placeholder = "Add tags..." }: TagPickerProps) {
  const [allTags, setAllTags] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getTags().then(setAllTags).catch(console.error);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = allTags.filter(t => !selectedTags.includes(t) && t.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (tag: string) => { onChange([...selectedTags, tag]); setSearch(""); };
  const handleRemove = (tag: string) => onChange(selectedTags.filter(t => t !== tag));

  return (
    <div className="tag-picker" ref={containerRef}>
      <div className="tag-picker-input-container">
        {selectedTags.map(tag => <TagBadge key={tag} tag={tag} onRemove={() => handleRemove(tag)} size="sm" />)}
        <input ref={inputRef} type="text" value={search} onChange={e => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)} placeholder={selectedTags.length === 0 ? placeholder : ""} className="tag-picker-input" />
      </div>
      {isOpen && filtered.length > 0 && (
        <ul className="tag-picker-dropdown">
          {filtered.slice(0, 15).map(tag => (
            <li key={tag} onClick={() => handleSelect(tag)} className="tag-picker-item"><TagBadge tag={tag} size="sm" /></li>
          ))}
        </ul>
      )}
    </div>
  );
}
