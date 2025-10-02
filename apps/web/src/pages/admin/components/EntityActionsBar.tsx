import React from "react";
import {
  Button,
  LoginArrow,
  isProduction,
  useAuth,
} from "@asafarim/shared-ui-react";

export interface EntityActionsBarProps {
  entityType: string;
  entityDisplayName: string;
  onAddEntity?: () => void;
  onViewMyEntities?: () => void;
  onViewAllEntities?: () => void;
  onManageEntities?: () => void;
  onLoginRedirect?: () => void;
  showAddButton?: boolean;
  showMyButton?: boolean;
  showAllButton?: boolean;
  showManageButton?: boolean;
}

/**
 * EntityActionsBar - A reusable component for entity management actions
 * 
 * This component displays different action buttons based on authentication status
 * and user roles. It supports custom callbacks for all actions and can be used
 * for any entity type (work-experiences, publications, resumes, etc.)
 */
const EntityActionsBar: React.FC<EntityActionsBarProps> = ({
  entityType,
  entityDisplayName,
  onAddEntity,
  onViewMyEntities,
  onViewAllEntities,
  onManageEntities,
  onLoginRedirect,
  showAddButton = true,
  showMyButton = true,
  showAllButton = true,
  showManageButton = true,
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

  const handleAddEntity = () => {
    if (onAddEntity) {
      onAddEntity();
      return;
    }
    
    // Default behavior - navigate to entity-specific new page
    if (entityType === "work-experiences") {
      window.location.href = "/portfolio/work-experiences/new";
    } else if (entityType === "publications") {
      window.location.href = "/portfolio/publications/new";
    } else if (entityType === "resumes") {
      window.location.href = "/admin/resume/new";
    } else {
      window.location.href = `/admin/entities/${entityType}/new`;
    }
  };

  const handleMyEntities = () => {
    if (onViewMyEntities) {
      onViewMyEntities();
      return;
    }
    
    // Default behavior - navigate to filtered view
    if (entityType === "work-experiences") {
      window.location.href = "/portfolio/work-experiences?myExperiences=true";
    } else if (entityType === "publications") {
      window.location.href = "/portfolio/publications?myPublications=true";
    } else if (entityType === "resumes") {
      window.location.href = "/admin/resume?myResumes=true";
    } else {
      window.location.href = `/admin/entities/${entityType}?myRecords=true`;
    }
  };

  const handleManageEntities = () => {
    if (onManageEntities) {
      onManageEntities();
      return;
    }
    
    // Default behavior - navigate to management page
    if (entityType === "work-experiences") {
      window.location.href = "/portfolio/work-experiences";
    } else if (entityType === "publications") {
      window.location.href = "/portfolio/publications/manage";
    } else if (entityType === "resumes") {
      window.location.href = "/admin/resume";
    } else {
      window.location.href = `/admin/entities/${entityType}`;
    }
  };
  
  const handleAllEntities = () => {
    if (onViewAllEntities) {
      onViewAllEntities();
      return;
    }
    
    // Default behavior - navigate to all entities view
    if (entityType === "work-experiences") {
      window.location.href = "/portfolio/work-experiences";
    } else if (entityType === "publications") {
      window.location.href = "/portfolio/publications";
    } else if (entityType === "resumes") {
      window.location.href = "/admin/resume";
    } else {
      window.location.href = `/admin/entities/${entityType}`;
    }
  };

  // Determine alignment class based on authentication status
  const alignmentClass = isAuthenticated ? "actions-center" : "actions-right";

  return (
    <div className="entity-actions-bar">
      <div className={alignmentClass}>
        {!isAuthenticated || authLoading ? (
          // Show login button when not authenticated
          <div className="entity-actions tooltip">
            <Button
              onClick={handleLoginRedirect}
              aria-label="Login"
              variant="outline"
            >
              <LoginArrow />
            </Button>
            <span className="tooltip-text">Login to manage {entityDisplayName.toLowerCase()}</span>
          </div>
        ) : (
          // Show direct action buttons when authenticated
          <div className="actions-buttons-group">
            {showAddButton && (
              <Button
                onClick={handleAddEntity}
                aria-label={`Add new ${entityDisplayName.toLowerCase()}`}
                variant="brand"
              >
                + Add {entityDisplayName}
              </Button>
            )}
            {showMyButton && (
              <Button
                onClick={handleMyEntities}
                aria-label={`View my ${entityDisplayName.toLowerCase()}`}
                variant="info"
              >
                My {entityDisplayName}
              </Button>
            )}
            {isAdmin && showAllButton && (
              <Button
                onClick={handleAllEntities}
                aria-label={`View all ${entityDisplayName.toLowerCase()}`}
                variant="info"
              >
                All {entityDisplayName}
              </Button>
            )}
            {showManageButton && (
              <Button
                onClick={handleManageEntities}
                aria-label={`Manage ${entityDisplayName.toLowerCase()}`}
                variant="success"
              >
                Manage {entityDisplayName}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityActionsBar;
