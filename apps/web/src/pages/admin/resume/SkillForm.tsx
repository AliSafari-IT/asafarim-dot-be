import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ButtonComponent as Button, useAuth, useNotifications } from "@asafarim/shared-ui-react";
import {
  fetchSkillById,
  createSkill,
  updateSkill,
  type CreateSkillRequest,
 // type SkillDto,
} from "../../../services/skillApi";
import { fetchResumeById } from "../../../services/resumeApi";
import "./resume-section-form.css";
import { getReturnUrl } from "./utils";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const SKILL_CATEGORIES = [
  "Technical",
  "Programming Languages",
  "Frameworks & Libraries",
  "Tools & Platforms",
  "Databases",
  "Cloud & DevOps",
  "Soft Skills",
  "Languages",
  "Other",
];

const SkillForm = () => {
  const navigate = useNavigate();
  const { resumeId, id } = useParams<{ resumeId: string; id?: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState<boolean>(false);
  const [resumeTitle, setResumeTitle] = useState<string>("");
  const [formData, setFormData] = useState<CreateSkillRequest>({
    name: "",
    category: "",
    level: "Intermediate",
    rating: 0,
  });

  const isEditMode = !!id;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getReturnUrl(window.location.href);
    }
  }, [authLoading, isAuthenticated]);

  // Load resume title
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

  // Load skill data if editing
  useEffect(() => {
    const loadSkill = async () => {
      if (!id || !resumeId || !isAuthenticated) return;

      try {
        setLoading(true);
        const skill = await fetchSkillById(resumeId, id);
        setFormData({
          name: skill.name,
          category: skill.category,
          level: skill.level,
          rating: skill.rating,
        });
      } catch (err) {
        console.error("Error loading skill:", err);
        addNotification("error", "Failed to load skill");
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) {
      loadSkill();
    }
  }, [id, resumeId, isAuthenticated, isEditMode, addNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeId) return;

    try {
      setLoading(true);

      if (isEditMode && id) {
        await updateSkill(resumeId, id, formData);
        addNotification("success", "Skill updated successfully!");
      } else {
        await createSkill(resumeId, formData);
        addNotification("success", "Skill added successfully!");
      }

      navigate(`/admin/entities/resumes/${resumeId}/skills`);
    } catch (err) {
      console.error("Error saving skill:", err);
      addNotification("error", `Failed to ${isEditMode ? "update" : "add"} skill`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateSkillRequest, value: string | number) => {
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
              {isEditMode ? "Edit" : "Add"} Skill
            </h1>
            <p className="resume-section-form-subtitle">Resume: {resumeTitle}</p>
          </div>
          <Button
            onClick={() => navigate(`/admin/entities/resumes/${resumeId}/skills`)}
            variant="secondary"
          >
            ← Back to Skills
          </Button>
        </header>

        <form onSubmit={handleSubmit} className="resume-section-form">
          <div className="form-group">
            <label htmlFor="name">
              Skill Name <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., React, Python, Project Management"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
            >
              <option value="">Select a category</option>
              {SKILL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="level">
              Proficiency Level <span className="required">*</span>
            </label>
            <select
              id="level"
              value={formData.level}
              onChange={(e) => handleInputChange("level", e.target.value)}
              required
            >
              {SKILL_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="rating">Rating (0-5)</label>
            <div className="rating-input">
              <input
                id="rating"
                type="range"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => handleInputChange("rating", parseInt(e.target.value))}
              />
              <div className="rating-display">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    style={{
                      color: i < formData.rating ? "#f59e0b" : "#d1d5db",
                      fontSize: "1.5rem",
                      cursor: "pointer",
                    }}
                    onClick={() => handleInputChange("rating", i + 1)}
                  >
                    ★
                  </span>
                ))}
                <span className="rating-value">({formData.rating}/5)</span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : isEditMode ? "Update Skill" : "Add Skill"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/admin/entities/resumes/${resumeId}/skills`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillForm;
