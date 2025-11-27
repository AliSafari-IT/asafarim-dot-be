import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNote } from "../api/notesApi";
// import Layout from "../components/Layout";
import TagInput from "../components/TagInput";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import "./CreateNote.css";

export default function CreateNote() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    
    try {
      setLoading(true);
      await createNote({ title, content, tags });
      navigate("/");
    } catch (error) {
      console.error("Failed to create note:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="create-note">
        <div className="create-note-header">
          <h1 className="page-title">✨ Create New Note</h1>
          <p className="page-subtitle">
            Start documenting your learning journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="create-note-form">
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
              onClick={() => navigate("/")}
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
              {loading ? "⏳ Creating..." : "✨ Create Note"}
            </Button>
          </div>
        </form>
      </div>
  );
}
