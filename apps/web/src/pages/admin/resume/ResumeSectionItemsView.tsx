import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, useAuth, useNotifications, Eye, Edit, Remove } from "@asafarim/shared-ui-react";
import { RESUME_SECTION_TYPES } from "./resume-section-types";
import { fetchResumeById } from "../../../services/resumeApi";
import "./resume-section-items.css";

export interface ResumeSectionItem {
  id: string;
  [key: string]: unknown;
}

interface ResumeSectionItemsViewProps {
  sectionType: string;
  fetchItems: (resumeId: string) => Promise<ResumeSectionItem[]>;
  deleteItem: (resumeId: string, itemId: string) => Promise<void>;
  getItemDisplayName: (item: ResumeSectionItem) => string;
  getItemSubtitle?: (item: ResumeSectionItem) => string;
  renderItemDetails?: (item: ResumeSectionItem) => React.ReactNode;
}

const ResumeSectionItemsView: React.FC<ResumeSectionItemsViewProps> = ({
  sectionType,
  fetchItems,
  deleteItem,
  getItemDisplayName,
  getItemSubtitle,
  renderItemDetails,
}) => {
  const navigate = useNavigate();
  const { resumeId } = useParams<{ resumeId: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const [items, setItems] = useState<ResumeSectionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [resumeTitle, setResumeTitle] = useState<string>("");

  const section = RESUME_SECTION_TYPES.find((s) => s.id === sectionType);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(
        window.location.href
      )}`;
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

  // Load items
  useEffect(() => {
    const loadItems = async () => {
      if (!resumeId || !isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);
        const data = await fetchItems(resumeId);
        setItems(data);
      } catch (err) {
        console.error(`Error loading ${sectionType}:`, err);
        setError(`Failed to load ${section?.displayName || sectionType}`);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [resumeId, sectionType, isAuthenticated, fetchItems, section]);

  const handleDelete = async (itemId: string) => {
    if (!resumeId) return;

    if (!window.confirm(`Are you sure you want to delete this ${section?.name || "item"}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteItem(resumeId, itemId);
      setItems(items.filter((item) => item.id !== itemId));
      addNotification("success", `${section?.displayName || "Item"} deleted successfully`);
    } catch (err) {
      console.error("Error deleting item:", err);
      addNotification("error", `Failed to delete ${section?.name || "item"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdd = () => {
    navigate(`/admin/resumes/${resumeId}/${sectionType}/new`);
  };

  const handleEdit = (itemId: string) => {
    navigate(`/admin/resumes/${resumeId}/${sectionType}/${itemId}/edit`);
  };

  const handleView = (itemId: string) => {
    navigate(`/admin/resumes/${resumeId}/${sectionType}/${itemId}`);
  };

  if (!section) {
    return <div>Section type not found</div>;
  }

  if (!isAuthenticated || loading) {
    return (
      <div className="resume-section-items-view">
        <div className="resume-section-items-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resume-section-items-view">
      <div className="resume-section-items-container">
        <header className="resume-section-items-header">
          <div className="header-content">
            <div className="header-title-section">
              <span className="section-icon" style={{ backgroundColor: `${section.color}20` }}>
                {section.icon}
              </span>
              <div>
                <h1 className="resume-section-items-title">{section.displayName}</h1>
                <p className="resume-section-items-subtitle">
                  Resume: <strong>{resumeTitle}</strong>
                </p>
              </div>
            </div>
            <div className="header-actions">
              <Button onClick={handleAdd} variant="primary" size="sm">
                + Add {section.displayName}
              </Button>
              <Button
                onClick={() => navigate(`/admin/resume-sections/${resumeId}`)}
                variant="secondary"
                size="sm"
              >
                ← Back to Sections
              </Button>
            </div>
          </div>
        </header>

        {error && <div className="error-message">{error}</div>}

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">{section.icon}</div>
            <p className="empty-state-message">
              No {section.displayName.toLowerCase()} added yet.
            </p>
            <Button onClick={handleAdd} variant="primary">
              + Add Your First {section.displayName}
            </Button>
          </div>
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-card-header">
                  <div className="item-card-icon" style={{ backgroundColor: `${section.color}20` }}>
                    {section.icon}
                  </div>
                  <div className="item-card-title-section">
                    <h3 className="item-card-title">{getItemDisplayName(item)}</h3>
                    {getItemSubtitle && (
                      <p className="item-card-subtitle">{getItemSubtitle(item)}</p>
                    )}
                  </div>
                </div>

                {renderItemDetails && (
                  <div className="item-card-details">{renderItemDetails(item)}</div>
                )}

                <div className="item-card-actions">
                  <button
                    onClick={() => handleView(item.id)}
                    className="action-button view"
                    disabled={isDeleting}
                    aria-label="View"
                    title="View"
                  >
                    <Eye width={16} height={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="action-button edit"
                    disabled={isDeleting}
                    aria-label="Edit"
                    title="Edit"
                  >
                    <Edit width={16} height={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="action-button delete"
                    disabled={isDeleting}
                    aria-label="Delete"
                    title="Delete"
                  >
                    <Remove />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="items-footer">
          <p className="items-count">
            {items.length} {section.displayName.toLowerCase()}
            {items.length !== 1 ? "" : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumeSectionItemsView;
