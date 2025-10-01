import React from "react";
import {
  Button,
  LoginArrow,
  isProduction,
  useAuth,
} from "@asafarim/shared-ui-react";

export interface WorkExperienceActionsBarProps {
  onAddWorkExperience?: () => void;
  onViewMyWorkExperiences?: () => void;
  onViewAllWorkExperiences?: () => void;
  onManageWorkExperiences?: () => void;
  onLoginRedirect?: () => void;
}

/**
 * WorkExperienceActionsBar - A reusable component for work experience management actions
 * 
 * This component displays different action buttons based on authentication status
 * and user roles. It supports custom callbacks for all actions.
 */
const WorkExperienceActionsBar: React.FC<WorkExperienceActionsBarProps> = ({
  onAddWorkExperience,
  onViewMyWorkExperiences,
  onViewAllWorkExperiences,
  onManageWorkExperiences,
  onLoginRedirect,
}) => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  
  // Check if user is admin based on roles in the user object
  const isAdmin = user?.roles?.map((role: string) => role.toLowerCase()).includes('admin') || false;

  // Default handlers with fallbacks to the provided callbacks
  const handleLoginRedirect = () => {
    if (onLoginRedirect) {
      onLoginRedirect();
      return;
    }

    // Default login redirect behavior
    const baseUrl = isProduction
      ? "https://identity.asafarim.be/login"
      : "http://identity.asafarim.local:5177/login";
    window.location.href = `${baseUrl}?returnUrl=${encodeURIComponent(
      window.location.href
    )}`;
  };

  const handleAddWorkExperience = () => {
    if (onAddWorkExperience) {
      onAddWorkExperience();
      return;
    }
    
    // Default behavior
    window.location.href = "/portfolio/work-experiences/new";
  };

  const handleMyWorkExperiences = () => {
    if (onViewMyWorkExperiences) {
      onViewMyWorkExperiences();
      return;
    }
    
    // Default behavior
    window.location.href = "/portfolio/work-experiences?myExperiences=true";
  };

  const handleManageWorkExperiences = () => {
    if (onManageWorkExperiences) {
      onManageWorkExperiences();
      return;
    }
    
    // Default behavior
    window.location.href = "/portfolio/work-experiences";
  };
  
  const handleAllWorkExperiences = () => {
    if (onViewAllWorkExperiences) {
      onViewAllWorkExperiences();
      return;
    }
    
    // Default behavior
    window.location.href = "/portfolio/work-experiences";
  };

  // Determine alignment class based on authentication status
  const alignmentClass = isAuthenticated ? "actions-center" : "actions-right";

  return (
    <div className="work-experience-actions-bar">
      <div className={alignmentClass}>
        {!isAuthenticated || authLoading ? (
          // Show login button when not authenticated
          <div className="work-experience-actions tooltip">
            <Button
              onClick={handleLoginRedirect}
              aria-label="Login"
              variant="outline"
            >
              <LoginArrow />
            </Button>
            <span className="tooltip-text">Login to manage work experiences</span>
          </div>
        ) : (
          // Show direct action buttons when authenticated
          <div className="actions-buttons-group">
            <Button
              onClick={handleAddWorkExperience}
              aria-label="Add new work experience"
              variant="brand"
            >
              Add Work Experience
            </Button>
            <Button
              onClick={handleMyWorkExperiences}
              aria-label="View my work experiences"
              variant="info"
            >
              My Work Experiences
            </Button>
            {isAdmin && (
              <Button
                onClick={handleAllWorkExperiences}
                aria-label="View all work experiences"
                variant="info"
              >
                All Work Experiences
              </Button>
            )}
            <Button
              onClick={handleManageWorkExperiences}
              aria-label="Manage work experiences"
              variant="success"
            >
              Manage Work Experiences
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkExperienceActionsBar;
