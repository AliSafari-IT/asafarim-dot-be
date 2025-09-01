import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchJobApplicationById } from '../../api/jobService';
import { useNotifications } from '../../contexts/useNotifications';
import { useToast } from '@asafarim/toast';
import JobForm from './JobForm';
import type { JobApplication } from '../../types/jobTypes';
import './JobEdit.css';

const JobEdit = () => {
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
        console.error('Job edit error:', err);
        toast.error(errorMessage);
        addNotification('error', `Failed to load job application: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId]);

  const handleSave = () => {
    // JobForm handles the save internally, we just navigate back
    toast.success('Job application updated successfully');
    addNotification('success', 'Job application updated successfully');
    navigate('/jobs');
  };

  const handleCancel = () => {
    navigate('/jobs');
  };

  const handleBack = () => {
    navigate('/jobs');
  };

  if (loading) {
    return (
      <div className="job-edit">
        <div className="job-edit-header">
          <button className="back-btn" onClick={handleBack}>
            ← Back to Jobs
          </button>
          <h1>Edit Job Application</h1>
        </div>
        <div className="loading">Loading job application...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-edit">
        <div className="job-edit-header">
          <button className="back-btn" onClick={handleBack}>
            ← Back to Jobs
          </button>
          <h1>Edit Job Application</h1>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-edit">
        <div className="job-edit-header">
          <button className="back-btn" onClick={handleBack}>
            ← Back to Jobs
          </button>
          <h1>Edit Job Application</h1>
        </div>
        <div className="error">Job application not found</div>
      </div>
    );
  }

  return (
    <div className="job-edit">
      <div className="job-edit-header">
        <button className="back-btn" onClick={handleBack}>
          ← Back to Jobs
        </button>
        <h1>Edit Job Application</h1>
        <div className="job-info">
          <span className="company-name">{job.company}</span>
          <span className="role-name">{job.role}</span>
        </div>
      </div>
      <div className="job-edit-content">
        <JobForm job={job} onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default JobEdit;