import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ButtonComponent, useAuth, useNotifications } from "@asafarim/shared-ui-react";
import {
  fetchExperienceById,
  createExperience,
  updateExperience,
  type CreateExperienceRequest,
} from "../../../services/experienceApi";
import { fetchResumeById } from "../../../services/resumeApi";
import "./resume-section-form.css";
import { getReturnUrl } from "./utils";

const ExperienceForm = () => {
  const navigate = useNavigate();
  const { resumeId, id, mode } = useParams<{ resumeId: string; id?: string; mode?: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState<boolean>(false);
  const [resumeTitle, setResumeTitle] = useState<string>("");
  const [formData, setFormData] = useState<CreateExperienceRequest>({
    companyName: "",
    jobTitle: "",
    location: "",
    startDate: "",
    isCurrent: false,
    endDate: "",
    description: "",
    technologies: [{ name: "", category: "" }],
    achievements: [{ text: "" }],
    sortOrder: 0,
    highlighted: false,
    isPublished: true,
  });


  // Check if we are in edit mode or in add/view mode
  const isEditMode = mode === "edit";
  const isViewMode = !!id && !isEditMode;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getReturnUrl(window.location.href);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    const loadResume = async () => {
      if (!resumeId || !isAuthenticated) return;
      try {
        const resume = await fetchResumeById(resumeId);
        if (resume) setResumeTitle(resume.title || "Untitled Resume");
      } catch (err) {
        console.error("Failed to load resume:", err);
      }
    };
    loadResume();
  }, [resumeId, isAuthenticated]);

  useEffect(() => {
    const loadExperience = async () => {
      if (!id || !resumeId || !isAuthenticated) return;
      try {
        setLoading(true);
        const experience = await fetchExperienceById(resumeId, id);
        setFormData({
          companyName: experience.companyName,
          jobTitle: experience.jobTitle,
          location: experience.location || "",
          startDate: experience.startDate.substring(0, 10),
          endDate: experience.endDate ? experience.endDate.substring(0, 10) : "",
          isCurrent: experience.isCurrent,
          description: experience.description || "",
          achievements: experience?.achievements?.map(a => ({ text: a.text })) || [],
          technologies: experience?.technologies?.map(t => ({ name: t.name, category: t.category || "" })) || [],
          sortOrder: 0,
          highlighted: false,
          isPublished: true,
        });
      } catch (err) {
        console.error("Error loading experience:", err);
        addNotification("error", "Failed to load experience");
      } finally {
        setLoading(false);
      }
    };
    // Load data for both view and edit modes
    if (isEditMode || isViewMode) loadExperience();
  }, [id, resumeId, isAuthenticated, isEditMode, isViewMode, addNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeId) return;

    // Validate form before submission
    if (!validateForm()) {
      addNotification("error", "Please fix the validation errors before submitting");
      return;
    }

    try {
      setLoading(true);
      if (isEditMode && id) {
        await updateExperience(resumeId, id, formData);
        addNotification("success", "Experience updated successfully!");
      } else {
        await createExperience(resumeId, formData);
        addNotification("success", "Experience added successfully!");
      }
      navigate(`/admin/entities/resumes/${resumeId}/work-experiences`);
    } catch (err) {
      console.error("Error saving experience:", err);
      addNotification("error", `Failed to ${isEditMode ? "update" : "add"} experience`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateExperienceRequest, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAchievementChange = (index: number, value: string) => {
    const updatedAchievements = [...(formData.achievements || [])];
    updatedAchievements[index] = { text: value };
    
    setFormData(prev => ({
      ...prev,
      achievements: updatedAchievements
    }));
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate technology fields
    if (formData.technologies) {
      formData.technologies.forEach((tech, index) => {
        if (tech.name.length > 50) {
          newErrors[`technology_${index}_name`] = `Technology name must be 50 characters or less (current: ${tech.name.length})`;
        }
        if (tech.category && tech.category.length > 50) {
          newErrors[`technology_${index}_category`] = `Category must be 50 characters or less (current: ${tech.category.length})`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTechnologyChange = (index: number, field: 'name' | 'category', value: string) => {
    // Truncate value if it exceeds 50 characters
    const truncatedValue = value.length > 50 ? value.substring(0, 50) : value;

    const updatedTechnologies = [...(formData.technologies || [])];
    updatedTechnologies[index] = { ...updatedTechnologies[index], [field]: truncatedValue };

    setFormData(prev => ({
      ...prev,
      technologies: updatedTechnologies
    }));

    // Clear error for this field if it was previously set
    if (errors[`technology_${index}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`technology_${index}_${field}`];
        return newErrors;
      });
    }
  };
  
  const addTechnology = () => {
    setFormData(prev => ({
      ...prev,
      technologies: [...(prev.technologies || []), { name: "", category: "" }]
    }));
  };
  
  const removeTechnology = (index: number) => {
    const updatedTechnologies = [...(formData.technologies || [])];
    updatedTechnologies.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      technologies: updatedTechnologies
    }));
  };
  
  const addAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...(prev.achievements || []), { text: "" }]
    }));
  };

  const removeAchievement = (index: number) => {
    const updatedAchievements = [...(formData.achievements || [])];
    updatedAchievements.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      achievements: updatedAchievements
    }));
  };

  if (!isAuthenticated) return <div>Loading...</div>;

  const getModeTitle = () => {
    if (isViewMode) return "View Work Experience";
    if (isEditMode) return "Edit Work Experience";
    return "Add Work Experience";
  };

  const getModeIcon = () => {
    if (isViewMode) return "👁️";
    if (isEditMode) return "✏️";
    return "➕";
  };

  return (
    <div className="resume-section-form-view" data-mode={isViewMode ? "view" : isEditMode ? "edit" : "add"}>
      <div className="resume-section-form-container">
        <header className="resume-section-form-header">
          <div className="header-title-group">
            <div className="mode-indicator">
              <span className="mode-icon">{getModeIcon()}</span>
              <span className="mode-badge" data-mode={isViewMode ? "view" : isEditMode ? "edit" : "add"}>
                {isViewMode ? "View Mode" : isEditMode ? "Edit Mode" : "Add Mode"}
              </span>
            </div>
            <h1 className="resume-section-form-title">
              {getModeTitle()}
            </h1>
            <p className="resume-section-form-subtitle">Resume: <strong>{resumeTitle}</strong></p>
          </div>
          <div className="header-actions">
            {isViewMode && (
              <ButtonComponent
                onClick={() => navigate(`/admin/entities/resumes/${resumeId}/work-experiences/${id}/edit`)}
                size="sm"
                type="button"
                variant="info"
              >
                ✏️ Edit
              </ButtonComponent>
            )}
            <ButtonComponent
              onClick={() => navigate(`/admin/entities/resumes/${resumeId}/work-experiences`)}
              variant="ghost"
              size="sm"
              type="button"
            >
              ← Back
            </ButtonComponent>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="resume-section-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="company">Company {!isViewMode && <span className="required">*</span>}</label>
              <input
                id="company"
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                placeholder="e.g., Tech Company Inc."
                required={!isViewMode}
                disabled={isViewMode}
                readOnly={isViewMode}
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">Position {!isViewMode && <span className="required">*</span>}</label>
              <input
                id="position"
                type="text"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                placeholder="e.g., Senior Full Stack Developer"
                required={!isViewMode}
                disabled={isViewMode}
                readOnly={isViewMode}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              value={formData.location || ""}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="e.g., Brussels, Belgium"
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date {!isViewMode && <span className="required">*</span>}</label>
              <input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                required={!isViewMode}
                disabled={isViewMode}
                readOnly={isViewMode}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                type="date"
                value={formData.endDate || ""}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                disabled={isViewMode || formData.isCurrent}
                readOnly={isViewMode}
              />
            </div>

            <div className="form-group checkbox-group">
              <label htmlFor="isCurrent" className="checkbox-label">
                <input
                  id="isCurrent"
                  type="checkbox"
                  checked={formData.isCurrent}
                  onChange={(e) => handleInputChange("isCurrent", e.target.checked)}
                  disabled={isViewMode}
                />
                <span>Currently working here</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-section-title">💡 Achievements</h2>
            <p className="form-section-description">
              {isViewMode 
                ? "Key achievements and responsibilities from this role" 
                : "Add key achievements or responsibilities from this role"}
            </p>
            
            {isViewMode ? (
              <div className="achievements-view-list">
                {formData.achievements && formData.achievements.length > 0 ? (
                  <ul className="achievements-list">
                    {formData.achievements.map((achievement, index) => (
                      <li key={index} className="achievement-view-item">
                        <span className="achievement-bullet">•</span>
                        <span className="achievement-text">{achievement.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data-message">No achievements added yet</p>
                )}
              </div>
            ) : (
              <>
                {formData.achievements?.map((achievement, index) => (
                  <div key={index} className="achievement-item">
                    <div className="achievement-input-wrapper">
                      <span className="achievement-number">{index + 1}</span>
                      <input
                        type="text"
                        className="form-input achievement-input"
                        value={achievement.text}
                        onChange={(e) => handleAchievementChange(index, e.target.value)}
                        placeholder="e.g., Led a team of 5 developers to deliver a major product feature"
                      />
                      <ButtonComponent
                        type="button"
                        variant="warning"
                        size="sm"
                        onClick={() => removeAchievement(index)}
                        disabled={formData.achievements?.length === 1}
                        title="Remove achievement"
                      >
                        🗑️
                      </ButtonComponent>
                    </div>
                  </div>
                ))}
                
                <ButtonComponent
                  type="button"
                  variant="info"
                  size="sm"
                  onClick={addAchievement}
                >
                  ➕ Add Achievement
                </ButtonComponent>

              </>
            )}
          </div>

          <div className="form-section">
            <h2 className="form-section-title">🛠️ Technologies</h2>
            <p className="form-section-description">
              {isViewMode 
                ? "Technologies used in this role" 
                : "Add technologies you used in this role"}
            </p>
            
            {isViewMode ? (
              <div className="technologies-view-list">
                {formData.technologies && formData.technologies.length > 0 ? (
                  <ul className="technologies-list">
                    {formData.technologies.map((technology, index) => (
                      <li key={index} className="technology-view-item">
                        <span className="technology-bullet">•</span>
                        <span className="technology-text">
                          <strong>{technology.name}</strong>
                          {technology.category && <span className="technology-category"> ({technology.category})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data-message">No technologies added yet</p>
                )}
              </div>
            ) : (
              <>
                {formData.technologies?.map((technology, index) => (
                  <div key={index} className="technology-item">
                    <div className="technology-input-wrapper">
                      <span className="technology-number">{index + 1}</span>
                      <input
                        type="text"
                        className={`form-input technology-input ${errors[`technology_${index}_name`] ? 'error' : ''}`}
                        value={technology.name}
                        onChange={(e) => handleTechnologyChange(index, 'name', e.target.value)}
                        placeholder="e.g., React.js"
                        maxLength={50}
                      />
                      <div className="character-counter">
                        <span className={technology.name.length > 45 ? 'warning' : technology.name.length > 50 ? 'error' : ''}>
                          {technology.name.length}/50
                        </span>
                      </div>
                      {errors[`technology_${index}_name`] && (
                        <div className="field-error-message">
                          {errors[`technology_${index}_name`]}
                        </div>
                      )}
                    </div>
                    <div className="technology-input-wrapper">
                      <input
                        type="text"
                        className={`form-input technology-category-input ${errors[`technology_${index}_category`] ? 'error' : ''}`}
                        value={technology.category || ""}
                        onChange={(e) => handleTechnologyChange(index, 'category', e.target.value)}
                        placeholder="e.g., Frontend"
                        maxLength={50}
                      />
                      <div className="character-counter">
                        <span className={technology.category && technology.category.length > 45 ? 'warning' : technology.category && technology.category.length > 50 ? 'error' : ''}>
                          {technology.category ? technology.category.length : 0}/50
                        </span>
                      </div>
                      {errors[`technology_${index}_category`] && (
                        <div className="field-error-message">
                          {errors[`technology_${index}_category`]}
                        </div>
                      )}
                      <ButtonComponent
                        type="button"
                        variant="warning"
                        onClick={() => removeTechnology(index)}
                        disabled={formData.technologies?.length === 0}
                        title="Remove technology"
                      >
                        🗑️
                      </ButtonComponent>
                    </div>
                  </div>
                ))}
                
                <ButtonComponent
                  type="button"
                  variant="primary"
                  onClick={addTechnology}
                >
                  ➕ Add Technology
                </ButtonComponent>
              </>
            )}
          </div>

          {!isViewMode && (
            <div className="form-actions">
              <ButtonComponent type="submit" variant="primary" disabled={loading}>
                {loading ? "Saving..." : isEditMode ? "💾 Update Experience" : "➕ Add Experience"}
              </ButtonComponent>
              <ButtonComponent
                type="button"
                variant="secondary"
                onClick={() => navigate(`/admin/entities/resumes/${resumeId}/work-experiences`)}
              >
                Cancel
              </ButtonComponent>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
export default ExperienceForm;
