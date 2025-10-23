import { useState } from 'react';
import JobList from './JobList';
import JobForm from './JobForm';
import type { JobApplication } from '../../types/jobTypes';
import './job.css';
import AnalyticsDashboard from './AnalyticsDashboard';
import { ButtonComponent } from '@asafarim/shared-ui-react';

const JobTracker = () => {
  const [selectedJob, setSelectedJob] = useState<JobApplication | undefined>(undefined);
  const [isFormVisible, setIsFormVisible] = useState(false);
  // Add a state for showing analytics
  const [showAnalytics, setShowAnalytics] = useState(false);
  const handleAddNew = () => {
    console.log('handleAddNew');
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
    setShowAnalytics(false);
  };

  return (
    <div className="job-tracker-container">
      <div className="job-tracker-header">
        <h1>Job Tracker</h1>
        <div className="header-actions">
          <ButtonComponent 
          onClick={() => setShowAnalytics(!showAnalytics)} 
          variant='outline'>
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </ButtonComponent>
          {
            !showAnalytics && (
              <ButtonComponent onClick={handleAddNew} 
              variant='brand' disabled={isFormVisible}>
                Add New Job Application
              </ButtonComponent>
            )
          }
        </div>
      </div>

      <div className="job-tracker-content">
        {showAnalytics ? (
          <AnalyticsDashboard />
        ) : (
          <>
            {isFormVisible ? (
              <JobForm job={selectedJob} onSave={handleSave} onCancel={handleCancel} />
            ) : (
              <JobList onAdd={handleAddNew} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobTracker;
