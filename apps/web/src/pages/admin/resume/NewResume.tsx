import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Wrapper component for creating new resumes via /admin/entities/resumes/new
 * This redirects to the generic AddNewEntity with entityType="resumes"
 */
const NewResume: React.FC = () => {
  return <Navigate to="/admin/entities/resumes/new" replace />;
};

export default NewResume;
