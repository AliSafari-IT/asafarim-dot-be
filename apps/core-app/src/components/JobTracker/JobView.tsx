import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchJobApplicationById } from '../../api/jobService';
import { fetchMilestonesByJob, createMilestone, updateMilestone, deleteMilestone } from '../../api/timelineService';
import { useNotifications } from '@asafarim/shared-ui-react';
import { useToast } from '@asafarim/toast';
import JobStatusBadge from './JobStatusBadge';
import Timeline from './Timeline';
import type { JobApplication } from '../../types/jobTypes';
import type { TimelineMilestone } from '../../types/timelineTypes';
import './job.css';

const JobView = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobApplication | null>(null);
  const [milestones, setMilestones] = useState<TimelineMilestone[]>([]);
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
        
        // Load milestones from backend
        try {
          const milestonesData = await fetchMilestonesByJob(jobId);
          setMilestones(milestonesData);
        } catch (error) {
          console.warn('Failed to load milestones, starting with empty timeline:', error);
          setMilestones([]);
        }
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
  }, [jobId]);

  const handleBack = () => {
    navigate('/jobs');
  };

  const handleEdit = () => {
    if (job) {
      navigate(`/jobs/${job.id}/edit`);
    }
  };

  // Timeline management functions
  const handleMilestoneUpdate = async (milestone: TimelineMilestone) => {
    try {
      await updateMilestone(milestone.id, milestone);
      setMilestones(prev => prev.map(m => m.id === milestone.id ? milestone : m));
      toast.success('Milestone updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update milestone';
      toast.error(errorMessage);
      addNotification('error', `Failed to update milestone: ${errorMessage}`);
    }
  };

  const handleMilestoneAdd = async (milestone: Omit<TimelineMilestone, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newMilestone = await createMilestone(milestone);
      setMilestones(prev => [...prev, newMilestone]);
      toast.success('Milestone added successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add milestone';
      toast.error(errorMessage);
      addNotification('error', `Failed to add milestone: ${errorMessage}`);
    }
  };

  const handleMilestoneDelete = async (milestoneId: string) => {
    try {
      await deleteMilestone(milestoneId);
      setMilestones(prev => prev.filter(m => m.id !== milestoneId));
      toast.success('Milestone deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete milestone';
      toast.error(errorMessage);
      addNotification('error', `Failed to delete milestone: ${errorMessage}`);
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
              <div className="title-with-edit">
                <h1 className="job-company">{job.company}</h1>
                <button 
                  className="edit-icon-btn"
                  onClick={handleEdit}
                  title="Edit Job Application"
                  aria-label="Edit Job Application"
                >
                  ✏️
                </button>
              </div>
              <h2 className="job-role">{job.role}</h2>
            </div>
            <div className="job-status-section">
              <JobStatusBadge status={job.status} />
            </div>
          </div>

          <div className="job-details">
            <div className="detail-section">
              <div className="section-header-with-edit">
                <h3>Application Details</h3>
                <button 
                  className="edit-icon-btn small"
                  onClick={handleEdit}
                  title="Edit Job Application"
                  aria-label="Edit Job Application"
                >
                  ✏️
                </button>
              </div>
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

            {/* Enhanced Timeline Component */}
            <Timeline
              job={job}
              milestones={milestones}
              onMilestoneUpdate={handleMilestoneUpdate}
              onMilestoneAdd={handleMilestoneAdd}
              onMilestoneDelete={handleMilestoneDelete}
            />
          </div>
        </div>
      </div>
        </div>
    );
};

export default JobView;