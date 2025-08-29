import type { JobStatus } from '../../types/jobTypes';
import './JobStatusBadge.css';

interface JobStatusBadgeProps {
  status: JobStatus;
}

const JobStatusBadge = ({ status }: JobStatusBadgeProps) => {
  const getStatusClass = () => {
    switch (status) {
      case 'Applied':
        return 'status-applied';
      case 'Interview':
        return 'status-interview';
      case 'Offer':
        return 'status-offer';
      case 'Rejected':
        return 'status-rejected';
      default:
        return 'status-applied';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass()}`}>
      {status}
    </span>
  );
};

export default JobStatusBadge;
