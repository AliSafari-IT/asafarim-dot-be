import { ButtonComponent, useAuth, isProduction } from "@asafarim/shared-ui-react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => {
    const identityLoginUrl = isProduction
      ? 'https://identity.asafarim.be/login'
      : 'http://identity.asafarim.local:5177/login';
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `${identityLoginUrl}?returnUrl=${returnUrl}`;
  };

  const handleRegister = () => {
    const identityRegisterUrl = isProduction
      ? 'https://identity.asafarim.be/register'
      : 'http://identity.asafarim.local:5177/register';
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `${identityRegisterUrl}?returnUrl=${returnUrl}`;
  };

  if (loading) {
    return <div className="homepage-loading">Loading...</div>;
  }

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Task Management Made Simple</h1>
          <p className="hero-subtitle">
            Organize, collaborate, and track your projects with ease
          </p>
          <div className="hero-cta">
            {isAuthenticated ? (
              <>
                <ButtonComponent
                  variant="primary"
                  onClick={() => navigate("/projects")}
                >
                  View Projects
                </ButtonComponent>
                <ButtonComponent
                  variant="secondary"
                  onClick={() => navigate("/projects/new")}
                >
                  Create New Project
                </ButtonComponent>
              </>
            ) : (
              <>
                <ButtonComponent
                  variant="primary"
                  onClick={handleSignIn}
                >
                  Sign In
                </ButtonComponent>
                <ButtonComponent
                  variant="secondary"
                  onClick={handleRegister}
                >
                  Create Account
                </ButtonComponent>
                <ButtonComponent
                  variant="info"
                  onClick={() => navigate("/projects")}
                >
                  View Public Projects
                </ButtonComponent>
              </>
            )}
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-icon">📋</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Powerful Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">✓</div>
            <h3>Project Management</h3>
            <p>
              Create and manage multiple projects with full control over privacy
              and team access
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Task Tracking</h3>
            <p>
              Organize tasks by status, priority, and due date. Never miss a
              deadline
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Team Collaboration</h3>
            <p>
              Invite team members, assign roles, and work together seamlessly
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Comments & Updates</h3>
            <p>
              Add comments to tasks and stay updated with real-time
              notifications
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📎</div>
            <h3>Attachments</h3>
            <p>
              Attach files and documents directly to tasks for easy reference
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Control project visibility with public and private options</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create a Project</h3>
            <p>Start by creating a new project and setting its privacy level</p>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <h3>Add Tasks</h3>
            <p>
              Break down your project into manageable tasks with priorities and
              deadlines
            </p>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <h3>Invite Team Members</h3>
            <p>
              Add team members with different roles (Admin, Manager, Member)
            </p>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <h3>Collaborate & Track</h3>
            <p>Work together, add comments, and track progress in real-time</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="cta-section">
          <h2>Ready to Get Started?</h2>
          <p>
            Join thousands of teams using Task Management to organize their work
          </p>
          <div className="cta-buttons">
            <ButtonComponent
              variant="primary"
              size="lg"
              onClick={handleRegister}
            >
              Create Free Account
            </ButtonComponent>
            <ButtonComponent
              variant="secondary"
              size="lg"
              onClick={handleSignIn}
            >
              Sign In
            </ButtonComponent>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="homepage-footer">
        <p>&copy; 2025 Task Management. All rights reserved.</p>
      </footer>
    </div>
  );
}
