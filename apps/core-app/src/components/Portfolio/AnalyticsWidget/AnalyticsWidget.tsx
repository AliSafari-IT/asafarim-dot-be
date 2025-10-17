import React from 'react';
import type { AnalyticsWidgetProps } from '../../../types/portfolio.types';
import './AnalyticsWidget.css';

export const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({ insights, loading = false }) => {
  if (loading) {
    return (
      <div className="analytics-widget">
        <div className="analytics-widget-header">
          <h3 className="analytics-widget-title">Portfolio Analytics</h3>
        </div>
        <div className="analytics-widget-loading">
          <div className="analytics-widget-skeleton"></div>
          <div className="analytics-widget-skeleton"></div>
          <div className="analytics-widget-skeleton"></div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="analytics-widget">
        <div className="analytics-widget-header">
          <h3 className="analytics-widget-title">Portfolio Analytics</h3>
        </div>
        <div className="analytics-widget-empty">
          No analytics data available
        </div>
      </div>
    );
  }

  const linkingPercentage = insights.linkingRate * 100;
  const getLinkingStatus = () => {
    if (linkingPercentage >= 80) return { label: 'Excellent', color: '#10b981' };
    if (linkingPercentage >= 60) return { label: 'Good', color: '#3b82f6' };
    if (linkingPercentage >= 40) return { label: 'Fair', color: '#f59e0b' };
    return { label: 'Needs Attention', color: '#ef4444' };
  };

  const linkingStatus = getLinkingStatus();

  return (
    <div className="analytics-widget">
      <div className="analytics-widget-header">
        <h3 className="analytics-widget-title">Portfolio Analytics</h3>
        <span className="analytics-widget-updated">
          Updated {new Date(insights.lastUpdated).toLocaleDateString()}
        </span>
      </div>

      <div className="analytics-widget-grid">
        {/* Total Projects */}
        <div className="analytics-widget-card">
          <div className="analytics-widget-card-icon" style={{ background: '#dbeafe' }}>
            📊
          </div>
          <div className="analytics-widget-card-content">
            <div className="analytics-widget-card-value">{insights.totalProjects}</div>
            <div className="analytics-widget-card-label">Total Projects</div>
          </div>
        </div>

        {/* Linked Projects */}
        <div className="analytics-widget-card">
          <div className="analytics-widget-card-icon" style={{ background: '#d1fae5' }}>
            🔗
          </div>
          <div className="analytics-widget-card-content">
            <div className="analytics-widget-card-value">{insights.linkedToResumes}</div>
            <div className="analytics-widget-card-label">Linked to Resumes</div>
          </div>
        </div>

        {/* Unlinked Projects */}
        <div className="analytics-widget-card">
          <div className="analytics-widget-card-icon" style={{ background: '#fee2e2' }}>
            ⚠️
          </div>
          <div className="analytics-widget-card-content">
            <div className="analytics-widget-card-value">{insights.unlinked}</div>
            <div className="analytics-widget-card-label">Unlinked Projects</div>
          </div>
        </div>

        {/* Publications */}
        <div className="analytics-widget-card">
          <div className="analytics-widget-card-icon" style={{ background: '#fef3c7' }}>
            📄
          </div>
          <div className="analytics-widget-card-content">
            <div className="analytics-widget-card-value">{insights.totalPublications}</div>
            <div className="analytics-widget-card-label">Publications</div>
          </div>
        </div>

        {/* Technologies */}
        <div className="analytics-widget-card">
          <div className="analytics-widget-card-icon" style={{ background: '#e0e7ff' }}>
            💻
          </div>
          <div className="analytics-widget-card-content">
            <div className="analytics-widget-card-value">{insights.totalTechnologies}</div>
            <div className="analytics-widget-card-label">Technologies</div>
          </div>
        </div>

        {/* Linking Rate */}
        <div className="analytics-widget-card analytics-widget-card-featured">
          <div className="analytics-widget-card-content">
            <div className="analytics-widget-linking-rate">
              <div className="analytics-widget-linking-rate-value">
                {linkingPercentage.toFixed(0)}%
              </div>
              <div className="analytics-widget-linking-rate-label">
                Linking Rate
              </div>
              <div 
                className="analytics-widget-linking-rate-status"
                style={{ color: linkingStatus.color }}
              >
                {linkingStatus.label}
              </div>
            </div>
            <div className="analytics-widget-linking-rate-bar">
              <div 
                className="analytics-widget-linking-rate-fill"
                style={{ 
                  width: `${linkingPercentage}%`,
                  background: linkingStatus.color
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Most Used Technologies */}
      {insights.mostUsedTechnologies && insights.mostUsedTechnologies.length > 0 && (
        <div className="analytics-widget-section">
          <h4 className="analytics-widget-section-title">Most Used Technologies</h4>
          <div className="analytics-widget-tech-list">
            {insights.mostUsedTechnologies.slice(0, 5).map((tech, index) => (
              <div key={tech.technologyId} className="analytics-widget-tech-item">
                <div className="analytics-widget-tech-rank">#{index + 1}</div>
                <div className="analytics-widget-tech-info">
                  <div className="analytics-widget-tech-name">{tech.technologyName}</div>
                  <div className="analytics-widget-tech-category">{tech.category}</div>
                </div>
                <div className="analytics-widget-tech-count">
                  <span className="analytics-widget-tech-count-value">{tech.count}</span>
                  <span className="analytics-widget-tech-count-label">projects</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {insights.unlinked > 0 && (
        <div className="analytics-widget-alert">
          <div className="analytics-widget-alert-icon">💡</div>
          <div className="analytics-widget-alert-content">
            <div className="analytics-widget-alert-title">Improve Your Portfolio</div>
            <div className="analytics-widget-alert-message">
              You have {insights.unlinked} unlinked project{insights.unlinked !== 1 ? 's' : ''}. 
              Link them to resumes to improve discoverability and organization.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
