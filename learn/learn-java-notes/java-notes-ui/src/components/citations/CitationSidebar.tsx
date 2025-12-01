// learn/learn-java-notes/java-notes-ui/src/components/citations/CitationSidebar.tsx 
import { useState, useEffect, useCallback } from 'react';
import { ButtonComponent as Button } from '@asafarim/shared-ui-react';
import {
  getCitedNotes,
  getCitingNotes,
  createCitation,
  deleteCitation,
  getCitationStats,
} from '../../api/citationApi';
import { getNotes } from '../../api/notesApi';
import type { CitedNote, CitingNote, CitationStats, CitationStyle } from '../../types/citation';
import { CitationStyleLabels } from '../../types/bibliography';
import './CitationSidebar.css';

interface CitationSidebarProps {
  noteId?: string; // Optional - undefined for new notes in "pending" mode
  citationStyle: CitationStyle;
  onInsertCitation: (marker: string) => void;
  onStyleChange: (style: CitationStyle) => void;
}

interface NoteOption {
  id: string;
  title: string;
  authors?: string;
  publicationYear?: number;
}

export default function CitationSidebar({
  noteId,
  citationStyle,
  onInsertCitation,
  onStyleChange,
}: CitationSidebarProps) {
  const [citedNotes, setCitedNotes] = useState<CitedNote[]>([]);
  const [citingNotes, setCitingNotes] = useState<CitingNote[]>([]);
  const [stats, setStats] = useState<CitationStats | null>(null);
  const [allNotes, setAllNotes] = useState<NoteOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cited' | 'citing' | 'add'>('cited');
  
  // Mobile drawer state
  const [isOpen, setIsOpen] = useState(false);

  const loadCitations = useCallback(async () => {
    if (!noteId) return;
    setLoading(true);
    try {
      const [cited, citing, citationStats] = await Promise.all([
        getCitedNotes(noteId),
        getCitingNotes(noteId),
        getCitationStats(noteId),
      ]);
      setCitedNotes(cited);
      setCitingNotes(citing);
      setStats(citationStats);
    } catch {
      console.error('Failed to load citations');
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  const loadAllNotes = useCallback(async () => {
    try {
      const notes = await getNotes();
      setAllNotes(
        notes
          .filter((n: { id: string }) => n.id !== noteId)
          .map((n: { id: string; title: string }) => ({
            id: n.id,
            title: n.title,
          }))
      );
    } catch {
      console.error('Failed to load notes');
    }
  }, [noteId]);

  useEffect(() => {
    loadCitations();
    loadAllNotes();
  }, [loadCitations, loadAllNotes]);

  const handleAddCitation = async (targetNoteId: string) => {
    // Can't create citation relationship without a saved note
    if (!noteId) {
      console.log('Note must be saved before creating citation relationships');
      return;
    }
    try {
      await createCitation(noteId, targetNoteId, {});
      loadCitations();
    } catch {
      console.error('Failed to add citation');
    }
  };

  const handleRemoveCitation = async (citationId: string) => {
    try {
      await deleteCitation(citationId);
      loadCitations();
    } catch {
      console.error('Failed to remove citation');
    }
  };

  const handleInsertCitation = (note: CitedNote) => {
    // Insert @note:publicId marker so backend can detect and format it
    const marker = `@note:${note.publicId || note.noteId}`;
    onInsertCitation(marker);
  };

  const filteredNotes = allNotes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !citedNotes.some((c) => c.noteId === n.id)
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="citation-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close citations' : 'Open citations'}
      >
        📚 {citedNotes.length > 0 && <span className="badge">{citedNotes.length}</span>}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="citation-backdrop" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={`citation-sidebar ${isOpen ? 'open' : ''}`}>
        <header className="sidebar-header">
          <h3>📚 Citations</h3>
          <button 
            className="close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            ✕
          </button>
        </header>
        
        <div className="sidebar-style-select">
          <select
            value={citationStyle}
            onChange={(e) => onStyleChange(e.target.value as CitationStyle)}
            className="style-select"
          >
            {Object.entries(CitationStyleLabels).map(([key, { name, example }]) => (
              <option key={key} value={key}>
                {name} {example}
              </option>
            ))}
          </select>
        </div>

      {stats && (
        <div className="stats-bar">
          <span>Cites: {stats.outgoingCitations}</span>
          <span>Cited by: {stats.incomingCitations}</span>
        </div>
      )}

      <div className="sidebar-tabs">
        <button
          className={`tab ${activeTab === 'cited' ? 'active' : ''}`}
          onClick={() => setActiveTab('cited')}
        >
          Cited ({citedNotes.length})
        </button>
        <button
          className={`tab ${activeTab === 'citing' ? 'active' : ''}`}
          onClick={() => setActiveTab('citing')}
        >
          Cited By ({citingNotes.length})
        </button>
        <button
          className={`tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          + Add
        </button>
      </div>

      <div className="citations-list">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : activeTab === 'cited' ? (
          citedNotes.length === 0 ? (
            <div className="empty">No citations yet</div>
          ) : (
            citedNotes.map((note, index) => (
              <div key={note.citationId} className="citation-item">
                <div className="citation-info">
                  <span className="citation-order">[{index + 1}]</span>
                  <div className="citation-details">
                    <span className="citation-title">{note.title}</span>
                    {note.authors && <span className="citation-author">{note.authors}</span>}
                  </div>
                </div>
                <div className="citation-actions">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleInsertCitation(note)}
                  >
                    📎 Cite
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleRemoveCitation(note.citationId)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))
          )
        ) : activeTab === 'citing' ? (
          citingNotes.length === 0 ? (
            <div className="empty">Not cited by any notes</div>
          ) : (
            citingNotes.map((note) => (
              <div key={note.citationId} className="citation-item citing">
                <div className="citation-info">
                  <div className="citation-details">
                    <span className="citation-title">{note.title}</span>
                    {note.authors && <span className="citation-author">{note.authors}</span>}
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          <>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search notes to cite..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {filteredNotes.length === 0 ? (
              <div className="empty">No notes to add</div>
            ) : (
              filteredNotes.slice(0, 20).map((note) => (
                <div key={note.id} className="citation-item add">
                  <div className="citation-info">
                    <div className="citation-details">
                      <span className="citation-title">{note.title}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => handleAddCitation(note.id)}>
                    + Add
                  </Button>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
}
