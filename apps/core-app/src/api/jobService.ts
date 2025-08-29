import type { JobApplication } from '../types/jobTypes';

const API_URL = 'http://localhost:5102/api/JobApplications';

export const fetchJobApplications = async (): Promise<JobApplication[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch job applications');
  }
  return response.json();
};

export const fetchJobApplicationById = async (id: string): Promise<JobApplication> => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch job application');
  }
  return response.json();
};

export const createJobApplication = async (jobApplication: Omit<JobApplication, 'id'>): Promise<JobApplication> => {
  // Format the date properly for the backend
  const formattedApplication = {
    ...jobApplication,
    // Convert date string to ISO format that .NET can parse
    appliedDate: new Date(jobApplication.appliedDate).toISOString()
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedApplication),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Server response:', errorData);
      throw new Error(`Failed to create job application: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating job application:', error);
    throw error;
  }
};

export const updateJobApplication = async (jobApplication: JobApplication): Promise<void> => {
  // Format the date properly for the backend
  const formattedApplication = {
    ...jobApplication,
    // Convert date string to ISO format that .NET can parse
    appliedDate: new Date(jobApplication.appliedDate).toISOString()
  };

  try {
    const response = await fetch(`${API_URL}/${jobApplication.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedApplication),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Server response:', errorData);
      throw new Error(`Failed to update job application: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error updating job application:', error);
    throw error;
  }
};

export const deleteJobApplication = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Server response:', errorData);
      throw new Error(`Failed to delete job application: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting job application:', error);
    throw error;
  }
};
