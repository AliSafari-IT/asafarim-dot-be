import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '../../stores/portfolioStore';
import './PortfolioDashboard.css';
import type { Project } from '../../types/portfolio.types';

export const PortfolioDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { portfolio, loading, error, fetchMyPortfolio, updateSettings, deleteProject } = usePortfolioStore();
  
  const [isPublic, setIsPublic] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [publicSlug, setPublicSlug] = useState('');

  useEffect(() => {
    fetchMyPortfolio();
  }, [fetchMyPortfolio]);

  useEffect(() => {
    if (portfolio) {
      setIsPublic(portfolio.settings.isPublic);
      setShowContactInfo(portfolio.settings.showContactInfo);
      setPublicSlug(portfolio.settings.publicSlug);
    }
  }, [portfolio]);

  const handleSaveSettings = async () => {
    await updateSettings({
      isPublic,
      showContactInfo,
      publicSlug,
    });
    alert('Settings saved successfully!');
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${projectTitle}"?`)) {
      try {
        await deleteProject(projectId);
        alert('Project deleted successfully!');
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  if (loading && !portfolio) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (error && !portfolio) {
    return (
      <div className="dashboard-error">
        <h2>Error Loading Portfolio</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  const publicUrl = `${window.location.origin}/u/${portfolio.settings.publicSlug}`;

  return (
    <div className="portfolio-dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Portfolio Dashboard</h1>
          <div className="dashboard-header__actions">
            <button 
              onClick={() => navigate('/portfolio')}
              className="btn btn--secondary"
            >
              Preview
            </button>
            {portfolio.settings.isPublic && (
              <a 
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary"
              >
                View Public Page
              </a>
            )}
          </div>
        </header>

        {/* Settings Section */}
        <section className="dashboard-section">
          <h2 className="dashboard-section__title">Portfolio Settings</h2>
          <div className="dashboard-card">
            <div className="form-group">
              <label htmlFor="publicSlug">Public URL Slug</label>
              <div className="input-with-prefix">
                <span className="input-prefix">{window.location.origin}/u/</span>
                <input
                  id="publicSlug"
                  type="text"
                  value={publicSlug}
                  onChange={(e) => setPublicSlug(e.target.value)}
                  placeholder="your-username"
                />
              </div>
              {portfolio.settings.isPublic && (
                <small className="form-hint">
                  Your portfolio is available at: <a href={publicUrl} target="_blank" rel="noopener noreferrer">{publicUrl}</a>
                </small>
              )}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span>Make portfolio public</span>
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showContactInfo}
                  onChange={(e) => setShowContactInfo(e.target.checked)}
                />
                <span>Show contact information</span>
              </label>
            </div>

            <button onClick={handleSaveSettings} className="btn btn--primary">
              Save Settings
            </button>
          </div>
        </section>

        {/* Projects Section */}
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <h2 className="dashboard-section__title">Projects ({portfolio.projects.length})</h2>
            <button className="btn btn--primary">
              + Add Project
            </button>
          </div>

          <div className="dashboard-projects">
            {portfolio.projects.length === 0 ? (
              <div className="empty-state">
                <p>No projects yet. Add your first project to get started!</p>
              </div>
            ) : (
              portfolio.projects
                .sort((a: { displayOrder: number; }, b: { displayOrder: number; }) => a.displayOrder - b.displayOrder)
                .map((project: Project) => (
                  <div key={project.id} className="project-item">
                    <div className="project-item__content">
                      {project.isFeatured && (
                        <span className="project-item__badge">Featured</span>
                      )}
                      <h3 className="project-item__title">{project.title}</h3>
                      <p className="project-item__summary">{project.summary}</p>
                      <div className="project-item__meta">
                        <span>{project.technologies.length} technologies</span>
                        <span>•</span>
                        <span>{project.images.length} images</span>
                      </div>
                    </div>
                    <div className="project-item__actions">
                      <button className="btn btn--small btn--secondary">
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project.id, project.title)}
                        className="btn btn--small btn--danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="dashboard-section">
          <h2 className="dashboard-section__title">Overview</h2>
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-card__value">{portfolio.projects.length}</div>
              <div className="stat-card__label">Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{portfolio.technologies.length}</div>
              <div className="stat-card__label">Technologies</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{portfolio.workExperiences.length}</div>
              <div className="stat-card__label">Work Experiences</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{portfolio.publications.length}</div>
              <div className="stat-card__label">Publications</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
