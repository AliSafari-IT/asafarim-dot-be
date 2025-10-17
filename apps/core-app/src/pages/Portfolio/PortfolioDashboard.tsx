import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '../../stores/portfolioStore';
import { AnalyticsWidget } from '../../components/Portfolio/AnalyticsWidget/AnalyticsWidget';
import { ActivityTimeline } from '../../components/Portfolio/ActivityTimeline/ActivityTimeline';
import { ResumeLinkingModal } from '../../components/Portfolio/ResumeLinkingModal/ResumeLinkingModal';
import './PortfolioDashboard.css';
import type { Project, ProjectResumeLink } from '../../types/portfolio.types';

export const PortfolioDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    portfolio, 
    loading, 
    error, 
    fetchMyPortfolio, 
    updateSettings, 
    deleteProject,
    insights,
    insightsLoading,
    activityLogs,
    activityLoading,
    availableResumes,
    linkedProjects,
    linkProjectToResumes,
    fetchProjectResumeLinks,
    fetchInsights,
    fetchActivityLogs,
    fetchUserResumes
  } = usePortfolioStore();
  
  const [isPublic, setIsPublic] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [publicSlug, setPublicSlug] = useState('');
  const [linkingModalOpen, setLinkingModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchMyPortfolio();
    fetchInsights().catch(err => console.error('Failed to fetch insights:', err));
    fetchActivityLogs(10).catch(err => console.error('Failed to fetch activity logs:', err));

    // Handle resume fetching gracefully if API not available
    fetchUserResumes().catch(err => {
      console.error('Failed to fetch user resumes:', err);
    });
  }, [fetchMyPortfolio, fetchInsights, fetchActivityLogs, fetchUserResumes]);

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        isPublic,
        showContactInfo,
        publicSlug,
      });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleOpenLinkingModal = async (project: Project) => {
    setSelectedProject(project);
    try {
      await fetchProjectResumeLinks(project.id);
    } catch (err) {
      console.error('Failed to fetch resume links:', err);
      // Continue anyway - modal can still open
    }
    setLinkingModalOpen(true);
  };

  const handleSaveResumeLinks = async (links: ProjectResumeLink[]) => {
    if (!selectedProject) return;

    const workExperienceIds = links
      .filter(link => link.workExperienceId)
      .map(link => link.workExperienceId!);

    try {
      await linkProjectToResumes(selectedProject.id, workExperienceIds);
      await fetchInsights(); // Refresh analytics
    } catch (err) {
      console.error('Failed to link resumes:', err);
      alert('Failed to link resumes. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${projectTitle}"?`)) {
      try {
        await deleteProject(projectId);
        alert('Project deleted successfully!');
      } catch (err) {
        console.error('Failed to delete project:', err);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleInitializePortfolio = async () => {
    try {
      // Initialize portfolio with default settings
      await updateSettings({
        isPublic: false,
        showContactInfo: true,
        publicSlug: '', // User can set this later
      });
      // Refresh portfolio data
      await fetchMyPortfolio();
    } catch (err) {
      console.error('Failed to initialize portfolio:', err);
      alert('Failed to initialize portfolio. Please try again.');
      // Still navigate to portfolio preview even if initialization fails
      navigate('/portfolio');
    }
  };

  if (loading && !portfolio) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (error && !portfolio) {
    const isAuthError = error.includes('Authentication required') || 
                        error.includes('401') || 
                        error.includes('text/html');
    
    return (
      <div style={{
        maxWidth: '700px',
        margin: '80px auto',
        padding: '40px',
        textAlign: 'center',
        background: 'var(--color-surface, #ffffff)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>
          {isAuthError ? '🔒' : '⚠️'}
        </div>
        
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          marginBottom: '16px',
          color: 'var(--color-text-primary, #1f2937)'
        }}>
          {isAuthError ? 'Authentication Required' : 'Unable to Load Dashboard'}
        </h1>
        
        <p style={{
          color: 'var(--color-text-secondary, #6b7280)',
          marginBottom: '32px',
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          {isAuthError 
            ? 'Please sign in to access your portfolio dashboard.'
            : 'We encountered an issue loading your portfolio dashboard. Please try again or contact support if the problem persists.'}
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {isAuthError ? (
            <>
              <button
                onClick={() => window.location.href = '/login?redirect=/dashboard/portfolio'}
                style={{
                  padding: '12px 24px',
                  background: 'var(--color-primary, #3b82f6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '12px 24px',
                  background: 'var(--color-surface, #f9fafb)',
                  color: 'var(--color-text-primary, #1f2937)',
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                Go to Home
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  background: 'var(--color-primary, #3b82f6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/portfolio')}
                style={{
                  padding: '12px 24px',
                  background: 'var(--color-surface, #f9fafb)',
                  color: 'var(--color-text-primary, #1f2937)',
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                View Portfolio
              </button>
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '12px 24px',
                  background: 'var(--color-surface, #f9fafb)',
                  color: 'var(--color-text-primary, #1f2937)',
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                Go to Home
              </button>
            </>
          )}
        </div>

        {/* Technical error details (collapsible) */}
        <details style={{
          marginTop: '32px',
          textAlign: 'left',
          padding: '16px',
          background: 'var(--color-surface, #f9fafb)',
          borderRadius: '8px'
        }}>
          <summary style={{
            cursor: 'pointer',
            fontWeight: 600,
            color: 'var(--color-text-secondary, #6b7280)',
            fontSize: '14px'
          }}>
            Technical Details
          </summary>
          <pre style={{
            marginTop: '12px',
            padding: '12px',
            background: '#1f2937',
            color: '#f9fafb',
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {error}
          </pre>
        </details>
      </div>
    );
  }

  if (!portfolio || !portfolio.settings) {
    return (
      <div className="portfolio-dashboard">
        <div className="dashboard-container">
          <div style={{
            maxWidth: '600px',
            margin: '100px auto',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px',
            }}>
              🚀
            </div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              marginBottom: '16px',
              color: 'var(--color-text-primary, #1f2937)',
            }}>
              Welcome to Your Portfolio
            </h1>
            <p style={{
              color: 'var(--color-text-secondary, #6b7280)',
              marginBottom: '32px',
              fontSize: '18px',
              lineHeight: '1.6',
            }}>
              Create a stunning portfolio to showcase your projects, work experience, and achievements.
              Share your professional story with potential employers and collaborators.
            </p>

            <div style={{
              background: 'var(--color-surface, #f9fafb)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              textAlign: 'left',
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '16px',
                color: 'var(--color-text-primary, #1f2937)',
              }}>
                What you'll get:
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '16px',
                }}>
                  <span style={{
                    color: 'var(--color-primary, #3b82f6)',
                    marginRight: '12px',
                    fontSize: '20px',
                  }}>✓</span>
                  Beautiful, responsive design
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '16px',
                }}>
                  <span style={{
                    color: 'var(--color-primary, #3b82f6)',
                    marginRight: '12px',
                    fontSize: '20px',
                  }}>✓</span>
                  Project showcase with images and links
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '16px',
                }}>
                  <span style={{
                    color: 'var(--color-primary, #3b82f6)',
                    marginRight: '12px',
                    fontSize: '20px',
                  }}>✓</span>
                  Work experience timeline
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '16px',
                }}>
                  <span style={{
                    color: 'var(--color-primary, #3b82f6)',
                    marginRight: '12px',
                    fontSize: '20px',
                  }}>✓</span>
                  Publications and research
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '16px',
                }}>
                  <span style={{
                    color: 'var(--color-primary, #3b82f6)',
                    marginRight: '12px',
                    fontSize: '20px',
                  }}>✓</span>
                  Shareable public URL
                </li>
              </ul>
            </div>

            <button
              onClick={handleInitializePortfolio}
              style={{
                padding: '16px 32px',
                background: 'var(--color-primary, #3b82f6)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 600,
                marginRight: '16px',
              }}
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/portfolio')}
              style={{
                padding: '16px 32px',
                background: 'var(--color-surface, #f9fafb)',
                color: 'var(--color-text-primary, #1f2937)',
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              Preview First
            </button>
          </div>
        </div>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/u/${portfolio.settings?.publicSlug || 'your-username'}`;

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
            {portfolio.settings?.isPublic && (
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
              {portfolio.settings?.isPublic && (
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
                      <button 
                        onClick={() => handleOpenLinkingModal(project)}
                        className="btn btn--small btn--secondary"
                      >
                        🔗 Link to Resume
                      </button>
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

        {/* Analytics Widget - only show if available */}
        {insights && (
          <section className="dashboard-section">
            <AnalyticsWidget insights={insights} loading={insightsLoading} />
          </section>
        )}

        {/* Activity Timeline - only show if available */}
        {activityLogs && activityLogs.length > 0 && (
          <section className="dashboard-section">
            <ActivityTimeline
              activities={activityLogs}
              loading={activityLoading}
              limit={10}
            />
          </section>
        )}

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

      {/* Resume Linking Modal */}
      {selectedProject && (
        <ResumeLinkingModal
          isOpen={linkingModalOpen}
          onClose={() => setLinkingModalOpen(false)}
          onSave={handleSaveResumeLinks}
          project={selectedProject}
          currentLinks={linkedProjects.filter(link => link.projectId === selectedProject.id)}
          availableResumes={availableResumes}
        />
      )}
    </div>
  );
};
