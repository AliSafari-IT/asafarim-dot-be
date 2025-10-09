import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ButtonComponent as Button, Edit, PlusIcon, useAuth, useNotifications } from "@asafarim/shared-ui-react";
import { fetchResumes } from "../../../services/resumeApi";
import "./resume-section-management.css";
import { RESUME_SECTION_TYPES, type ResumeSectionType } from "./resume-section-types";

interface Resume {
  id: string;
  title: string;
  userId?: string;
}

const ResumeSectionManagement = () => {
  const navigate = useNavigate();
  const { id: resumeId } = useParams<{ id?: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumeId || "");
  const [loading, setLoading] = useState<boolean>(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(
        window.location.href
      )}`;
    }
  }, [authLoading, isAuthenticated]);

  // Load user's resumes
  useEffect(() => {
    const loadResumes = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const userResumes = await fetchResumes(true); // myResumes = true
        setResumes(userResumes);

        // Set selectedResumeId from URL param if available, otherwise auto-select first resume
        if (resumeId) {
          setSelectedResumeId(resumeId);
        } else if (userResumes.length > 0) {
          setSelectedResumeId(userResumes[0].id);
        }
      } catch (error) {
        console.error("Failed to load resumes:", error);
        addNotification("error", "Failed to load resumes");
      } finally {
        setLoading(false);
      }
    };

    loadResumes();
  }, [isAuthenticated, resumeId, addNotification]);

  const handleSectionClick = (section: ResumeSectionType) => {
    if (!selectedResumeId) {
      addNotification("warning", "Please select a resume first");
      return;
    }
    navigate(`/admin/entities/resumes/${selectedResumeId}/${section.id}`);
  };

  const handleCreateResume = () => {
    navigate("/admin/entities/resumes/new");
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="resume-section-management">
        <div className="resume-section-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="resume-section-management">
        <div className="resume-section-container">
          <header className="resume-section-header">
            <h1 className="resume-section-title">Resume Sections</h1>
            <Button onClick={() => navigate("/admin/entities")} variant="secondary">
              ← Back to Entities
            </Button>
          </header>
          <div className="empty-state">
            <p className="empty-state-message">
              You don't have any resumes yet. Create one to start managing sections.
            </p>
            <Button onClick={handleCreateResume} variant="primary">
              + Create Resume
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="resume-section-management">
      <div className="resume-section-container">
        <header className="resume-section-header">
          <div>
            <h1 className="resume-section-title">Resume Sections</h1>
            <p className="resume-section-subtitle">
              Manage different sections of your resume
            </p>
          </div>
          <Button onClick={() => navigate("/admin/entities")} variant="secondary">
            ← Back to Entities
          </Button>
        </header>

        {/* Resume Selector : set by default on selectedResumeId*/}
        <div className="resume-selector">
          <label htmlFor="resume-select" className="resume-selector-label">
            Select Resume:
          </label>
          <select
            id="resume-select"
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="resume-selector-dropdown"
          >
            {resumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.title || "Untitled Resume"}
              </option>
            ))}
          </select>
          <Button
            onClick={handleCreateResume}
            variant="ghost"
            size="sm"
            leftIcon={<PlusIcon />}
          >
            New Resume
          </Button>
          {selectedResumeId && (
            <Button
              onClick={() => navigate(`/admin/entities/resumes/${selectedResumeId}/details`)}
              variant="ghost"
              size="sm"
              leftIcon={<Edit />}
            >
              Edit Details
            </Button>
          )}
        </div>

        {/* Section Grid */}
        <div className="resume-section-grid">
          {RESUME_SECTION_TYPES.map((section) => (
            <div
              key={section.id}
              className="resume-section-card"
              onClick={() => handleSectionClick(section)}
              role="button"
              tabIndex={0}
              style={{ borderLeftColor: section.color }}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleSectionClick(section);
                }
              }}
            >
              <div className="resume-section-card-header">
                <div
                  className="resume-section-card-icon"
                  style={{ backgroundColor: `${section.color}20` }}
                >
                  {section.icon}
                </div>
                <h3 className="resume-section-card-title">{section.displayName}</h3>
              </div>
              <p className="resume-section-card-description">{section.description}</p>
              <div className="resume-section-card-footer">
                <span className="resume-section-card-action">Manage →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResumeSectionManagement;
