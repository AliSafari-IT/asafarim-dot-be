import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ButtonComponent as Button, useAuth, useNotifications } from "@asafarim/shared-ui-react";
import {
  fetchEducationById,
  createEducation,
  updateEducation,
  type CreateEducationRequest,
} from "../../../services/educationApi";
import { fetchResumeById } from "../../../services/resumeApi";
import "./resume-section-form.css";

const EducationForm = () => {
  const navigate = useNavigate();
  const { resumeId, id } = useParams<{ resumeId: string; id?: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState<boolean>(false);
  const [resumeTitle, setResumeTitle] = useState<string>("");
  const [formData, setFormData] = useState<CreateEducationRequest>({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: undefined,
    description: "",
  });

  const isEditMode = !!id;

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
    const loadEducation = async () => {
      if (!id || !resumeId || !isAuthenticated) return;

      try {
        setLoading(true);
        const education = await fetchEducationById(resumeId, id);
        setFormData({
          institution: education.institution,
          degree: education.degree,
          fieldOfStudy: education.fieldOfStudy,
          startDate: education.startDate.split("T")[0],
          endDate: education.endDate ? education.endDate.split("T")[0] : "",
          description: education.description || "",
        });
      } catch (err) {
        console.error("Error loading education:", err);
        addNotification("error", "Failed to load education");
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) {
      loadEducation();
    }
  }, [id, resumeId, isAuthenticated, isEditMode, addNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeId) return;

    try {
      setLoading(true);

      if (isEditMode && id) {
        await updateEducation(resumeId, id, formData);
        addNotification("success", "Education updated successfully!");
      } else {
        await createEducation(resumeId, formData);
        addNotification("success", "Education added successfully!");
      }

      navigate(`/admin/entities/resumes/${resumeId}/educations`);
    } catch (err) {
      console.error("Error saving education:", err);
      addNotification("error", `Failed to ${isEditMode ? "update" : "add"} education`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateEducationRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="resume-section-form-view">
      <div className="resume-section-form-container">
        <header className="resume-section-form-header">
          <div>
            <h1 className="resume-section-form-title">
              {isEditMode ? "Edit" : "Add"} Education
            </h1>
            <p className="resume-section-form-subtitle">Resume: {resumeTitle}</p>
          </div>
          <Button
            onClick={() => navigate(`/admin/entities/resumes/${resumeId}/educations`)}
            variant="secondary"
          >
            ← Back to Education
          </Button>
        </header>

        <form onSubmit={handleSubmit} className="resume-section-form">
          <div className="form-group">
            <label htmlFor="institution">
              School/Institution <span className="required">*</span>
            </label>
            <input
              id="institution"
              type="text"
              value={formData.institution}
              onChange={(e) => handleInputChange("institution", e.target.value)}
              placeholder="e.g., Harvard University"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="degree">
              Degree <span className="required">*</span>
            </label>
            <input
              id="degree"
              type="text"
              value={formData.degree}
              onChange={(e) => handleInputChange("degree", e.target.value)}
              placeholder="e.g., Bachelor of Science, Master of Arts"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fieldOfStudy">
              Field of Study <span className="required">*</span>
            </label>
            <input
              id="fieldOfStudy"
              type="text"
              value={formData.fieldOfStudy}
              onChange={(e) => handleInputChange("fieldOfStudy", e.target.value)}
              placeholder="e.g., Computer Science, Business Administration"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startDate">
              Start Date <span className="required">*</span>
            </label>
            <input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Relevant coursework, achievements, honors..."
              rows={4}
            />
          </div>

          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : isEditMode ? "Update Education" : "Add Education"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/admin/entities/resumes/${resumeId}/educations`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EducationForm;
