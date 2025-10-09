import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@asafarim/shared-ui-react";
import { ENTITY_TYPES, type EntityType } from "../../services/entityService";
import "./entity-management.css";

const EntityManagement = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(
        window.location.href
      )}`;
    }
  }, [authLoading, isAuthenticated]);

  const handleEntityClick = (entity: EntityType) => {
    navigate(`/admin/entities/${entity.id}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="entity-management">
        <div className="entity-management-container">
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="entity-management">
      <div className="entity-management-container">
        <header className="entity-management-header">
          <h1 className="entity-management-title">Entity Management</h1>
          <p className="entity-management-subtitle">
            Select an entity type to view and manage records
          </p>
        </header>

        <div className="entity-grid">
          {ENTITY_TYPES.map((entity) => (
            <div
              key={entity.id}
              className="entity-card"
              onClick={() => handleEntityClick(entity)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleEntityClick(entity);
                }
              }}
            >
              <div className="entity-card-icon">{entity.icon}</div>
              <h3 className="entity-card-title">{entity.displayName}</h3>
              <p className="entity-card-description">{entity.description}</p>
              <div className="entity-card-footer">
                <span className="entity-card-action">View Records →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EntityManagement;
