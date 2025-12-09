import { useState, useEffect } from "react";
import "../styles/components/email-preview-modal.css";
import { ButtonComponent } from "@asafarim/shared-ui-react";

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (subject: string, body: string) => Promise<void>;
  defaultSubject: string;
  defaultBody: string;
  recipientEmail: string;
  documentType: "Invoice" | "Proposal";
  documentNumber: string;
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  onSend,
  defaultSubject,
  defaultBody,
  recipientEmail,
  documentType,
  documentNumber,
}: EmailPreviewModalProps) {
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [sending, setSending] = useState(false);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !sending) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, sending, onClose]);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setSubject(defaultSubject);
      setBody(defaultBody);
    }
  }, [isOpen, defaultSubject, defaultBody]);

  if (!isOpen) return null;

  const handleSend = async () => {
    try {
      setSending(true);
      await onSend(subject, body);
      onClose();
    } catch (error) {
      console.error("Failed to send email:", error);
    } finally {
      setSending(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="email-modal-backdrop" onClick={handleBackdropClick}>
      <div className="email-modal">
        <div className="email-modal-header">
          <h2>Preview & Send {documentType}</h2>
          <button
            className="email-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="email-modal-body">
          <div className="email-field">
            <label htmlFor="recipient">To:</label>
            <input
              id="recipient"
              type="email"
              value={recipientEmail}
              disabled
              className="email-input-disabled"
            />
          </div>

          <div className="email-field">
            <label htmlFor="subject">Subject:</label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="email-input"
              placeholder="Email subject"
            />
          </div>

          <div className="email-field">
            <label htmlFor="body">Message:</label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="email-textarea"
              rows={12}
              placeholder="Email body"
            />
          </div>

          <div className="email-info">
            <p className="email-info-text">
              📎 {documentType} {documentNumber} will be attached as PDF
            </p>
          </div>
        </div>

        <div className="email-modal-footer">
          <ButtonComponent
            variant="secondary"
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </ButtonComponent>
          <ButtonComponent
            variant="brand"
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim()}
          >
            {sending ? "Sending..." : `Send ${documentType}`}
          </ButtonComponent>
        </div>
      </div>
    </div>
  );
}
