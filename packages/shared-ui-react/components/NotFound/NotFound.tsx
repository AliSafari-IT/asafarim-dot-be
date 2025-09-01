/* Awesome 404 Not Found Component */
import React from 'react';
import './NotFound.css';

export default function NotFound() {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        {/* Animated 404 Number */}
        <div className="error-code">
          <span className="digit">4</span>
          <span className="digit">0</span>
          <span className="digit">4</span>
        </div>

        {/* Main Message */}
        <div className="error-message">
          <h1 className="error-title">Oops! Page Not Found</h1>
          <p className="error-description">
            The page you're looking for seems to have wandered off into the digital wilderness.
            Don't worry, even the best explorers get lost sometimes!
          </p>
        </div>

        {/* Animated Illustration */}
        <div className="error-illustration">
          <div className="astronaut">
            <div className="astronaut-helmet">👨‍🚀</div>
            <div className="astronaut-body">🚀</div>
          </div>
          <div className="floating-elements">
            <div className="floating-element">🌍</div>
            <div className="floating-element">⭐</div>
            <div className="floating-element">🚀</div>
            <div className="floating-element">🛸</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="error-actions">
          <button 
            className="action-btn primary-btn" 
            onClick={handleGoHome}
          >
            <span className="btn-icon">🏠</span>
            <span className="btn-text">Go Home</span>
          </button>
          
          <button 
            className="action-btn secondary-btn" 
            onClick={handleGoBack}
          >
            <span className="btn-icon">⬅️</span>
            <span className="btn-text">Go Back</span>
          </button>
        </div>

        {/* Helpful Links */}
        <div className="helpful-links">
          <p className="links-title">Or try one of these:</p>
          <div className="links-grid">
            <a href="/jobs" className="helpful-link">
              <span className="link-icon">💼</span>
              <span className="link-text">Job Tracker</span>
            </a>
            <a href="/about" className="helpful-link">
              <span className="link-icon">ℹ️</span>
              <span className="link-text">About</span>
            </a>
            <a href="/contact" className="helpful-link">
              <span className="link-icon">📧</span>
              <span className="link-text">Contact</span>
            </a>
          </div>
        </div>

        {/* Fun Fact */}
        <div className="fun-fact">
          <div className="fact-icon">💡</div>
          <p className="fact-text">
            Did you know? The first 404 error was created in 1990 by Tim Berners-Lee 
            while working at CERN. It's been helping lost web surfers ever since!
          </p>
        </div>
      </div>
    </div>
  );
}