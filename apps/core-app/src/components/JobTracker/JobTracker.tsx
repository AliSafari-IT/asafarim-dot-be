import { useState } from 'react';
import JobList from './JobList';
import JobForm from './JobForm';
import type { JobApplication } from '../../types/jobTypes';
import './job.css';
import AnalyticsDashboard from './AnalyticsDashboard';

const JobTracker = () => {
  const [selectedJob, setSelectedJob] = useState<JobApplication | undefined>(undefined);
  const [isFormVisible, setIsFormVisible] = useState(false);
  // Add a state for showing analytics
  const [showAnalytics, setShowAnalytics] = useState(false);
  const handleAddNew = () => {
    setSelectedJob(undefined);
    setIsFormVisible(true);
  };



  const handleSave = () => {
    setIsFormVisible(false);
    setSelectedJob(undefined);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setSelectedJob(undefined);
  };

  return (
    <div className="job-tracker-container">
      <div className="job-tracker-header">
        <h1>Job Tracker</h1>
        <button onClick={handleAddNew} className="add-job-btn">
          Add New Job Application
        </button>
      </div>

      <div className="job-tracker-content">
        <button onClick={() => setShowAnalytics(!showAnalytics)} className="show-analytics-btn">
          {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
        </button>
        <div>
          {showAnalytics ? (
            <AnalyticsDashboard />
          ) : (
            <div>
              {isFormVisible ? (
                <JobForm job={selectedJob} onSave={handleSave} onCancel={handleCancel} />
              ) : (
                <JobList onAdd={handleAddNew} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobTracker;
