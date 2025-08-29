import { useState, useEffect } from 'react';
import type { JobApplication } from '../../types/jobTypes';
import { fetchJobApplications, deleteJobApplication } from '../../api/jobService';
import { useNotifications } from '../../contexts/useNotifications';
import { useToast } from '@asafarim/toast';
import JobStatusBadge from './JobStatusBadge';
import './JobList.css';

interface JobListProps {
  onEdit: (job: JobApplication) => void;
}

const JobList = ({ onEdit }: JobListProps) => {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();
  const toast = useToast();

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await fetchJobApplications();
      setJobs(data);
      setError(null);
      if (data.length === 0) {
        addNotification('info', 'No job applications found. Add your first one!');
      } else {
        addNotification('info', `Loaded ${data.length} job applications`);
      }
    } catch (err) {
      setError('Failed to load job applications');
      console.error(err);
      toast.error('Failed to load job applications');
      addNotification('error', 'Failed to load job applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        await deleteJobApplication(id);
        setJobs(jobs.filter(job => job.id !== id));
        toast.success('Job application deleted successfully');
        addNotification('success', 'Job application deleted successfully');
      } catch (err) {
        setError('Failed to delete job application');
        console.error(err);
        toast.error('Failed to delete job application');
        addNotification('error', 'Failed to delete job application. Please try again.');
      }
    }
  };

  if (loading) return <div className="loading">Loading job applications...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="job-list">
      <h2>Job Applications</h2>
      {jobs.length === 0 ? (
        <p>No job applications found. Add your first one!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Applied Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.company}</td>
                <td>{job.role}</td>
                <td>
                  <JobStatusBadge status={job.status} />
                </td>
                <td>{new Date(job.appliedDate).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => onEdit(job)} className="edit-btn">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(job.id)} className="delete-btn">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default JobList;
