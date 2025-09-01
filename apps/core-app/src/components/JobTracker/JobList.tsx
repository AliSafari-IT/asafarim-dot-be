import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { JobApplication, JobStatus } from '../../types/jobTypes';
import { fetchJobApplications, deleteJobApplication } from '../../api/jobService';
import { useToast } from '@asafarim/toast';
import JobStatusBadge from './JobStatusBadge';
import './job.css';

interface JobListProps {
  onAdd: () => void;
}

const JobList = ({ onAdd }: JobListProps) => {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  // UI state
  const [search, setSearch] = useState('');
  const statusOptions: Array<'All' | JobStatus> = ['All', 'Applied', 'Interview', 'Offer', 'Rejected'];
  const [statusFilter, setStatusFilter] = useState<'All' | JobStatus>('All');

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchJobApplications();
      setJobs(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load job applications';
      setError(errorMessage);
      console.error('Job list error:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        await deleteJobApplication(id);
        setJobs(prev => prev.filter(job => job.id !== id));
        toast.success('Job application deleted successfully');
      } catch (err) {
        setError('Failed to delete job application');
        console.error(err);
        toast.error('Failed to delete job application');
      }
    }
  };

  // Filtered jobs (sorted by most recent first)
  const visibleJobs = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = jobs;

    if (statusFilter !== 'All') {
      list = list.filter(j => j.status === statusFilter);
    }

    if (term) {
      list = list.filter(j =>
        j.company.toLowerCase().includes(term) ||
        j.role.toLowerCase().includes(term)
      );
    }

    // Sort by most recent applied date first
    return [...list].sort((a, b) =>
      new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
    );
  }, [jobs, search, statusFilter]);



  if (loading) {
    return (
      <div className="job-list">
        <div className="loading" role="status" aria-live="polite">
          Loading job applications...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-list">
        <div className="error" role="alert" aria-live="assertive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="job-list">
      {/* Controls */}
      <div className="list-controls">
        <div className="list-controls__left">
          <h2 className="list-title">Job Applications</h2>
          <div className="filter-chips" role="tablist" aria-label="Filter by status">
            {statusOptions.map(opt => (
              <button
                key={opt}
                type="button"
                role="tab"
                aria-selected={statusFilter === opt}
                className={
                  'chip' + (statusFilter === opt ? ' chip--active' : '')
                }
                onClick={() => setStatusFilter(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="list-controls__right">
          <input
            type="search"
            className="search-input"
            placeholder="Search company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search job applications"
          />
          <button
            type="button"
            className="add-job-btn"
            onClick={onAdd}
            aria-label="Add new job application"
          >
            + Add Job
          </button>
        </div>
      </div>

      {/* Jobs Display */}
      {visibleJobs.length === 0 ? (
        <div className="empty-state" role="status" aria-live="polite">
          {jobs.length === 0
            ? 'No job applications yet. Use the button to add your first entry.'
            : 'No results match your filters.'}
          <button type="button" className="add-inline-btn" onClick={onAdd}>
            Add Job
          </button>
        </div>
      ) : (
        <div className="jobs-container">
          {visibleJobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-card-content">
                <div className="job-info">
                  <div className="job-company">{job.company}</div>
                  <div className="job-role">{job.role}</div>
                </div>
                <div className="job-status">
                  <JobStatusBadge status={job.status} />
                </div>
                <div className="job-date">
                  {new Date(job.appliedDate).toLocaleDateString()}
                </div>
                <div className="job-actions">
                  <button
                    className="view-btn"
                    onClick={() => navigate(`/jobs/${job.id}/view`)}
                    aria-label={`View ${job.role} at ${job.company}`}
                  >
                    View
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => navigate(`/jobs/${job.id}/edit`)}
                    aria-label={`Edit ${job.role} at ${job.company}`}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(job.id)}
                    aria-label={`Delete ${job.role} at ${job.company}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;