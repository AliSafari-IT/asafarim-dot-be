import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchJobApplicationById } from '../../api/jobService';
import { useNotifications } from '../../contexts/useNotifications';
import { useToast } from '@asafarim/toast';
import JobStatusBadge from './JobStatusBadge';
import type { JobApplication } from '../../types/jobTypes';
import './JobView.css';

const JobView = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();
  const toast = useToast();

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) {
        setError('No job ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const jobData = await fetchJobApplicationById(jobId);
        setJob(jobData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load job application';
        setError(errorMessage);
        console.error('Job view error:', err);
        toast.error(errorMessage);
        addNotification('error', `Failed to load job application: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId, addNotification, toast]);

  const handleBack = () => {
    navigate('/jobs');
  };

  const handleEdit = () => {
    if (job) {
      navigate(`/jobs/${job.id}/edit`);
    }
  };

  if (loading) {
    return (
      <div className="job-view">
        <div className="job-view-header">
          <button className="back-btn" onClick={handleBack}>
            ← Back to Jobs
          </button>
        </div>
        <div className="loading">Loading job application...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-view">
        <div className="job-view-header">
          <button className="back-btn" onClick={handleBack}>
            ← Back to Jobs
          </button>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-view">
        <div className="job-view-header">
          <button className="back-btn" onClick={handleBack}>
            ← Back to Jobs
          </button>
        </div>
        <div className="error">Job application not found</div>
      </div>
    );
  }

  return (
    <div className="job-view">
      <div className="job-view-header">
        <button className="back-btn" onClick={handleBack}>
          ← Back to Jobs
        </button>
        <div className="header-actions">
          <button className="edit-btn" onClick={handleEdit}>
            Edit Application
          </button>
        </div>
      </div>

      <div className="job-view-content">
        <div className="job-view-card">
          <div className="job-header">
            <div className="job-title-section">
              <h1 className="job-company">{job.company}</h1>
              <h2 className="job-role">{job.role}</h2>
            </div>
            <div className="job-status-section">
              <JobStatusBadge status={job.status} />
            </div>
          </div>

          <div className="job-details">
            <div className="detail-section">
              <h3>Application Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Company:</span>
                  <span className="detail-value">{job.company}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Role:</span>
                  <span className="detail-value">{job.role}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">
                    <JobStatusBadge status={job.status} />
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Applied Date:</span>
                  <span className="detail-value">
                    {new Date(job.appliedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {job.notes && (
              <div className="detail-section">
                <h3>Notes</h3>
                <div className="notes-content">
                  {job.notes.split('\n').map((line, index) => (
                    <p key={index}>{line || '\u00A0'}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h3>Timeline</h3>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">Application Submitted</div>
                    <div className="timeline-date">
                      {new Date(job.appliedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {job.status === 'Interview' && (
                  <div className="timeline-item">
                    <div className="timeline-marker active"></div>
                    <div className="timeline-content">
                      <div className="timeline-title">Interview Stage</div>
                      <div className="timeline-date">Current Status</div>
                    </div>
                  </div>
                )}
                {job.status === 'Offer' && (
                  <div className="timeline-item">
                    <div className="timeline-marker success"></div>
                    <div className="timeline-content">
                      <div className="timeline-title">Offer Received</div>
                      <div className="timeline-date">Current Status</div>
                    </div>
                  </div>
                )}
                {job.status === 'Rejected' && (
                  <div className="timeline-item">
                    <div className="timeline-marker rejected"></div>
                    <div className="timeline-content">
                      <div className="timeline-title">Application Rejected</div>
                      <div className="timeline-date">Current Status</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobView;