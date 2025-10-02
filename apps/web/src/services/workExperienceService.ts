import { CORE_API_BASE, getCookie } from '../api/core';

export interface WorkAchievementDto {
  id: string;
  text: string;
}

export interface WorkExperienceDto {
  id: string;
  jobTitle: string;
  companyName: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements?: WorkAchievementDto[];
  sortOrder: number;
  highlighted: boolean;
  isPublished: boolean;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WorkAchievementRequest {
  text: string;
}

export interface WorkExperienceRequest {
  resumeId?: string;
  jobTitle: string;
  companyName: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements?: WorkAchievementRequest[];
  sortOrder: number;
  highlighted?: boolean;
  isPublished?: boolean;
  isAdminEdit?: boolean;
}

// Fetch current user's work experiences
export const fetchCurrentUsersWorkExperiences = async (): Promise<WorkExperienceDto[]> => {
  return await fetchWorkExperiences(undefined, undefined, true);
}

// Fetch all work experiences
export const fetchWorkExperiences = async (
  companyName?: string,
  title?: string,
  myExperiences?: boolean
): Promise<WorkExperienceDto[]> => {
  try {
    let url = `${CORE_API_BASE}/work-experiences`;
    
    // Add query parameters if provided
    const params = new URLSearchParams();
    if (companyName) params.append('companyName', companyName);
    if (title) params.append('title', title);
    if (myExperiences === true) params.append('myExperiences', 'true');
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    // Get token from both cookie and localStorage for maximum compatibility
    const token = getCookie('atk') || localStorage.getItem('auth_token');
    console.log('Using token for API call:', token ? 'Token exists' : 'No token');
    
    const response = await fetch(url, {
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        // Include auth token if available from either source
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching work experiences: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch work experiences:', error);
    return [];
  }
};

// Fetch a single work experience by ID
export const fetchWorkExperienceById = async (id: string): Promise<WorkExperienceDto | null> => {
  try {
    // Get token from both cookie and localStorage for maximum compatibility
    const token = getCookie('atk') || localStorage.getItem('auth_token');
    
    const response = await fetch(`${CORE_API_BASE}/work-experiences/${id}`, {
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        // Include auth token if available from either source
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching work experience: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch work experience with ID ${id}:`, error);
    return null;
  }
};

// Create a new work experience
export const createWorkExperience = async (workExperience: WorkExperienceRequest): Promise<WorkExperienceDto | null> => {
  try {
    // Ensure achievements is an array even if empty
    const workExperienceToSend = {
      ...workExperience,
      achievements: workExperience.achievements || [],
      // Ensure other required fields have default values
      sortOrder: workExperience.sortOrder || 0,
      isPublished: workExperience.isPublished !== false // Default to true if not specified
    };
    
    // Get token from both cookie and localStorage for maximum compatibility
    const token = getCookie('atk') || localStorage.getItem('auth_token');
    
    const response = await fetch(`${CORE_API_BASE}/work-experiences`, {
      method: 'POST',
      credentials: 'include', // Include cookies in the request
      headers: {
        'Content-Type': 'application/json',
        // Include auth token if available from either source
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(workExperienceToSend),
    });
    
    if (!response.ok) {
      // Try to get more detailed error information
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`Error creating work experience: ${response.status} ${response.statusText}\n${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to create work experience:', error);
    return null;
  }
};

// Update an existing work experience
export const updateWorkExperience = async (
  id: string, 
  workExperience: WorkExperienceRequest
): Promise<boolean> => {
  try {
    // Get token from both cookie and localStorage for maximum compatibility
    const token = getCookie('atk') || localStorage.getItem('auth_token');
    
    // Extract admin flag before cleaning
    const isAdminEdit = workExperience.isAdminEdit;
    
    // Clean up the work experience object to remove any undefined values
    // and remove the isAdminEdit property which is only for client-side use
    const cleanedWorkExperience = Object.fromEntries(
      Object.entries(workExperience)
        .filter(([key, value]) => {
          return key !== 'isAdminEdit' && value !== undefined;
        })
    );
    
    // Add admin flag as a query parameter if it's an admin edit
    let url = `${CORE_API_BASE}/work-experiences/${id}`;
    if (isAdminEdit) {
      url += '?isAdminEdit=true';
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      credentials: 'include', // Include cookies in the request
      headers: {
        'Content-Type': 'application/json',
        // Include auth token if available from either source
        ...(token && { 'Authorization': `Bearer ${token}` }),
        // Add admin flag as a header as well for redundancy
        ...(isAdminEdit && { 'X-Admin-Edit': 'true' }),
      },
      body: JSON.stringify(cleanedWorkExperience),
    });
    
    if (!response.ok) {
      // Try to get more detailed error information
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`Error updating work experience: ${response.status} ${response.statusText}\n${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to update work experience with ID ${id}:`, error);
    return false;
  }
};

// Delete a work experience
export const deleteWorkExperience = async (id: string, isAdminEdit?: boolean): Promise<boolean> => {
  try {
    // Get token from both cookie and localStorage for maximum compatibility
    const token = getCookie('atk') || localStorage.getItem('auth_token');
    
    // Add admin flag as a query parameter if it's an admin edit
    let url = `${CORE_API_BASE}/work-experiences/${id}`;
    if (isAdminEdit) {
      url += '?isAdminEdit=true';
    }
    
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include', // Include cookies in the request
      headers: {
        'Content-Type': 'application/json',
        // Include auth token if available from either source
        ...(token && { 'Authorization': `Bearer ${token}` }),
        // Add admin flag as a header as well for redundancy
        ...(isAdminEdit && { 'X-Admin-Edit': 'true' }),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting work experience: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to delete work experience with ID ${id}:`, error);
    return false;
  }
};

// Fetch user details by ID
export const fetchUserById = async (userId: string): Promise<unknown | null> => {
  try {
    const token = getCookie('atk') || localStorage.getItem('auth_token');
    
    const response = await fetch(`${import.meta.env.VITE_IDENTITY_API_URL || 'http://identity-api.asafarim.local:5101'}/admin/users/${userId}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching user: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch user with ID ${userId}:`, error);
    return null;
  }
};
