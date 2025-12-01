import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNote } from "../api/notesApi";
import TagInput from "../components/TagInput";
import { MarkdownEditor } from "../components/MarkdownEditor";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import "./CreateNote.css";

export default function CreateNote() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    
    try {
      setLoading(true);
      await createNote({ title, content, isPublic, tags });
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
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder={`# Java Basics

## Variables
- \`int\` - integers
- \`String\` - text

### Code Example
\`\`\`java
System.out.println('Hello World');
\`\`\`

> 💡 **Tip:** Use markdown for formatting!

Type @ to insert citations to other notes.`}
              minHeight={400}
              showPreview={true}
            />
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

          <div className="form-group">
            <label className="visibility-toggle">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="visibility-checkbox"
              />
              <span className="visibility-label">
                {isPublic ? "🌍 Public Note" : "🔒 Private Note"}
                <span className="visibility-description">
                  {isPublic
                    ? "Anyone can view this note"
                    : "Only you can view this note"}
                </span>
              </span>
            </label>
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
