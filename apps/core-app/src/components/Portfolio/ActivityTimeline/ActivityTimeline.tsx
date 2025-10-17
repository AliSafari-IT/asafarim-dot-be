import React from 'react';
import type { ActivityTimelineProps, ActivityAction } from '../../../types/portfolio.types';
import './ActivityTimeline.css';

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ 
  activities, 
  loading = false,
  limit = 10
}) => {
  const getActionIcon = (action: ActivityAction): string => {
    const icons: Record<ActivityAction, string> = {
      created: '✨',
      updated: '✏️',
      deleted: '🗑️',
      linked: '🔗',
      unlinked: '⛓️‍💥',
      published: '🚀',
      unpublished: '📦'
    };
    return icons[action] || '📝';
  };

  const getActionColor = (action: ActivityAction): string => {
    const colors: Record<ActivityAction, string> = {
      created: '#10b981',
      updated: '#3b82f6',
      deleted: '#ef4444',
      linked: '#8b5cf6',
      unlinked: '#f59e0b',
      published: '#06b6d4',
      unpublished: '#6b7280'
    };
    return colors[action] || '#6b7280';
  };

  const getActionLabel = (action: ActivityAction): string => {
    const labels: Record<ActivityAction, string> = {
      created: 'Created',
      updated: 'Updated',
      deleted: 'Deleted',
      linked: 'Linked',
      unlinked: 'Unlinked',
      published: 'Published',
      unpublished: 'Unpublished'
    };
    return labels[action] || action;
  };

  const getEntityTypeIcon = (entityType: string): string => {
    const icons: Record<string, string> = {
      project: '📊',
      publication: '📄',
      resume: '📝',
      link: '🔗'
    };
    return icons[entityType] || '📌';
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return then.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="activity-timeline">
        <div className="activity-timeline-header">
          <h3 className="activity-timeline-title">Recent Activity</h3>
        </div>
        <div className="activity-timeline-loading">
          {[1, 2, 3].map(i => (
            <div key={i} className="activity-timeline-skeleton"></div>
          ))}
        </div>
      </div>
    );
  }

  const displayedActivities = activities.slice(0, limit);

  return (
    <div className="activity-timeline">
      <div className="activity-timeline-header">
        <h3 className="activity-timeline-title">Recent Activity</h3>
        {activities.length > 0 && (
          <span className="activity-timeline-count">
            {activities.length} event{activities.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {displayedActivities.length === 0 ? (
        <div className="activity-timeline-empty">
          <div className="activity-timeline-empty-icon">📭</div>
          <div className="activity-timeline-empty-text">No recent activity</div>
          <div className="activity-timeline-empty-subtext">
            Your portfolio actions will appear here
          </div>
        </div>
      ) : (
        <div className="activity-timeline-list">
          {displayedActivities.map((activity, index) => (
            <div key={activity.id} className="activity-timeline-item">
              <div className="activity-timeline-item-line">
                {index < displayedActivities.length - 1 && (
                  <div className="activity-timeline-item-connector"></div>
                )}
              </div>
              
              <div 
                className="activity-timeline-item-icon"
                style={{ background: getActionColor(activity.action) }}
              >
                {getActionIcon(activity.action)}
              </div>

              <div className="activity-timeline-item-content">
                <div className="activity-timeline-item-header">
                  <div className="activity-timeline-item-action">
                    <span 
                      className="activity-timeline-item-action-badge"
                      style={{ 
                        background: `${getActionColor(activity.action)}20`,
                        color: getActionColor(activity.action)
                      }}
                    >
                      {getActionLabel(activity.action)}
                    </span>
                    <span className="activity-timeline-item-entity-type">
                      {getEntityTypeIcon(activity.entityType)} {activity.entityType}
                    </span>
                  </div>
                  <div className="activity-timeline-item-time">
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>

                <div className="activity-timeline-item-name">
                  {activity.entityName}
                </div>

                {activity.details && (
                  <div className="activity-timeline-item-details">
                    {activity.details}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activities.length > limit && (
        <div className="activity-timeline-footer">
          <button className="activity-timeline-show-more">
            View all {activities.length} activities →
          </button>
        </div>
      )}
    </div>
  );
};
