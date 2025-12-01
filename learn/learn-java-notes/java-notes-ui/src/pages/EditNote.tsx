import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNote, updateNote, getAttachments, updateAttachment, type Attachment } from "../api/notesApi";
import TagInput from "../components/TagInput";
import AttachmentUploader from "../components/AttachmentUploader";
import AttachmentList from "../components/AttachmentList";
import { CitationSidebar } from "../components/citations";
import { MarkdownEditor, type MarkdownEditorHandle } from "../components/MarkdownEditor";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import type { CitationStyle } from "../types/citation";
import "./EditNote.css";

export default function EditNote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentBaseline, setAttachmentBaseline] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Academic metadata state
  const [authors, setAuthors] = useState("");
  const [publicationYear, setPublicationYear] = useState<number | undefined>();
  
  // Citation state
  const [citationStyle, setCitationStyle] = useState<CitationStyle>("APA");
  
  // Editor ref for imperative control (insert at cursor)
  const editorRef = useRef<MarkdownEditorHandle>(null);

  useEffect(() => {
    async function loadNote() {
      if (!id) return;
      
      try {
        setInitialLoading(true);
        const note = await getNote(id);
        setTitle(note.title);
        setContent(note.content);
        setIsPublic(note.isPublic);
        setTags(note.tags || []);
        setAuthors(note.authors || "");
        setPublicationYear(note.publicationYear);
        
        // Load attachments
        try {
          const noteAttachments = await getAttachments(id);
          setAttachments(noteAttachments);
          setAttachmentBaseline(noteAttachments);
        } catch (err) {
          console.error("Failed to load attachments:", err);
          // Non-critical, continue
        }
      } catch (err) {
        console.error("Failed to load note:", err);
        setError("Failed to load note. It may have been deleted.");
      } finally {
        setInitialLoading(false);
      }
    }

    loadNote();
  }, [id]);

  const handleAttachmentUploaded = (attachment: Attachment) => {
    setAttachments((prev) => [attachment, ...prev]);
    setAttachmentBaseline((prev) => [attachment, ...prev]);
  };

  const handleAttachmentDeleted = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    setAttachmentBaseline((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  const handleAttachmentVisibilityToggle = (attachmentId: string, isPublicValue: boolean) => {
    setAttachments((prev) =>
      prev.map((attachment) =>
        attachment.id === attachmentId ? { ...attachment, isPublic: isPublicValue } : attachment
      )
    );
  };


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !id) return;
    
    try {
      setLoading(true);
      await updateNote(id, { 
        title, 
        content, 
        isPublic, 
        tags,
        authors: authors || undefined,
        publicationYear: publicationYear || undefined,
      });

      const baselineMap = new Map(attachmentBaseline.map((attachment) => [attachment.id, attachment]));
      const attachmentsToUpdate = attachments.filter((attachment) => {
        const original = baselineMap.get(attachment.id);
        return original && original.isPublic !== attachment.isPublic;
      });

      if (attachmentsToUpdate.length > 0) {
        await Promise.all(
          attachmentsToUpdate.map((attachment) =>
            updateAttachment(attachment.id, { isPublic: attachment.isPublic })
          )
        );
      }

      setAttachmentBaseline(attachments);
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
      <div className="edit-note-page">
        <div className="edit-note-main">
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
            <MarkdownEditor
              ref={editorRef}
              value={content}
              onChange={setContent}
              excludeNoteId={id}
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

          {/* Academic Metadata Section */}
          <div className="form-group academic-metadata">
            <label className="form-label">📚 Citation Metadata (for references)</label>
            <div className="metadata-row">
              <div className="metadata-field">
                <label htmlFor="authors">Author(s)</label>
                <input
                  id="authors"
                  type="text"
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  placeholder="e.g., Smith, John or Smith, J. & Doe, J."
                  className="form-input"
                />
              </div>
              <div className="metadata-field year-field">
                <label htmlFor="publicationYear">Year</label>
                <input
                  id="publicationYear"
                  type="number"
                  value={publicationYear || ""}
                  onChange={(e) => setPublicationYear(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder={new Date().getFullYear().toString()}
                  className="form-input"
                  min="1900"
                  max="2100"
                />
              </div>
            </div>
            <div className="form-help">
              <span className="help-text">
                Used when this note is cited by other notes
              </span>
            </div>
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
                {isPublic ? "🌍 Public" : "🔒 Private"}
                <span className="visibility-description">
                  {isPublic
                    ? "Anyone can view this note"
                    : "Only you can view this note"}
                </span>
              </span>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">📎 Attachments</label>
            <AttachmentUploader
              noteId={id!}
              onUploaded={handleAttachmentUploaded}
              allowPublicToggle={isPublic}
              defaultPublic={false}
            />
            {attachments.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <AttachmentList
                  attachments={attachments}
                  onDelete={handleAttachmentDeleted}
                  onToggleVisibility={handleAttachmentVisibilityToggle}
                  canDelete={true}
                  isPublicContext={false}
                />
              </div>
            )}
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
        </div>

        {/* Citation Sidebar */}
        {id && (
          <CitationSidebar
            noteId={id}
            citationStyle={citationStyle}
            onInsertCitation={(marker) => {
              editorRef.current?.insertTextAtCursor(`${marker} `);
            }}
            onStyleChange={setCitationStyle}
          />
        )}

      </div>
  );
}
