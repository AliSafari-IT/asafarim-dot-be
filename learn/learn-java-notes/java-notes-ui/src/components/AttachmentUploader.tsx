import { useState, useRef, type DragEvent } from "react";
import { uploadAttachment, type Attachment } from "../api/notesApi";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import "./AttachmentUploader.css";

interface AttachmentUploaderProps {
  noteId: string;
  onUploaded?: (attachment: Attachment) => void;
  maxSizeMb?: number;
  allowPublicToggle: boolean;
  defaultPublic?: boolean;
}

const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "txt",
  "md",
  "zip",
  "docx",
  "xlsx",
  "pptx",
]);

export default function AttachmentUploader({
  noteId,
  onUploaded,
  maxSizeMb = 10,
  allowPublicToggle,
  defaultPublic = false,
}: AttachmentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(defaultPublic);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check size
    const maxSizeBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMb}MB limit`;
    }

    // Check extension
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
      return `File type not allowed. Allowed: ${Array.from(ALLOWED_EXTENSIONS).join(", ")}`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress (real progress would need axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const attachment = await uploadAttachment(noteId, selectedFile, isPublic);

      clearInterval(progressInterval);
      setProgress(100);

      // Reset form
      setSelectedFile(null);
      setIsPublic(defaultPublic);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Notify parent
      if (onUploaded) {
        onUploaded(attachment);
      }

      setTimeout(() => {
        setProgress(0);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="attachment-uploader">
      <div
        className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="dropzone-icon">📎</div>
        <p className="dropzone-text">
          Drag & drop a file here, or click to select
        </p>
        <p className="dropzone-hint">
          Max {maxSizeMb}MB • Allowed: PDF, images, documents, code files
        </p>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          style={{ display: "none" }}
          accept=".pdf,.png,.jpg,.jpeg,.gif,.txt,.md,.zip,.docx,.xlsx,.pptx"
        />
      </div>

      {selectedFile && (
        <div className="selected-file">
          <div className="file-info">
            <span className="file-icon">📄</span>
            <div className="file-details">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">
                {formatFileSize(selectedFile.size)}
              </span>
            </div>
          </div>

          {allowPublicToggle && (
            <div className="visibility-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  disabled={uploading}
                />
                <span>Make public</span>
              </label>
            </div>
          )}

          <div className="upload-actions">
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedFile(null);
                setError(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {uploading && progress > 0 && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      )}

      {error && <div className="upload-error">❌ {error}</div>}
    </div>
  );
}
