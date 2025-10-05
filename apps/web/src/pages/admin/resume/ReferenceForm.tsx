import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, useAuth, useNotifications } from "@asafarim/shared-ui-react";
import {
  fetchReferenceById,
  createReference,
  updateReference,
  type CreateReferenceRequest,
} from "../../../services/referenceApi";
import { fetchResumeById } from "../../../services/resumeApi";
import "./resume-section-form.css";

const ReferenceForm: React.FC = () => {
  const navigate = useNavigate();
  const { resumeId, id } = useParams<{ resumeId: string; id?: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState<boolean>(false);
  const [resumeTitle, setResumeTitle] = useState<string>("");
  const [formData, setFormData] = useState<CreateReferenceRequest>({
    name: "",
    position: "",
    company: "",
    email: "",
    phone: "",
    relationship: "",
  });

  // Check if we are in edit mode by checking the URL path
  const isEditMode = window.location.pathname.endsWith('/edit');
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
    const loadReference = async () => {
      if (!id || !resumeId || !isAuthenticated) return;

      try {
        setLoading(true);
        const reference = await fetchReferenceById(resumeId, id);
        setFormData({
          name: reference.name,
          position: reference.position,
          company: reference.company,
          email: reference.email,
          phone: reference.phone || "",
          relationship: reference.relationship || "",
        });
      } catch (err) {
        console.error("Error loading reference:", err);
        addNotification("error", "Failed to load reference");
      } finally {
        setLoading(false);
      }
    };

    // Load data for both view and edit modes
    if (isEditMode || isViewMode) {
      loadReference();
    }
  }, [id, resumeId, isAuthenticated, isEditMode, isViewMode, addNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeId) return;

    try {
      setLoading(true);

      if (isEditMode && id) {
        await updateReference(resumeId, id, formData);
        addNotification("success", "Reference updated successfully!");
      } else {
        await createReference(resumeId, formData);
        addNotification("success", "Reference added successfully!");
      }

      navigate(`/admin/entities/resumes/${resumeId}/references`);
    } catch (err) {
      console.error("Error saving reference:", err);
      addNotification("error", `Failed to ${isEditMode ? "update" : "add"} reference`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateReferenceRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="resume-section-form-view" data-mode={isViewMode ? "view" : isEditMode ? "edit" : "add"}>
      <div className="resume-section-form-container">
        <header className="resume-section-form-header">
          <div>
            <h1 className="resume-section-form-title">
              {isViewMode ? "👁️ View" : isEditMode ? "✏️ Edit" : "➕ Add"} Reference
            </h1>
            <p className="resume-section-form-subtitle">Resume: {resumeTitle}</p>
          </div>
          <div className="header-actions">
            {isViewMode && (
              <Button
                onClick={() => navigate(`/admin/entities/resumes/${resumeId}/references/${id}/edit`)}
                variant="primary"
                size="sm"
              >
                ✏️ Edit
              </Button>
            )}
            <Button
              onClick={() => navigate(`/admin/entities/resumes/${resumeId}/references`)}
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
              Full Name <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., John Doe"
              required={!isViewMode}
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="position">
              Position <span className="required">*</span>
            </label>
            <input
              id="position"
              type="text"
              value={formData.position}
              onChange={(e) => handleInputChange("position", e.target.value)}
              placeholder="e.g., Senior Developer"
              required={!isViewMode}
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="company">
              Company <span className="required">*</span>
            </label>
            <input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              placeholder="e.g., Tech Corp"
              required={!isViewMode}
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="john.doe@example.com"
              required={!isViewMode}
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+1 234 567 8900"
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="relationship">Relationship</label>
            <input
              id="relationship"
              type="text"
              value={formData.relationship}
              onChange={(e) => handleInputChange("relationship", e.target.value)}
              placeholder="e.g., Former Manager, Colleague"
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          {!isViewMode && (
            <div className="form-actions">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Saving..." : isEditMode ? "Update Reference" : "Add Reference"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/admin/entities/resumes/${resumeId}/references`)}
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

export default ReferenceForm;
