import { useState, useEffect } from 'react';
import { fetchTimelineAnalytics, fetchJobSearchInsights } from '../../api/timelineService';
import { fetchJobApplications } from '../../api/jobService';
import type { TimelineAnalytics, JobSearchInsights } from '../../types/timelineTypes';
import type { JobApplication } from '../../types/jobTypes';
import FilterPanel, { type FilterCriteria } from './FilterPanel';
import FilteredAnalytics from './FilteredAnalytics';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<TimelineAnalytics | null>(null);
  const [insights, setInsights] = useState<JobSearchInsights[]>([]);
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterCriteria>({ status: 'All', city: '', company: '' });

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [analyticsData, insightsData, jobsData] = await Promise.all([
          fetchTimelineAnalytics(),
          fetchJobSearchInsights(),
          fetchJobApplications()
        ]);
        
        setAnalytics(analyticsData);
        setInsights(insightsData);
        setJobs(jobsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics';
        setError(errorMessage);
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard">
        <div className="error">Error loading analytics: {error}</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-dashboard">
        <div className="error">No analytics data available</div>
      </div>
    );
  }

  const cities = Array.from(new Set(jobs.map(j => j.city).filter(Boolean))) as string[];
  const companies = Array.from(new Set(jobs.map(j => j.company)));

  return (
    <div className="analytics-dashboard">
      <h2>Job Search Analytics Dashboard</h2>
      
      {/* Filter Panel */}
      {jobs.length > 0 && (
        <FilterPanel 
          onFilterChange={setFilters}
          cities={cities}
          companies={companies}
        />
      )}

      {/* Filtered Analytics */}
      {jobs.length > 0 && (
        <FilteredAnalytics jobs={jobs} filters={filters} />
      )}
      
      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{analytics.totalApplications}</div>
          <div className="metric-label">Total Applications</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">{analytics.successRate}%</div>
          <div className="metric-label">Success Rate</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">{analytics.averageTimeToOffer} days</div>
          <div className="metric-label">Avg Time to Offer</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{analytics.milestoneCompletionRate || 0}%</div>
          <div className="metric-label">Milestone Completion</div>
        </div>
      </div>

      {/* Timeline Statistics */}
      <div className="stats-section">
        <h3>Timeline Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total Milestones:</span>
            <span className="stat-value">{analytics.totalMilestones}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed Milestones:</span>
            <span className="stat-value">{analytics.completedMilestones}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Interview Success Rate:</span>
            <span className="stat-value">{analytics.interviewSuccessRate}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Response Time:</span>
            <span className="stat-value">{analytics.averageResponseTime} days</span>
          </div>
        </div>
      </div>

      {/* Most Responsive Companies */}
      {analytics.mostResponsiveCompanies.length > 0 && (
        <div className="companies-section">
          <h3>Most Responsive Companies</h3>
          <div className="companies-list">
            {analytics.mostResponsiveCompanies.map((company, index) => (
              <div key={index} className="company-item">
                <span className="company-rank">#{index + 1}</span>
                <span className="company-name">{company}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Cities */}
      {analytics.topCities && analytics.topCities.length > 0 && (
        <div className="cities-section">
          <h3>Top Cities Applied</h3>
          <div className="cities-list">
            {analytics.topCities.map((cityData, index) => (
              <div key={index} className="city-item">
                <span className="city-rank">#{index + 1}</span>
                <span className="city-name">{cityData.city}</span>
                <span className="city-count">{cityData.applicationCount} {cityData.applicationCount === 1 ? 'application' : 'applications'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Search Insights */}
      {insights.length > 0 && (
        <div className="insights-section">
          <h3>Job Search Insights</h3>
          <div className="insights-list">
            {insights.slice(0, 5).map((insight) => (
              <div key={insight.jobApplicationId} className="insight-card">
                <div className="insight-header">
                  <h4>{insight.company}</h4>
                  <span className="insight-status">{insight.status}</span>
                </div>
                <div className="insight-details">
                  <p className="insight-role">{insight.role}</p>
                  <div className="insight-metrics">
                    <span className="metric">
                      <strong>{insight.daysSinceApplication}</strong> days ago
                    </span>
                    <span className="metric">
                      <strong>{insight.progressPercentage}%</strong> complete
                    </span>
                    <span className="metric">
                      <strong>{insight.milestonesCount}</strong> milestones
                    </span>
                  </div>
                  {insight.nextRecommendedAction && (
                    <div className="recommended-action">
                      <strong>Next Action:</strong> {insight.nextRecommendedAction}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Visualization */}
      <div className="progress-section">
        <h3>Overall Progress</h3>
        <div className="progress-bars">
          <div className="progress-item">
            <div className="progress-label">Applications</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(analytics.totalApplications / Math.max(analytics.totalApplications, 1)) * 100}%` }}
              ></div>
            </div>
            <span className="progress-text">{analytics.totalApplications}</span>
          </div>
          
          <div className="progress-item">
            <div className="progress-label">Milestones</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${analytics.milestoneCompletionRate}%` }}
              ></div>
            </div>
            <span className="progress-text">{analytics.completedMilestones}/{analytics.totalMilestones}</span>
          </div>
          
          <div className="progress-item">
            <div className="progress-label">Success Rate</div>
            <div className="progress-bar">
              <div 
                className="progress-fill success" 
                style={{ width: `${analytics.successRate}%` }}
              ></div>
            </div>
            <span className="progress-text">{analytics.successRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
