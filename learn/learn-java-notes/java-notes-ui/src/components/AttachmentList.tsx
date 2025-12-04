import { useState } from "react";
import {
  downloadAttachment,
  downloadPublicAttachment,
  deleteAttachment,
  type Attachment,
} from "../api/notesApi";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import "./AttachmentList.css";

interface AttachmentListProps {
  attachments: Attachment[];
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
  onToggleVisibility?: (id: string, isPublic: boolean) => void;
  canDelete: boolean;
  isPublicContext: boolean;
}

export default function AttachmentList({
  attachments,
  onDelete,
  onRefresh,
  onToggleVisibility,
  canDelete,
  isPublicContext,
}: AttachmentListProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const getFileIcon = (contentType: string, filename: string): string => {
    if (contentType.startsWith("image/")) return "🖼️";
    if (contentType === "application/pdf") return "📕";
    if (contentType.includes("text/")) return "📄";
    if (contentType.includes("word") || filename.endsWith(".docx")) return "📘";
    if (contentType.includes("sheet") || filename.endsWith(".xlsx"))
      return "📊";
    if (contentType.includes("presentation") || filename.endsWith(".pptx"))
      return "📽️";
    if (contentType.includes("zip") || filename.endsWith(".zip")) return "🗜️";
    return "📎";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePublicToggle = (id: string, isPublic: boolean) => {
    if (onToggleVisibility) {
      onToggleVisibility(id, isPublic);
      return;
    }

    console.warn("onToggleVisibility handler missing for AttachmentList");
  };

  const handleDownload = async (attachment: Attachment) => {
    setDownloading(attachment.id);
    try {
      const blob = isPublicContext
        ? await downloadPublicAttachment(attachment.id)
        : await downloadAttachment(attachment.id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download attachment");
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this attachment?")) {
      return;
    }

    setDeleting(id);
    try {
      await deleteAttachment(id);
      if (onDelete) {
        onDelete(id);
      }
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete attachment");
    } finally {
      setDeleting(null);
    }
  };

  const isImage = (contentType: string): boolean => {
    return contentType.startsWith("image/");
  };

  const isPublicAttachment = (isPublic: boolean | string): boolean => {
    console.log("isPublic value:", isPublic, "type:", typeof isPublic);
    if (typeof isPublic === "string") {
      return isPublic.toLowerCase() === "true";
    }
    return isPublic === true;
  };

  if (attachments.length === 0) {
    return (
      <div className="attachment-list-empty">
        <div className="empty-icon">📎</div>
        <p>No attachments yet</p>
      </div>
    );
  }

  return (
    <div className="attachment-list">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="attachment-item">
          <div className="attachment-icon">
            {getFileIcon(attachment.contentType, attachment.filename)}
          </div>

          <div className="attachment-info">
            <div className="attachment-header">
              <span className="attachment-filename">{attachment.filename}</span>
              <span className="attachment-visibility">
                {isPublicAttachment(attachment.isPublic) ? "🌍" : "🔒"}
              </span>
            </div>
            <div className="attachment-meta">
              <span className="attachment-size">
                {formatFileSize(attachment.size)}
              </span>
              <span className="attachment-date">
                {formatDate(attachment.uploadedAt)}
              </span>
            </div>
          </div>

          <div className="attachment-actions">
            {canDelete && (
              <input
                type="checkbox"
                checked={Boolean(attachment.isPublic)}
                onChange={(e) =>
                  handlePublicToggle(attachment.id, e.target.checked)
                }
                title={
                  isPublicAttachment(attachment.isPublic)
                    ? "Public attachment"
                    : "Private attachment"
                }
              />
            )}
            <Button
              variant="primary"
              onClick={() => handleDownload(attachment)}
              disabled={downloading === attachment.id}
              size="sm"
            >
              {downloading === attachment.id ? "⏳" : "⬇️"} Download
            </Button>
            {canDelete && (
              <Button
                variant="secondary"
                onClick={() => handleDelete(attachment.id)}
                disabled={deleting === attachment.id}
                size="sm"
              >
                {deleting === attachment.id ? "⏳" : "🗑️"} Delete
              </Button>
            )}
          </div>

          {isImage(attachment.contentType) && (
            <div className="attachment-preview-hint">
              Click download to view image
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
