import { useState } from "react";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import "./PublishResumeModal.css";

interface PublishResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customSlug?: string) => Promise<void>;
  resumeTitle: string;
}

const PublishResumeModal = ({
  isOpen,
  onClose,
  onConfirm,
  resumeTitle,
}: PublishResumeModalProps) => {
  const [consentGiven, setConsentGiven] = useState(false);
  const [useCustomSlug, setUseCustomSlug] = useState(false);
  const [customSlug, setCustomSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!consentGiven) {
      setError("You must provide consent to publish your resume.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirm(useCustomSlug ? customSlug : undefined);
      // Reset state on success
      setConsentGiven(false);
      setUseCustomSlug(false);
      setCustomSlug("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish resume");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setConsentGiven(false);
      setUseCustomSlug(false);
      setCustomSlug("");
      setError(null);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="24"
              height="24"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            GDPR Consent Required
          </h2>
          <button
            className="modal-close"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="consent-notice">
            <h3>Publishing: {resumeTitle}</h3>
            <p className="notice-text">
              By publishing this resume publicly, you confirm that you accept
              the following:
            </p>

            <div className="consent-details">
              <h4>What will be public:</h4>
              <ul className="consent-list included">
                <li>✓ Resume title and professional summary</li>
                <li>✓ Work experience, skills, and education</li>
                <li>✓ Projects, certificates, and awards</li>
                <li>✓ Languages and professional social links</li>
              </ul>

              <h4>What will NOT be public:</h4>
              <ul className="consent-list excluded">
                <li>✗ Your email address and phone number</li>
                <li>✗ Personal contact information</li>
                <li>✗ Internal system identifiers</li>
                <li>✗ Private references contact details</li>
              </ul>
            </div>

            <div className="gdpr-info">
              <h4>Your GDPR Rights:</h4>
              <ul className="gdpr-list">
                <li>
                  <strong>Right to Revoke:</strong> You can unpublish your
                  resume at any time.
                </li>
                <li>
                  <strong>Data Minimization:</strong> Only necessary information
                  is shared publicly.
                </li>
                <li>
                  <strong>Consent Logging:</strong> Your consent timestamp and
                  IP address will be recorded for compliance.
                </li>
                <li>
                  <strong>Privacy Policy:</strong> Review our{" "}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>{" "}
                  for details.
                </li>
              </ul>
            </div>

            <div className="slug-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={useCustomSlug}
                  onChange={(e) => setUseCustomSlug(e.target.checked)}
                  disabled={loading}
                />
                <span>Use custom URL slug (optional)</span>
              </label>

              {useCustomSlug && (
                <div className="custom-slug-input">
                  <label htmlFor="customSlug">Custom Slug:</label>
                  <input
                    id="customSlug"
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder="my-resume"
                    disabled={loading}
                    pattern="[a-z0-9\-]+"
                  />
                  <small className="input-hint">
                    Only lowercase letters, numbers, and hyphens (4-100
                    characters)
                  </small>
                </div>
              )}
            </div>

            <div className="consent-checkbox">
              <label className="checkbox-label primary">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  disabled={loading}
                  required
                />
                <span>
                  <strong>
                    I understand and consent to publish this resume publicly in
                    accordance with GDPR regulations.
                  </strong>{" "}
                  I confirm that I do not include personal data I do not wish to
                  share publicly.
                </span>
              </label>
            </div>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <Button
            onClick={handleClose}
            variant="secondary"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="primary"
            disabled={!consentGiven || loading}
          >
            {loading ? "Publishing..." : "Confirm & Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PublishResumeModal;
