import React from "react";
import {
  Button,
  LoginArrow,
  isProduction,
  useAuth,
} from "@asafarim/shared-ui-react";

export interface PublicationActionsBarProps {
  onAddPublication?: () => void;
  onViewMyPublications?: () => void;
  onViewAllPublications?: () => void;
  onManagePublications?: () => void;
  onLoginRedirect?: () => void;
}

/**
 * PublicationActionsBar - A reusable component for publication management actions
 * 
 * This component displays different action buttons based on authentication status
 * and user roles. It supports custom callbacks for all actions.
 */
const PublicationActionsBar: React.FC<PublicationActionsBarProps> = ({
  onAddPublication,
  onViewMyPublications,
  onViewAllPublications,
  onManagePublications,
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

  const handleAddPublication = () => {
    if (onAddPublication) {
      onAddPublication();
      return;
    }
    
    // Default behavior
    window.location.href = "/portfolio/publications/new";
  };

  const handleMyPublications = () => {
    if (onViewMyPublications) {
      onViewMyPublications();
      return;
    }
    
    // Default behavior
    window.location.href = "/portfolio/publications?myPublications=true";
  };

  const handleManagePublications = () => {
    if (onManagePublications) {
      onManagePublications();
      return;
    }
    
    // Default behavior
    window.location.href = "/portfolio/publications/manage";
  };
  
  const handleAllPublications = () => {
    if (onViewAllPublications) {
      onViewAllPublications();
      return;
    }
    
    // Default behavior
    window.location.href = "/portfolio/publications";
  };

  // Determine alignment class based on authentication status
  const alignmentClass = isAuthenticated ? "actions-center" : "actions-right";

  return (
    <div className="publication-actions-bar">
      <div className={alignmentClass}>
        {!isAuthenticated || authLoading ? (
          // Show login button when not authenticated
          <div className="publication-actions tooltip">
            <Button
              onClick={handleLoginRedirect}
              aria-label="Login"
              variant="outline"
            >
              <LoginArrow />
            </Button>
            <span className="tooltip-text">Login to manage publications</span>
          </div>
        ) : (
          // Show direct action buttons when authenticated
          <div className="actions-buttons-group">
            <Button
              onClick={handleAddPublication}
              aria-label="Add new publication"
              variant="brand"
            >
              Add Publication
            </Button>
            <Button
              onClick={handleMyPublications}
              aria-label="View my publications"
              variant="info"
            >
              My Publications
            </Button>
            {isAdmin && (
              <Button
                onClick={handleAllPublications}
                aria-label="View all publications"
                variant="info"
              >
                All Publications
              </Button>
            )}
            <Button
              onClick={handleManagePublications}
              aria-label="Manage publications"
              variant="success"
            >
              Manage Publications
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicationActionsBar;
