import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, useAuth, useNotifications } from "@asafarim/shared-ui-react";
import {
  fetchAwardById,
  createAward,
  updateAward,
  type CreateAwardRequest,
} from "../../../services/awardApi";
import { fetchResumeById } from "../../../services/resumeApi";
import "./resume-section-form.css";

const AwardForm: React.FC = () => {
  const navigate = useNavigate();
  const { resumeId, id } = useParams<{ resumeId: string; id?: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState<boolean>(false);
  const [resumeTitle, setResumeTitle] = useState<string>("");
  const [formData, setFormData] = useState<CreateAwardRequest>({
    title: "",
    issuer: "",
    date: "",
    description: "",
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
    const loadAward = async () => {
      if (!id || !resumeId || !isAuthenticated) return;

      try {
        setLoading(true);
        const award = await fetchAwardById(resumeId, id);
        setFormData({
          title: award.title,
          issuer: award.issuer,
          date: award.date.split("T")[0],
          description: award.description || "",
        });
      } catch (err) {
        console.error("Error loading award:", err);
        addNotification("error", "Failed to load award");
      } finally {
        setLoading(false);
      }
    };

    // Load data for both view and edit modes
    if (isEditMode || isViewMode) {
      loadAward();
    }
  }, [id, resumeId, isAuthenticated, isEditMode, isViewMode, addNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeId) return;

    try {
      setLoading(true);

      if (isEditMode && id) {
        await updateAward(resumeId, id, formData);
        addNotification("success", "Award updated successfully!");
      } else {
        await createAward(resumeId, formData);
        addNotification("success", "Award added successfully!");
      }

      navigate(`/admin/entities/resumes/${resumeId}/awards`);
    } catch (err) {
      console.error("Error saving award:", err);
      addNotification("error", `Failed to ${isEditMode ? "update" : "add"} award`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateAwardRequest, value: string) => {
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
              {isViewMode ? "👁️ View" : isEditMode ? "✏️ Edit" : "➕ Add"} Award
            </h1>
            <p className="resume-section-form-subtitle">Resume: {resumeTitle}</p>
          </div>
          <div className="header-actions">
            {isViewMode && (
              <Button
                onClick={() => navigate(`/admin/entities/resumes/${resumeId}/awards/${id}/edit`)}
                variant="primary"
                size="sm"
              >
                ✏️ Edit
              </Button>
            )}
            <Button
              onClick={() => navigate(`/admin/entities/resumes/${resumeId}/awards`)}
              variant="secondary"
              size="sm"
            >
              ← Back
            </Button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="resume-section-form">
          <div className="form-group">
            <label htmlFor="title">
              Award Title <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Best Employee of the Year"
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
              placeholder="e.g., Company Name"
              required={!isViewMode}
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">
              Date <span className="required">*</span>
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              required={!isViewMode}
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Additional details about the award..."
              rows={4}
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          {!isViewMode && (
            <div className="form-actions">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Saving..." : isEditMode ? "Update Award" : "Add Award"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/admin/entities/resumes/${resumeId}/awards`)}
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
export default AwardForm;
