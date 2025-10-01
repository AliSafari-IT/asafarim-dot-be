import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, useAuth, Eye, Edit, Remove } from "@asafarim/shared-ui-react";
import {
  ENTITY_TYPES,
  fetchEntityRecords,
  deleteEntityRecord,
  getEntityDisplayName,
  type EntityRecord,
} from "../../services/entityService";
import "./entity-management.css";

const EntityTableView: React.FC = () => {
  const navigate = useNavigate();
  const { entityType } = useParams<{ entityType: string }>();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [records, setRecords] = useState<EntityRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Check if user is admin
  const isAdmin =
    user?.roles?.map((role: string) => role.toLowerCase()).includes("admin") ||
    false;

  // Get entity configuration
  const entity = ENTITY_TYPES.find((e) => e.id === entityType);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(
        window.location.href
      )}`;
    }
  }, [authLoading, isAuthenticated]);

  // Load records
  useEffect(() => {
    const loadRecords = async () => {
      if (!entityType || !isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch records - admins get all, regular users get only their own
        const response = await fetchEntityRecords(entityType, !isAdmin);

        console.log(`Loaded ${response.total} ${entityType} records`);
        setRecords(response.records);
      } catch (err) {
        console.error(`Error loading ${entityType}:`, err);
        setError(`Failed to load ${entityType}`);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [entityType, isAuthenticated, isAdmin]);

  const handleDelete = async (recordId: number | string, recordUserId?: string) => {
    if (!entityType) return;

    // Check permissions
    const canDelete = isAdmin || user?.id === recordUserId;

    if (!canDelete) {
      setError("You do not have permission to delete this record");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete this ${entity?.displayName || "record"}?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const success = await deleteEntityRecord(
        entityType,
        recordId,
        isAdmin && recordUserId !== user?.id
      );

      if (success) {
        setRecords(records.filter((r) => r.id !== recordId));
      } else {
        setError("Failed to delete record");
      }
    } catch (err) {
      console.error("Error deleting record:", err);
      setError("An error occurred while deleting the record");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (recordId: number | string) => {
    // Navigate to entity-specific view page
    if (entityType === "resumes") {
      navigate(`/admin/resume/${recordId}`);
    } else if (entityType === "work-experiences") {
      navigate(`/portfolio/work-experiences/view/${recordId}`);
    } else if (entityType === "publications") {
      navigate(`/portfolio/publications/view/${recordId}`);
    } else {
      navigate(`/admin/entities/${entityType}/${recordId}`);
    }
  };

  const handleEdit = (recordId: number | string, recordUserId?: string) => {
    // Check permissions
    const canEdit = isAdmin || user?.id === recordUserId;

    if (!canEdit) {
      setError("You do not have permission to edit this record");
      return;
    }

    // Navigate to entity-specific edit page
    if (entityType === "work-experiences") {
      navigate(`/portfolio/work-experiences/edit/${recordId}`);
    } else if (entityType === "publications") {
      navigate(`/portfolio/publications/edit/${recordId}`);
    } else {
      navigate(`/admin/entities/${entityType}/${recordId}/edit`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!entity) {
    return (
      <div className="entity-table-view">
        <div className="entity-table-container">
          <div className="error-message">Entity type not found</div>
          <Button onClick={() => navigate("/admin/entities")}>
            Back to Entity Management
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="entity-table-view">
        <div className="entity-table-container">
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="entity-table-view">
        <div className="entity-table-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading {entity.displayName}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="entity-table-view">
      <div className="entity-table-container">
        <header className="entity-table-header">
          <div className="header-content">
            <div className="header-title-section">
              <span className="entity-icon">{entity.icon}</span>
              <div>
                <h1 className="entity-table-title">
                  {isAdmin ? `All ${entity.displayName}` : `My ${entity.displayName}`}
                </h1>
                <p className="entity-table-subtitle">
                  {isAdmin
                    ? `Viewing all records in the system`
                    : `Viewing your personal records`}
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/admin/entities")} variant="secondary">
              ← Back to Entities
            </Button>
          </div>
        </header>

        {error && <div className="error-message">{error}</div>}

        {records.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-message">
              No {entity.displayName.toLowerCase()} found.
            </p>
          </div>
        ) : (
          <div className="entity-table-wrapper">
            <table className="entity-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name/Title</th>
                  {isAdmin && <th>User ID</th>}
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>
                      <div className="record-name">
                        {getEntityDisplayName(record)}
                      </div>
                    </td>
                    {isAdmin && (
                      <td>
                        <span className="user-id-badge">
                          {record.userId || record.createdBy || "N/A"}
                        </span>
                      </td>
                    )}
                    <td>{formatDate(record.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => handleView(record.id)}
                          className="action-button view"
                          disabled={isDeleting}
                          aria-label="View record"
                          title="View"
                        >
                          <Eye width={16} height={16} /> View
                        </button>
                        <button
                          onClick={() => handleEdit(record.id, record.userId)}
                          className="action-button edit"
                          disabled={
                            isDeleting ||
                            (!isAdmin && user?.id !== record.userId)
                          }
                          aria-label="Edit record"
                          title="Edit"
                        >
                          <Edit width={16} height={16} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(record.id, record.userId)}
                          disabled={
                            isDeleting ||
                            (!isAdmin && user?.id !== record.userId)
                          }
                          aria-label="Delete record"
                          title="Delete"
                          className="action-button delete"
                        >
                          <Remove />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-footer">
          <p className="record-count">
            Showing {records.length} record{records.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EntityTableView;
