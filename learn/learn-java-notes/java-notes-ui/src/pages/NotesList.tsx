import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotes, deleteNote, type StudyNote } from "../api/notesApi";
import Layout from "../components/Layout";
import NoteCard from "../components/NoteCard";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import "./NotesList.css";

export default function NotesList() {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const data = await getNotes();
      setNotes(data);
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    await deleteNote(id);
    load();
  }

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

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner">📚</div>
          <p>Loading your notes...</p>
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
