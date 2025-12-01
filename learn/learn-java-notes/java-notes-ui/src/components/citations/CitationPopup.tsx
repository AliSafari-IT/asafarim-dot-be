import { useState, useEffect, useRef, useCallback } from 'react';
import { getNotes } from '../../api/notesApi';
import './CitationPopup.css';

interface NoteOption {
  id: string;
  publicId?: string;
  title: string;
  authors?: string;
  publicationYear?: number;
}

interface CitationPopupProps {
  isOpen: boolean;
  searchQuery: string;
  position: { top: number; left: number };
  excludeNoteId?: string;
  onSelect: (note: NoteOption) => void;
  onClose: () => void;
}

export default function CitationPopup({
  isOpen,
  searchQuery,
  position,
  excludeNoteId,
  onSelect,
  onClose,
}: CitationPopupProps) {
  const [notes, setNotes] = useState<NoteOption[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<NoteOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const allNotes = await getNotes();
      const options: NoteOption[] = allNotes
        .filter((n: { id: string }) => n.id !== excludeNoteId)
        .map((n: { id: string; publicId?: string; title: string; authors?: string; publicationYear?: number }) => ({
          id: n.id,
          publicId: n.publicId,
          title: n.title,
          authors: n.authors,
          publicationYear: n.publicationYear,
        }));
      setNotes(options);
    } catch {
      console.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [excludeNoteId]);

  useEffect(() => {
    if (isOpen) {
      loadNotes();
    }
  }, [isOpen, loadNotes]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.authors?.toLowerCase().includes(query) ||
        n.publicId?.toLowerCase().includes(query)
    );
    setFilteredNotes(filtered.slice(0, 10));
    setSelectedIndex(0);
  }, [searchQuery, notes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filteredNotes.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredNotes[selectedIndex]) {
            onSelect(filteredNotes[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredNotes, selectedIndex, onSelect, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className="citation-popup"
      style={{ top: position.top, left: position.left }}
    >
      <div className="popup-header">
        <span className="popup-icon">📚</span>
        <span className="popup-title">Insert Citation</span>
        <span className="popup-hint">↑↓ navigate • Enter select • Esc close</span>
      </div>
      {loading ? (
        <div className="popup-loading">Loading notes...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="popup-empty">No notes found</div>
      ) : (
        <ul className="popup-list">
          {filteredNotes.map((note, index) => (
            <li
              key={note.id}
              className={`popup-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => onSelect(note)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="item-title">{note.title}</span>
              {note.authors && <span className="item-meta">{note.authors}</span>}
              {note.publicationYear && <span className="item-year">({note.publicationYear})</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
