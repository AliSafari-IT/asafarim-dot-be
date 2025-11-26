import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNote, updateNote } from "../api/notesApi";
import Layout from "../components/Layout";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import "./EditNote.css";

export default function EditNote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNote() {
      if (!id) return;
      
      try {
        setInitialLoading(true);
        const note = await getNote(Number(id));
        setTitle(note.title);
        setContent(note.content);
      } catch (err) {
        console.error("Failed to load note:", err);
        setError("Failed to load note. It may have been deleted.");
      } finally {
        setInitialLoading(false);
      }
    }

    loadNote();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !id) return;
    
    try {
      setLoading(true);
      await updateNote(Number(id), { title, content });
      navigate(`/note/${id}`);
    } catch (error) {
      console.error("Failed to update note:", error);
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <Layout>
        <div className="edit-note-loading">
          <div className="loading-spinner">📝</div>
          <p>Loading note...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="edit-note-error">
          <div className="error-icon">😔</div>
          <h2>Note not found</h2>
          <p>{error}</p>
          <Button
            variant="primary"
            onClick={() => navigate("/")}
            className="back-btn"
          >
            ← Back to Notes
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="edit-note">
        <div className="edit-note-header">
          <h1 className="page-title">✏️ Edit Note</h1>
          <p className="page-subtitle">
            Update your study notes with new insights
          </p>
        </div>

        <form onSubmit={handleSubmit} className="edit-note-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              📝 Note Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title..."
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">
              📖 Content (Markdown supported)
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Java Basics

## Variables
- `int` - integers
- `String` - text

### Code Example
```java
System.out.println(&quot;Hello World&quot;);
```

> 💡 **Tip:** Use markdown for formatting!"
              className="form-textarea"
              rows={12}
            />
            <div className="form-help">
              <span className="help-text">
                💡 Tip: Use Markdown for rich formatting (headers, code blocks, lists, etc.)
              </span>
            </div>
          </div>

          <div className="form-actions">
            <Button
              variant="secondary"
              onClick={() => navigate(`/note/${id}`)}
              className="cancel-btn"
            >
              ← Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading || !title.trim()}
              className="save-btn"
            >
              {loading ? "⏳ Updating..." : "💾 Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
