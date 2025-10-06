import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, useAuth, useNotifications } from "@asafarim/shared-ui-react";
import {
  fetchLanguageById,
  createLanguage,
  updateLanguage,
  type CreateLanguageRequest,
} from "../../../services/languageApi";
import { fetchResumeById } from "../../../services/resumeApi";
import "./resume-section-form.css";

const PROFICIENCY_LEVELS = ["Basic", "Intermediate", "Fluent", "Native"];

const LanguageForm: React.FC = () => {
  const navigate = useNavigate();
  const { resumeId, id } = useParams<{ resumeId: string; id?: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState<boolean>(false);
  const [resumeTitle, setResumeTitle] = useState<string>("");
  const [formData, setFormData] = useState<CreateLanguageRequest>({
    name: "",
    level: "Intermediate",
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
    const loadLanguage = async () => {
      // Don't try to load if id is "new" or missing
      if (!id || id === "new" || !resumeId || !isAuthenticated) return;

      try {
        setLoading(true);
        const language = await fetchLanguageById(resumeId, id);
        setFormData({
          name: language.name,
          level: language.level,
        });
      } catch (err) {
        console.error("Error loading language:", err);
        addNotification("error", "Failed to load language");
      } finally {
        setLoading(false);
      }
    };

    // Load data for both view and edit modes (but not for "new")
    if ((isEditMode || isViewMode) && id !== "new") {
      loadLanguage();
    }
  }, [id, resumeId, isAuthenticated, isEditMode, isViewMode, addNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeId) return;

    try {
      setLoading(true);

      if (isEditMode && id) {
        await updateLanguage(resumeId, id, formData);
        addNotification("success", "Language updated successfully!");
      } else {
        await createLanguage(resumeId, formData);
        addNotification("success", "Language added successfully!");
      }

      navigate(`/admin/entities/resumes/${resumeId}/languages`);
    } catch (err) {
      console.error("Error saving language:", err);
      addNotification("error", `Failed to ${isEditMode ? "update" : "add"} language`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateLanguageRequest, value: string) => {
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
              {isViewMode ? "👁️ View" : isEditMode ? "✏️ Edit" : "➕ Add"} Language
            </h1>
            <p className="resume-section-form-subtitle">Resume: {resumeTitle}</p>
          </div>
          <div className="header-actions">
            {isViewMode && (
              <Button
                onClick={() => navigate(`/admin/entities/resumes/${resumeId}/languages/${id}/edit`)}
                variant="primary"
                size="sm"
              >
                ✏️ Edit
              </Button>
            )}
            <Button
              onClick={() => navigate(`/admin/entities/resumes/${resumeId}/languages`)}
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
              Language <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., English, Spanish, French"
              required={!isViewMode}
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="level">
              Proficiency Level <span className="required">*</span>
            </label>
            <select
              id="level"
              value={formData.level}
              onChange={(e) => handleInputChange("level", e.target.value)}
              required={!isViewMode}
              disabled={isViewMode}
            >
              {PROFICIENCY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {!isViewMode && (
            <div className="form-actions">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Saving..." : isEditMode ? "Update Language" : "Add Language"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/admin/entities/resumes/${resumeId}/languages`)}
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

export default LanguageForm;
