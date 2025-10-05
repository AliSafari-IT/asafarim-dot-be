import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, useAuth } from '@asafarim/shared-ui-react';
import { fetchResumes, deleteResume, type ResumeDto } from '../../../services/resumeApi';
import './resume-styles.css';

const ResumeList: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const isAdmin = user?.roles?.map((role: string) => role.toLowerCase()).includes('admin') || false;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(
        window.location.href
      )}`;
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadResumes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin]);

  const loadResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchResumes(!isAdmin);
      setResumes(data);
    } catch (err) {
      console.error('Failed to load resumes:', err);
      setError('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resume? This will delete all associated data.')) {
      return;
    }

    try {
      await deleteResume(id);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete resume:', err);
      setError('Failed to delete resume');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="resume-list">
        <div className="resume-container">
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="resume-list">
        <div className="resume-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading resumes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="resume-list">
      <div className="resume-container">
        <header className="resume-header">
          <div className="header-content">
            <div>
              <h1 className="resume-title">📄 Resume Management</h1>
              <p className="resume-subtitle">
                {isAdmin ? 'Manage all resumes in the system' : 'Manage your resume profiles'}
              </p>
            </div>
            <div className="header-actions">
              <Button onClick={() => navigate('/admin/entities')} variant="secondary">
                ← Back to Entities
              </Button>
              <Button onClick={() => navigate('/admin/entities/resumes/new')} variant="primary">
                + Create Resume
              </Button>
            </div>
          </div>
        </header>

        {error && <div className="error-message">{error}</div>}

        {resumes.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-message">No resumes found. Create your first resume to get started!</p>
            <Button onClick={() => navigate('/admin/entities/resumes/new')}>Create Resume</Button>
          </div>
        ) : (
          <div className="resume-grid">
            {resumes.map((resume) => (
              <div key={resume.id} className="resume-card">
                <div className="resume-card-header">
                  <h3 className="resume-card-title">{resume.title}</h3>
                  {isAdmin && (
                    <span className="resume-user-badge">User: {resume.userId.substring(0, 8)}...</span>
                  )}
                </div>
                
                <p className="resume-card-summary">
                  {resume.summary || 'No summary provided'}
                </p>

                {resume.contact && (
                  <div className="resume-card-contact">
                    <span>📧 {resume.contact.email}</span>
                    {resume.contact.phone && <span>📱 {resume.contact.phone}</span>}
                  </div>
                )}

                <div className="resume-card-meta">
                  <span className="resume-date">Updated: {formatDate(resume.updatedAt)}</span>
                </div>

                <div className="resume-card-actions">
                  <button
                    onClick={() => navigate(`/admin/entities/resumes/${resume.id}/resume`)}
                    className="action-button view"
                  >
                    👁️ View Details
                  </button>
                  <button
                    onClick={() => navigate(`/admin/entities/resumes/${resume.id}/edit`)}
                    className="action-button edit"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="action-button delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeList;
