import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, useAuth, useNotifications } from "@asafarim/shared-ui-react";
import {
  fetchCertificateById,
  createCertificate,
  updateCertificate,
  type CreateCertificateRequest,
} from "../../../services/certificateApi";
import { fetchResumeById } from "../../../services/resumeApi";
import "./resume-section-form.css";

const CertificateForm: React.FC = () => {
  const navigate = useNavigate();
  const { resumeId, id } = useParams<{ resumeId: string; id?: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState<boolean>(false);
  const [resumeTitle, setResumeTitle] = useState<string>("");
  const [formData, setFormData] = useState<CreateCertificateRequest>({
    name: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    credentialUrl: "",
  });

  // Check if we are in edit mode by checking the URL path
  const isEditMode = window.location.pathname.endsWith("/edit");
  const isViewMode = !!id && !isEditMode;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(
        window.location.href
      )}`;
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    const loadResume = async () => {
      if (!resumeId || !isAuthenticated) return;
      try {
        const resume = await fetchResumeById(resumeId);
        if (resume) {
          setResumeTitle(resume.title || "Untitled Resume");
        }
      } catch (err) {
        console.error("Failed to load resume:", err);
      }
    };
    loadResume();
  }, [resumeId, isAuthenticated]);

  useEffect(() => {
    const loadCertificate = async () => {
      if (!id || !resumeId || !isAuthenticated) return;

      try {
        setLoading(true);
        const certificate = await fetchCertificateById(resumeId, id);
        setFormData({
          name: certificate.name,
          issuer: certificate.issuer,
          issueDate: certificate.issueDate.split("T")[0],
          expiryDate: certificate.expiryDate
            ? certificate.expiryDate.split("T")[0]
            : "",
          credentialId: certificate.credentialId || "",
          credentialUrl: certificate.credentialUrl || "",
        });
      } catch (err) {
        console.error("Error loading certificate:", err);
        addNotification("error", "Failed to load certificate");
      } finally {
        setLoading(false);
      }
    };

    // Load data for both view and edit modes
    if (isEditMode || isViewMode) {
      loadCertificate();
    }
  }, [id, resumeId, isAuthenticated, isEditMode, isViewMode, addNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeId) return;

    try {
      setLoading(true);

      if (isEditMode && id) {
        await updateCertificate(resumeId, id, formData);
        addNotification("success", "Certificate updated successfully!");
      } else {
        await createCertificate(resumeId, formData);
        addNotification("success", "Certificate added successfully!");
      }

      navigate(`/admin/resumes/${resumeId}/certificates`);
    } catch (err) {
      console.error("Error saving certificate:", err);
      addNotification(
        "error",
        `Failed to ${isEditMode ? "update" : "add"} certificate`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateCertificateRequest,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="resume-section-form-view"
      data-mode={isViewMode ? "view" : isEditMode ? "edit" : "add"}
    >
      <div className="resume-section-form-container">
        <header className="resume-section-form-header">
          <div>
            <h1 className="resume-section-form-title">
              {isViewMode ? "👁️ View" : isEditMode ? "✏️ Edit" : "➕ Add"}{" "}
              Certificate
            </h1>
            <p className="resume-section-form-subtitle">
              Resume: {resumeTitle}
            </p>
          </div>
          <div className="header-actions">
            {isViewMode && (
              <Button
                onClick={() =>
                  navigate(`/admin/resumes/${resumeId}/certificates/${id}/edit`)
                }
                variant="primary"
                size="sm"
              >
                ✏️ Edit
              </Button>
            )}
            <Button
              onClick={() =>
                navigate(`/admin/resumes/${resumeId}/certificates`)
              }
              variant="secondary"
              size="sm"
            >
              ← Back
            </Button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="resume-section-form">
          <div className="form-group">
            <label htmlFor="name">
              Certificate Name <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., AWS Certified Solutions Architect"
              required={!isViewMode}
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="issuer">
              Issuer <span className="required">*</span>
            </label>
            <input
              id="issuer"
              type="text"
              value={formData.issuer}
              onChange={(e) => handleInputChange("issuer", e.target.value)}
              placeholder="e.g., Amazon Web Services"
              required={!isViewMode}
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="issueDate">
              Issue Date <span className="required">*</span>
            </label>
            <input
              id="issueDate"
              type="date"
              value={formData.issueDate}
              onChange={(e) => handleInputChange("issueDate", e.target.value)}
              required={!isViewMode}
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="expiryDate">Expiration Date</label>
            <input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange("expiryDate", e.target.value)}
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="credentialId">Credential ID</label>
            <input
              id="credentialId"
              type="text"
              value={formData.credentialId}
              onChange={(e) =>
                handleInputChange("credentialId", e.target.value)
              }
              placeholder="e.g., ABC123XYZ"
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="credentialUrl">Credential URL</label>
            {isViewMode ? (
              <a
                className="project-credential-url-field"
                href={formData.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {formData.credentialUrl}
              </a>
            ) : (
              <input
                id="credentialUrl"
                type="url"
                value={formData.credentialUrl}
                onChange={(e) =>
                  handleInputChange("credentialUrl", e.target.value)
                }
                placeholder="https://..."
              />
            )}
          </div>

          {!isViewMode && (
            <div className="form-actions">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Update Certificate"
                  : "Add Certificate"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  navigate(`/admin/resumes/${resumeId}/certificates`)
                }
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CertificateForm;
