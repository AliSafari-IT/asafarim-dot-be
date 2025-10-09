import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ButtonComponent as Button, useAuth, useNotifications } from "@asafarim/shared-ui-react";
import {
  fetchSocialLinkById,
  createSocialLink,
  updateSocialLink,
  type CreateSocialLinkRequest,
} from "../../../services/socialLinkApi";
import { fetchResumeById } from "../../../services/resumeApi";
import "./resume-section-form.css";

const SocialLinkForm = () => {
  const navigate = useNavigate();
  const { resumeId, id } = useParams<{ resumeId: string; id?: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState<boolean>(false);
  const [resumeTitle, setResumeTitle] = useState<string>("");
  const [formData, setFormData] = useState<CreateSocialLinkRequest>({
    platform: "",
    url: "",
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
    const loadSocialLink = async () => {
      if (!id || !resumeId || !isAuthenticated) return;

      try {
        setLoading(true);
        const socialLink = await fetchSocialLinkById(resumeId, id);
        setFormData({
          platform: socialLink.platform,
          url: socialLink.url,
        });
      } catch (err) {
        console.error("Error loading social link:", err);
        addNotification("error", "Failed to load social link");
      } finally {
        setLoading(false);
      }
    };

    // Load data for both view and edit modes
    if (isEditMode || isViewMode) {
      loadSocialLink();
    }
  }, [id, resumeId, isAuthenticated, isEditMode, isViewMode, addNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeId) return;

    try {
      setLoading(true);

      if (isEditMode && id) {
        await updateSocialLink(resumeId, id, formData);
        addNotification("success", "Social link updated successfully!");
      } else {
        await createSocialLink(resumeId, formData);
        addNotification("success", "Social link added successfully!");
      }

      navigate(`/admin/entities/resumes/${resumeId}/social-links`);
    } catch (err) {
      console.error("Error saving social link:", err);
      addNotification(
        "error",
        `Failed to ${isEditMode ? "update" : "add"} social link`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateSocialLinkRequest,
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
          <div className="resume-section-form-title">
            <h1>
              {isViewMode ? "View" : isEditMode ? "Edit" : "Add"} Social Link
            </h1>
            <p className="resume-title">for {resumeTitle}</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="resume-section-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="platform">Platform *</label>
              <input
                type="text"
                id="platform"
                value={formData.platform}
                onChange={(e) => handleInputChange("platform", e.target.value)}
                placeholder="e.g., GitHub, LinkedIn, Twitter"
                required
                readOnly={isViewMode}
                className={isViewMode ? "readonly" : ""}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="url">URL *</label>
              <input
                type="url"
                id="url"
                value={formData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                placeholder="https://example.com/profile"
                required
                readOnly={isViewMode}
                className={isViewMode ? "readonly" : ""}
              />
            </div>
          </div>

          {!isViewMode && (
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/admin/entities/resumes/${resumeId}/social-links`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isEditMode ? "Update" : "Add"} Social Link
              </Button>
            </div>
          )}

          {isViewMode && (
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/admin/entities/resumes/${resumeId}/social-links`)}
              >
                Back to Social Links
              </Button>
              <Button
                type="button"
                onClick={() => navigate(`/admin/entities/resumes/${resumeId}/social-links/${id}/edit`)}
              >
                Edit Social Link
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SocialLinkForm;
