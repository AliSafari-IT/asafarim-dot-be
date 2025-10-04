import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, useAuth, useNotifications } from "@asafarim/shared-ui-react";
import {
  fetchProjectById,
  createProject,
  updateProject,
  type CreateProjectRequest,
} from "../../../services/projectApi";
import { fetchResumeById } from "../../../services/resumeApi";
import "./resume-section-form.css";

const ProjectForm: React.FC = () => {
  const navigate = useNavigate();
  const { resumeId, id } = useParams<{ resumeId: string; id?: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState<boolean>(false);
  const [resumeTitle, setResumeTitle] = useState<string>("");
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: "",
    description: "",
    technologies: [{ name: "", category: "" }],
    startDate: undefined,
    endDate: undefined,
    link: "",
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
    const loadProject = async () => {
      if (!id || !resumeId || !isAuthenticated) return;

      try {
        setLoading(true);
        const project = await fetchProjectById(resumeId, id);
        setFormData({
          name: project.name,
          description: project.description || "",
          technologies: project.technologies?.map(t => ({ name: t.name, category: t.category || "" })) || [{ name: "", category: "" }],
          startDate: project.startDate ? project.startDate.substring(0, 10) : undefined,
          endDate: project.endDate ? project.endDate.substring(0, 10) : undefined,
          link: project.link || "",
        });
      } catch (err) {
        console.error("Error loading project:", err);
        addNotification("error", "Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    // Load data for both view and edit modes
    if (isEditMode || isViewMode) {
      loadProject();
    }
  }, [id, resumeId, isAuthenticated, isEditMode, isViewMode, addNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeId) return;

    try {
      setLoading(true);

      if (isEditMode && id) {
        await updateProject(resumeId, id, formData);
        addNotification("success", "Project updated successfully!");
      } else {
        await createProject(resumeId, formData);
        addNotification("success", "Project added successfully!");
      }

      navigate(`/admin/resumes/${resumeId}/projects`);
    } catch (err) {
      console.error("Error saving project:", err);
      addNotification("error", `Failed to ${isEditMode ? "update" : "add"} project`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateProjectRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTechnologyChange = (index: number, field: 'name' | 'category', value: string) => {
    const updatedTechnologies = [...(formData.technologies || [])];
    updatedTechnologies[index] = { ...updatedTechnologies[index], [field]: value };
    
    setFormData(prev => ({
      ...prev,
      technologies: updatedTechnologies
    }));
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

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  const getModeTitle = () => {
    if (isViewMode) return "View Project";
    if (isEditMode) return "Edit Project";
    return "Add Project";
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
              <Button
                onClick={() => navigate(`/admin/resumes/${resumeId}/projects/${id}/edit`)}
                variant="primary"
                size="sm"
              >
                ✏️ Edit
              </Button>
            )}
            <Button
              onClick={() => navigate(`/admin/resumes/${resumeId}/projects`)}
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
              Project Title <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., E-commerce Platform"
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
              placeholder="Describe the project, your role, and key achievements..."
              rows={4}
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          <div className="form-section">
            <h2 className="form-section-title">🛠️ Technologies</h2>
            {isViewMode ? (
              formData.technologies && formData.technologies.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {formData.technologies.map((tech, idx) => (
                    <span key={idx} style={{ padding: "0.25rem 0.75rem", background: "#e0e7ff", borderRadius: "0.375rem" }}>
                      <strong>{tech.name}</strong>{tech.category && ` (${tech.category})`}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No technologies added</p>
              )
            ) : (
              <>
                {formData.technologies?.map((tech, idx) => (
                  <div key={idx} className="technology-item">
                    <input
                      type="text"
                      value={tech.name}
                      onChange={(e) => handleTechnologyChange(idx, 'name', e.target.value)}
                      placeholder="Technology name"
                    />
                    <input
                      type="text"
                      value={tech.category || ""}
                      onChange={(e) => handleTechnologyChange(idx, 'category', e.target.value)}
                      placeholder="Category"
                    />
                    <button type="button" onClick={() => removeTechnology(idx)}>Remove</button>
                  </div>
                ))}
                <button type="button" onClick={addTechnology}>➕ Add Technology</button>
              </>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={formData.startDate || ""}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
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
              disabled={isViewMode}
              readOnly={isViewMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="link">Project URL</label>
            {isViewMode ? (
              <a
                className="project-credential-url-field"
                href={formData.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {formData.link}
              </a>
            ) : (
              <input
                id="link"
                type="url"
                value={formData.link || ""}
                onChange={(e) => handleInputChange("link", e.target.value)}
              placeholder="https://..."
              disabled={isViewMode}
              readOnly={isViewMode}
            />
            )}
          </div>

          {!isViewMode && (
            <div className="form-actions">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Saving..." : isEditMode ? "Update Project" : "Add Project"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/admin/resumes/${resumeId}/projects`)}
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

export default ProjectForm;
