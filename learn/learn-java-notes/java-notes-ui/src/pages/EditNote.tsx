import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNote, updateNote } from "../api/notesApi";
import TagInput from "../components/TagInput";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import "./EditNote.css";

export default function EditNote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNote() {
      if (!id) return;
      
      try {
        setInitialLoading(true);
        const note = await getNote(id);
        setTitle(note.title);
        setContent(note.content);
        setTags(note.tags || []);
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
      await updateNote(id, { title, content, tags });
      navigate(`/note/${id}`);
    } catch (error) {
      console.error("Failed to update note:", error);
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="edit-note-loading">
        <div className="loading-spinner">📝</div>
        <p>Loading note...</p>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
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

          <div className="form-group">
            <label className="form-label">
              🏷️ Tags
            </label>
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder="Add tags like 'java', 'spring', 'basics'..."
            />
          </div>

          <div className="form-actions">
            <Button
              variant="secondary"
              onClick={() => navigate(`/note/${id}`)}
            >
              ← Cancel
            </Button>
            <Button
              variant="success"
              type="submit"
              disabled={loading || !title.trim()}
            >
              {loading ? "⏳ Updating..." : "💾 Save Changes"}
            </Button>
          </div>
        </form>
      </div>
  );
}
