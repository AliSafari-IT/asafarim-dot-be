import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  fetchWorkExperienceById,
  type WorkExperienceDto
} from "../../../services/workExperienceService";
import { Button, useAuth } from "@asafarim/shared-ui-react";
import { WorkExperienceActionsBar } from "./components";
import "./work-exp-styles.css";

const ViewWorkExperience: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [workExperience, setWorkExperience] = useState<WorkExperienceDto | null>(null);

  // Check if user is admin or owner
  const isAdmin = user?.roles?.map((role: string) => role.toLowerCase()).includes('admin') || false;
  const isOwner = workExperience?.userId === user?.id;
  const canEdit = isAuthenticated && (isAdmin || isOwner);

  // Load work experience data
  React.useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await fetchWorkExperienceById(parseInt(id));
        
        if (data) {
          setWorkExperience(data);
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
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const calculateDuration = () => {
    if (!workExperience) return "";
    
    const start = new Date(workExperience.startDate);
    const end = workExperience.endDate ? new Date(workExperience.endDate) : new Date();
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
  };

  if (isLoading) {
    return (
      <div className="view-work-experience-page">
        <div className="view-work-experience-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading work experience...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !workExperience) {
    return (
      <div className="view-work-experience-page">
        <div className="view-work-experience-container">
          <div className="work-experiences-error">{error || "Work experience not found"}</div>
          <Button onClick={() => navigate("/portfolio/work-experiences")}>
            Back to Work Experiences
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-work-experience-page">
      <div className="view-work-experience-container">
        <WorkExperienceActionsBar />
        
        <div className="view-header">
          <div className="view-header-content">
            <div className="view-title-section">
              <h1 className="view-job-title">{workExperience.jobTitle}</h1>
              <div className="view-company-info">
                <h2 className="view-company-name">{workExperience.companyName}</h2>
                {workExperience.location && (
                  <span className="view-location"> • {workExperience.location}</span>
                )}
              </div>
              <div className="view-date-info">
                <span className="view-date-range">
                  {formatDate(workExperience.startDate)} - {workExperience.isCurrent ? 'Present' : formatDate(workExperience.endDate!)}
                </span>
                <span className="view-duration"> • {calculateDuration()}</span>
                {workExperience.isCurrent && (
                  <span className="current-badge">Current Position</span>
                )}
              </div>
            </div>
            
            <div className="view-badges">
              {workExperience.highlighted && (
                <span className="badge badge-highlighted">⭐ Highlighted</span>
              )}
              {workExperience.isPublished ? (
                <span className="badge badge-published">✓ Published</span>
              ) : (
                <span className="badge badge-draft">Draft</span>
              )}
            </div>
          </div>
        </div>

        <div className="view-content">
          {workExperience.description && (
            <div className="view-section">
              <h3 className="view-section-title">About the Role</h3>
              <p className="view-description">{workExperience.description}</p>
            </div>
          )}
          
          {workExperience.achievements && workExperience.achievements.length > 0 && (
            <div className="view-section">
              <h3 className="view-section-title">Key Achievements & Responsibilities</h3>
              <ul className="view-achievements-list">
                {workExperience.achievements.map((achievement, index) => (
                  <li key={achievement.id || index} className="view-achievement-item">
                    <span className="achievement-bullet">▸</span>
                    <span className="achievement-text">{achievement.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="view-metadata-section">
            <div className="metadata-grid">
              <div className="metadata-item">
                <span className="metadata-label">Created</span>
                <span className="metadata-value">{new Date(workExperience.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              
              {workExperience.updatedAt && (
                <div className="metadata-item">
                  <span className="metadata-label">Last Updated</span>
                  <span className="metadata-value">{new Date(workExperience.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {canEdit && (
          <div className="view-actions">
            <Button
              onClick={() => navigate(`/portfolio/work-experiences/edit/${id}`)}
              variant="primary"
            >
              Edit Experience
            </Button>
            <Button
              onClick={() => navigate("/portfolio/work-experiences")}
              variant="secondary"
            >
              Back to List
            </Button>
          </div>
        )}
        
        {!canEdit && (
          <div className="view-actions">
            <Button
              onClick={() => navigate("/portfolio/work-experiences")}
              variant="secondary"
            >
              Back to List
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewWorkExperience;
