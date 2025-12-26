import type { JobApplication } from '../../types/jobTypes';
import type { FilterCriteria } from './FilterPanel';
import './FilteredAnalytics.css';

interface FilteredAnalyticsProps {
  jobs: JobApplication[];
  filters: FilterCriteria;
}

interface FilteredStats {
  totalFiltered: number;
  successRate: number;
  rejectionRate: number;
  averageDaysApplied: number;
  byStatus: Record<string, number>;
}

const FilteredAnalytics = ({ jobs, filters }: FilteredAnalyticsProps) => {
  const getFilteredJobs = () => {
    return jobs.filter((job) => {
      if (filters.status && filters.status !== 'All' && job.status !== filters.status) {
        return false;
      }
      if (filters.city && job.city !== filters.city) {
        return false;
      }
      if (filters.company && job.company !== filters.company) {
        return false;
      }
      return true;
    });
  };

  const calculateStats = (): FilteredStats => {
    const filtered = getFilteredJobs();
    const total = filtered.length;

    if (total === 0) {
      return {
        totalFiltered: 0,
        successRate: 0,
        rejectionRate: 0,
        averageDaysApplied: 0,
        byStatus: {},
      };
    }

    const successful = filtered.filter((j) => j.status === 'Offer').length;
    const rejected = filtered.filter((j) => j.status === 'Rejected').length;
    const successRate = (successful / total) * 100;
    const rejectionRate = (rejected / total) * 100;

    const totalDays = filtered.reduce((sum, job) => {
      const days = Math.floor((new Date().getTime() - new Date(job.appliedDate).getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    const averageDaysApplied = total > 0 ? Math.round(totalDays / total) : 0;

    const byStatus: Record<string, number> = {};
    filtered.forEach((job) => {
      byStatus[job.status] = (byStatus[job.status] || 0) + 1;
    });

    return {
      totalFiltered: total,
      successRate: Math.round(successRate * 10) / 10,
      rejectionRate: Math.round(rejectionRate * 10) / 10,
      averageDaysApplied,
      byStatus,
    };
  };

  const stats = calculateStats();
  const filteredJobs = getFilteredJobs();

  if (filteredJobs.length === 0) {
    return (
      <div className="filtered-analytics">
        <div className="no-results">
          <p>No jobs match the selected filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="filtered-analytics">
      <div className="filtered-stats-grid">
        <div className="filtered-stat-card">
          <div className="stat-label">Total Filtered</div>
          <div className="stat-value">{stats.totalFiltered}</div>
        </div>

        <div className="filtered-stat-card">
          <div className="stat-label">Success Rate</div>
          <div className="stat-value success">{stats.successRate}%</div>
        </div>

        <div className="filtered-stat-card">
          <div className="stat-label">Rejection Rate</div>
          <div className="stat-value danger">{stats.rejectionRate}%</div>
        </div>

        <div className="filtered-stat-card">
          <div className="stat-label">Avg Days Applied</div>
          <div className="stat-value">{stats.averageDaysApplied} days</div>
        </div>
      </div>

      {Object.keys(stats.byStatus).length > 0 && (
        <div className="status-breakdown">
          <h4>Status Breakdown</h4>
          <div className="status-list">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="status-item">
                <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
                <span className="status-count">{count} applications</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="filtered-jobs-preview">
        <h4>Filtered Jobs ({filteredJobs.length})</h4>
        <div className="jobs-table">
          <div className="table-header">
            <div className="col-company">Company</div>
            <div className="col-role">Role</div>
            <div className="col-city">City</div>
            <div className="col-status">Status</div>
            <div className="col-days">Days</div>
          </div>
          {filteredJobs.slice(0, 5).map((job) => {
            const days = Math.floor((new Date().getTime() - new Date(job.appliedDate).getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div key={job.id} className="table-row">
                <div className="col-company">{job.company}</div>
                <div className="col-role">{job.role}</div>
                <div className="col-city">{job.city || 'N/A'}</div>
                <div className="col-status">
                  <span className={`status-badge ${job.status.toLowerCase()}`}>{job.status}</span>
                </div>
                <div className="col-days">{days}d</div>
              </div>
            );
          })}
        </div>
        {filteredJobs.length > 5 && (
          <p className="more-jobs">... and {filteredJobs.length - 5} more jobs</p>
        )}
      </div>
    </div>
  );
};

export default FilteredAnalytics;
