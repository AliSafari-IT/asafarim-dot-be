import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPublications, deletePublication } from "../../../services/publicationService";
import { Button, Info, type ContentCardProps, useAuth } from "@asafarim/shared-ui-react";
import "./pub-styles.css";

const ManagePublications: React.FC = () => {
  const navigate = useNavigate();
  const [publications, setPublications] = useState<ContentCardProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  // Check if user is admin based on roles in the user object
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const isAdmin = user?.roles?.map((role: string) => role.toLowerCase()).includes('admin') || false;

  // Only redirect if not authenticated after loading is complete
  useEffect(() => {
    // Only check authentication after the loading state is complete
    if (!authLoading && !isAuthenticated) {
      console.log("Authentication check complete, not authenticated. Redirecting to login.");
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(window.location.href)}`;
    }
  }, [authLoading, isAuthenticated]);

  // Load publications based on user role
  useEffect(() => {
    const loadPublications = async () => {
      try {
        setLoading(true);
        console.log("Fetching publications, isAdmin:", isAdmin);
        // For non-admin users, always fetch only their own publications
        // For admin users, fetch all publications if isAdmin is true, otherwise fetch only their own
        const data = await fetchPublications(undefined, undefined, !isAdmin);
        console.log("Publications fetched:", data.length);
        setPublications(data);
        setError(null);
      } catch (err) {
        setError('Failed to load publications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadPublications();
    }
  }, [isAuthenticated, isAdmin]);

  // Handle delete publication
  const handleDelete = async (id: number | string, publicationUserId?: string) => {
    // Check if user has permission to delete (admin or owner)
    const canDelete = isAdmin || (user?.id === publicationUserId);
    
    if (!canDelete) {
      setError('You do not have permission to delete this publication');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this publication?')) {
      setIsDeleting(true);
      try {
        const success = await deletePublication(id as number);
        if (success) {
          // Remove from state
          setPublications(publications.filter(pub => pub.id !== id));
        } else {
          setError('Failed to delete publication');
        }
      } catch (err) {
        setError('An error occurred while deleting the publication');
        console.error(err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Handle edit publication
  const handleEdit = (id: number, publicationUserId?: string) => {
    // Check if user has permission to edit (admin or owner)
    const canEdit = isAdmin || (user?.id === publicationUserId);
    
    if (!canEdit) {
      setError('You do not have permission to edit this publication');
      return;
    }
    
    navigate(`/portfolio/publications/edit/${id}`);
  };

  if (!isAuthenticated) {
    return <div className="manage-publications">Redirecting to login...</div>;
  }

  if (loading) {
    return (
      <div className="manage-publications">
        <div className="manage-publications-container">
          <h1 className="manage-publications-title">Manage Your Publications</h1>
          <div className="loading-spinner"></div>
          <p>Loading your publications...</p>
        </div>
      </div>
    );
  }

  const handleView = (id: number, userId: string): void => {
    navigate(`/portfolio/${userId}/publications/view/${id}`);
  };

  return (
    <div className="manage-publications">
      <div className="manage-publications-container">
        <div className="manage-header">
          <h1 className="manage-publications-title">
            {isAdmin ? 'Manage All Publications' : 'Manage Your Publications'}
          </h1>
          <button 
            onClick={() => navigate('/portfolio/publications/new')}
            className="form-button form-button-primary"
          >
            Add New Publication
          </button>
        </div>

        {error && (
          <div className="new-publication-error">
            {error}
          </div>
        )}

        {publications.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-message">You haven't created any publications yet.</p>
            <button 
              onClick={() => navigate('/portfolio/publications/new')}
              className="form-button form-button-primary"
            >
              Create Your First Publication
            </button>
          </div>
        ) : (
          <div className="publications-table-wrapper">
          <table className="publications-table">
            <thead>
              <tr>
                <th className="table-header">Title</th>
                <th className="table-header">Type</th>
                <th className="table-header">Year</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {publications.map((pub, index) => (
                <tr key={pub.id || index}>
                  <td className="table-cell">
                    <div className="table-cell-content">
                      <div className="table-icon">
                        <Info />
                      </div>
                      <div className="table-text">
                        <div className="table-title">{pub.title}</div>
                        <div className="table-subtitle">{pub.variant}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="table-text">{pub.type}</div>
                  </td>
                  <td className="table-cell">
                    <div className="table-text">{pub.year}</div>
                  </td>
                  <td className="table-cell">
                    <div className="table-actions">
                      <button
                        onClick={() => handleView(pub.id as unknown as number, pub.userId as unknown as string)}
                        className="action-button view"
                        disabled={isDeleting}
                        aria-label="View publication"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(pub.id as unknown as number, pub.userId as string)}
                        className="action-button edit"
                        disabled={isDeleting || (!isAdmin && user?.id !== pub.userId)}
                        aria-label="Edit publication"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(pub.id as unknown as number, pub.userId as string)}
                        className="action-button delete"
                        disabled={isDeleting || (!isAdmin && user?.id !== pub.userId)}
                        aria-label="Delete publication"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="back-button-wrapper">
        <Button
          onClick={() => navigate("/portfolio/publications")}
          variant="link"
        >
          Back to Publications
        </Button>
      </div>
    </div>
  </div>
  );
};

export default ManagePublications;
