import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPublications, deletePublication } from "../../../services/publicationService";
import type { ContentCardProps } from "@asafarim/shared-ui-react";
import "./pub-styles.css";

const ManagePublications: React.FC = () => {
  const navigate = useNavigate();
  const [publications, setPublications] = useState<ContentCardProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Check if user is logged in
  useEffect(() => {
    const token = document.cookie.includes('atk=') || localStorage.getItem('auth_token');
    setIsLoggedIn(!!token);
    
    if (!token) {
      // Redirect to the identity subdomain login page
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(window.location.href)}`;
    }
  }, []);

  // Load user's publications
  useEffect(() => {
    const loadPublications = async () => {
      try {
        setLoading(true);
        // Fetch all publications owned by the current user
        const data = await fetchPublications(undefined, undefined, true);
        setPublications(data);
        setError(null);
      } catch (err) {
        setError('Failed to load your publications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      loadPublications();
    }
  }, [isLoggedIn]);

  // Handle delete publication
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this publication?')) {
      setIsDeleting(true);
      try {
        const success = await deletePublication(id);
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
  const handleEdit = (id: number) => {
    navigate(`/portfolio/publications/edit/${id}`);
  };

  if (!isLoggedIn) {
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

  return (
    <div className="manage-publications">
      <div className="manage-publications-container">
        <div className="manage-header">
          <h1 className="manage-publications-title">Manage Your Publications</h1>
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
                        <svg
                          className="icon"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 012 0v6a1 1 0 11-2 0V9zm4-2.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                            clipRule="evenodd"
                          />
                        </svg>
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
                        onClick={() => handleEdit(pub.id as number)}
                        className="action-button edit"
                        disabled={isDeleting}
                        aria-label="Edit publication"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(pub.id as number)}
                        className="action-button delete"
                        disabled={isDeleting}
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
        <button
          onClick={() => navigate("/portfolio/publications")}
          className="action-button"
        >
          Back to Publications
        </button>
      </div>
    </div>
  </div>
  );
};

export default ManagePublications;
