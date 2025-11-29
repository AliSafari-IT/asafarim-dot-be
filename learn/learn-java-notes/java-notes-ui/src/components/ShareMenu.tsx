import { useState, useEffect } from "react";
import {
  getNoteVisibility,
  updateNoteVisibility,
  type NoteVisibility,
  type VisibilityResponse,
} from "../api/notesApi";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import "./ShareMenu.css";

interface ShareMenuProps {
  noteId: string;
  noteTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onVisibilityChange?: (visibility: NoteVisibility) => void;
}

const VISIBILITY_OPTIONS: { value: NoteVisibility; label: string; icon: string; description: string }[] = [
  {
    value: "PRIVATE",
    label: "Private",
    icon: "🔒",
    description: "Only you can access this note. It won't appear in feeds or search results.",
  },
  {
    value: "UNLISTED",
    label: "Unlisted",
    icon: "🔗",
    description: "Anyone with the link can view the note, but it won't appear in public feeds or search.",
  },
  {
    value: "PUBLIC",
    label: "Public",
    icon: "🌍",
    description: "The note can be found via public search and feeds. Use this for content you're confident sharing.",
  },
  {
    value: "FEATURED",
    label: "Featured",
    icon: "⭐",
    description: "Highlight this note in the public feed. Ideal for cornerstone content and reference material.",
  },
];

export default function ShareMenu({
  noteId,
  noteTitle,
  isOpen,
  onClose,
  onVisibilityChange,
}: ShareMenuProps) {
  const [visibilityData, setVisibilityData] = useState<VisibilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && noteId) {
      loadVisibility();
    }
  }, [isOpen, noteId]);

  const loadVisibility = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNoteVisibility(noteId);
      setVisibilityData(data);
    } catch (err) {
      console.error("Failed to load visibility:", err);
      setError("Failed to load sharing settings");
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityChange = async (newVisibility: NoteVisibility) => {
    if (!visibilityData || visibilityData.visibility === newVisibility) return;

    setSaving(true);
    setError(null);
    try {
      const data = await updateNoteVisibility(noteId, newVisibility);
      setVisibilityData(data);
      onVisibilityChange?.(newVisibility);
    } catch (err) {
      console.error("Failed to update visibility:", err);
      setError("Failed to update visibility");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async () => {
    if (!visibilityData?.publicUrl) return;

    try {
      await navigator.clipboard.writeText(visibilityData.publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareToSocial = (platform: "whatsapp" | "twitter" | "linkedin") => {
    if (!visibilityData?.publicUrl) return;

    const text = encodeURIComponent(`${noteTitle} – Java Notes`);
    const url = encodeURIComponent(visibilityData.publicUrl);

    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };

    window.open(urls[platform], "_blank", "noopener,noreferrer");
  };

  if (!isOpen) return null;

  return (
    <div className="share-menu-overlay" onClick={onClose}>
      <div className="share-menu" onClick={(e) => e.stopPropagation()}>
        <div className="share-menu-header">
          <h3>Share this note</h3>
          <button className="share-menu-close" onClick={onClose}>
            ×
          </button>
        </div>

        {loading ? (
          <div className="share-menu-loading">
            <div className="share-menu-spinner" />
            <span>Loading...</span>
          </div>
        ) : error ? (
          <div className="share-menu-error">
            <span>{error}</span>
            <Button variant="secondary" size="sm" onClick={loadVisibility}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Visibility Options */}
            <div className="share-menu-section">
              <h4>Visibility</h4>
              <div className="visibility-options">
                {VISIBILITY_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`visibility-option ${
                      visibilityData?.visibility === option.value ? "selected" : ""
                    } ${saving ? "disabled" : ""}`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={visibilityData?.visibility === option.value}
                      onChange={() => handleVisibilityChange(option.value)}
                      disabled={saving}
                    />
                    <span className="visibility-icon">{option.icon}</span>
                    <div className="visibility-content">
                      <span className="visibility-label">{option.label}</span>
                      <span className="visibility-description">{option.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Shareable Link */}
            {visibilityData?.visibility !== "PRIVATE" && (
              <div className="share-menu-section">
                <h4>Shareable link</h4>
                <p className="share-hint">
                  This link will open the public, read-only version of your note.
                </p>
                <div className="share-link-row">
                  <input
                    type="text"
                    className="share-link-input"
                    value={visibilityData?.publicUrl || ""}
                    readOnly
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={copyToClipboard}
                    className="copy-btn"
                  >
                    {copied ? "✓ Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            )}

            {/* Social Share Buttons */}
            {visibilityData?.visibility !== "PRIVATE" && (
              <div className="share-menu-section">
                <h4>Quick share</h4>
                <p className="share-hint">
                  These buttons open your social app with the link pre-filled.
                </p>
                <div className="social-buttons">
                  <button
                    className="social-btn whatsapp"
                    onClick={() => shareToSocial("whatsapp")}
                    title="Share to WhatsApp"
                  >
                    <span>📱</span> WhatsApp
                  </button>
                  <button
                    className="social-btn twitter"
                    onClick={() => shareToSocial("twitter")}
                    title="Share to X (Twitter)"
                  >
                    <span>𝕏</span> X / Twitter
                  </button>
                  <button
                    className="social-btn linkedin"
                    onClick={() => shareToSocial("linkedin")}
                    title="Share to LinkedIn"
                  >
                    <span>in</span> LinkedIn
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
