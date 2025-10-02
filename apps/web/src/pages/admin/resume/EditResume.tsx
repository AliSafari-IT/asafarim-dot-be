import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

/**
 * Wrapper component for editing resumes via /admin/resume/:id/edit
 * This redirects to the generic EditEntity with entityType="resumes"
 */
const EditResume: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <Navigate to="/admin/resume" replace />;
  }
  
  // Redirect to the entity edit route with the correct entityType
  return <Navigate to={`/admin/entities/resumes/${id}/edit`} replace />;
};

export default EditResume;
