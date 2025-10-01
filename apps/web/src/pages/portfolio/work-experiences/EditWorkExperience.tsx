import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  fetchWorkExperienceById,
  updateWorkExperience, 
  type WorkExperienceRequest
} from "../../../services/workExperienceService";
import { Button, useAuth } from "@asafarim/shared-ui-react";
import "./work-exp-styles.css";

const EditWorkExperience: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Form state
  const [formData, setFormData] = useState<WorkExperienceRequest>({
    jobTitle: "",
    companyName: "",
    location: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
    achievements: [{ text: "" }],
    sortOrder: 0,
    highlighted: false,
    isPublished: true
  });

  // Load work experience data
  React.useEffect(() => {
    const loadData = async () => {
      if (!id || !isAuthenticated) return;
      
      try {
        setIsLoading(true);
        const data = await fetchWorkExperienceById(parseInt(id));
        
        if (data) {
          setFormData({
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            location: data.location || "",
            startDate: data.startDate.split('T')[0],
            endDate: data.endDate ? data.endDate.split('T')[0] : "",
            isCurrent: data.isCurrent,
            description: data.description || "",
            achievements: data.achievements && data.achievements.length > 0 
              ? data.achievements.map(a => ({ text: a.text }))
              : [{ text: "" }],
            sortOrder: data.sortOrder,
            highlighted: data.highlighted,
            isPublished: data.isPublished
          });
        } else {
          setError("Work experience not found");
        }
      } catch (err) {
        console.error("Error loading work experience:", err);
        setError("Failed to load work experience");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, isAuthenticated]);

  // Only redirect if not authenticated after loading is complete
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("Authentication check complete, not authenticated. Redirecting to login.");
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(window.location.href)}`;
    }
  }, [authLoading, isAuthenticated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleAchievementChange = (index: number, value: string) => {
    const updatedAchievements = [...(formData.achievements || [])];
    updatedAchievements[index] = { text: value };
    
    setFormData(prev => ({
      ...prev,
      achievements: updatedAchievements
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      setError("Invalid work experience ID");
      return;
    }
    
    // Validate form
    if (!formData.jobTitle.trim()) {
      setError("Job title is required");
      return;
    }
    
    if (!formData.companyName.trim()) {
      setError("Company name is required");
      return;
    }
    
    if (!formData.startDate) {
      setError("Start date is required");
      return;
    }
    
    // Filter out empty achievements
    const filteredAchievements = formData.achievements?.filter(
      achievement => achievement.text.trim() !== ""
    ) || [];
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const workExperienceToSubmit: WorkExperienceRequest = {
        ...formData,
        achievements: filteredAchievements
      };
      
      // If current job, ensure endDate is null
      if (workExperienceToSubmit.isCurrent) {
        workExperienceToSubmit.endDate = undefined;
      }
      
      const result = await updateWorkExperience(parseInt(id), workExperienceToSubmit);
      
      if (result) {
        navigate("/portfolio/work-experiences");
      } else {
        setError("Failed to update work experience. Please try again.");
      }
    } catch (err) {
      console.error("Error updating work experience:", err);
      setError("An error occurred while updating the work experience.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="new-work-experience">Redirecting to login...</div>;
  }

  if (isLoading) {
    return (
      <div className="new-work-experience">
        <div className="new-work-experience-container">
          <div className="loading-spinner"></div>
          <p>Loading work experience...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.jobTitle) {
    return (
      <div className="new-work-experience">
        <div className="new-work-experience-container">
          <div className="work-experiences-error">{error}</div>
          <Button onClick={() => navigate("/portfolio/work-experiences")}>
            Back to Work Experiences
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="new-work-experience">
      <div className="new-work-experience-container">
        <h1 className="new-work-experience-title">Edit Work Experience</h1>
        
        {error && (
          <div className="work-experiences-error">
            {error}
          </div>
        )}
        
        <form className="new-work-experience-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2 className="form-section-title">Basic Information</h2>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="jobTitle" className="form-label required-field">
                  Job Title
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  className="form-input"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="companyName" className="form-label required-field">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  className="form-input"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="location" className="form-label">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-input"
                  value={formData.location || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., Brussels, Belgium"
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="sortOrder" className="form-label">
                  Sort Order
                </label>
                <input
                  type="number"
                  id="sortOrder"
                  name="sortOrder"
                  className="form-input"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  min="0"
                />
                <small>Lower numbers appear first</small>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h2 className="form-section-title">Dates</h2>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="startDate" className="form-label required-field">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="form-input"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="endDate" className="form-label">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="form-input"
                  value={formData.endDate || ""}
                  onChange={handleInputChange}
                  disabled={formData.isCurrent}
                />
              </div>
              
              <div className="form-field form-field-full">
                <div className="form-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    name="isCurrent"
                    className="form-checkbox"
                    checked={formData.isCurrent}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="isCurrent" className="form-label">
                    This is my current job
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h2 className="form-section-title">Description</h2>
            <div className="form-field">
              <label htmlFor="description" className="form-label">
                Job Description
              </label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={5}
                placeholder="Describe your role and responsibilities..."
              />
            </div>
          </div>
          
          <div className="form-section">
            <h2 className="form-section-title">Achievements</h2>
            <p>Add key achievements or responsibilities from this role</p>
            
            {formData.achievements?.map((achievement, index) => (
              <div key={index} className="achievement-item">
                <div className="achievement-input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    value={achievement.text}
                    onChange={(e) => handleAchievementChange(index, e.target.value)}
                    placeholder="e.g., Led a team of 5 developers to deliver a major product feature"
                  />
                  <button
                    type="button"
                    className="achievement-remove-button"
                    onClick={() => removeAchievement(index)}
                    disabled={formData.achievements?.length === 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              className="achievement-add-button"
              onClick={addAchievement}
            >
              Add Achievement
            </button>
          </div>
          
          <div className="form-section">
            <h2 className="form-section-title">Display Options</h2>
            <div className="form-grid">
              <div className="form-field">
                <div className="form-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="highlighted"
                    name="highlighted"
                    className="form-checkbox"
                    checked={formData.highlighted}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="highlighted" className="form-label">
                    Highlight this experience
                  </label>
                </div>
              </div>
              
              <div className="form-field">
                <div className="form-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    className="form-checkbox"
                    checked={formData.isPublished}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="isPublished" className="form-label">
                    Published (visible to others)
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-buttons">
            <button
              type="submit"
              className="form-button form-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Work Experience"}
            </button>
            <Button
              onClick={() => navigate("/portfolio/work-experiences")}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWorkExperience;
