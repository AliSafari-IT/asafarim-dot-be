import { apiGet, apiPost, apiPut, apiDelete } from '../api/core';

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

export interface TechnologyDto {
  id: string;
  name: string;
  category: string;
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
  technologies?: TechnologyDto[];
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
    let path = '/work-experiences';

    // Add query parameters if provided
    const params = new URLSearchParams();
    if (companyName) params.append('companyName', companyName);
    if (title) params.append('title', title);
    if (myExperiences === true) params.append('myExperiences', 'true');

    if (params.toString()) {
      path += `?${params.toString()}`;
    }

    return await apiGet<WorkExperienceDto[]>(path, {
    });
  } catch (error) {
    console.error('Failed to fetch work experiences:', error);
    return [];
  }
};

// Fetch a single work experience by ID
export const fetchWorkExperienceById = async (id: string): Promise<WorkExperienceDto | null> => {
  try {
    const path = `/work-experiences/${id}`;
    return await apiGet<WorkExperienceDto>(path, {
    });
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

    return await apiPost<WorkExperienceDto>('/work-experiences', {
      body: JSON.stringify(workExperienceToSend),
    });
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
    const queryParams = isAdminEdit ? '?isAdminEdit=true' : '';

    await apiPut<void>(`/work-experiences/${id}${queryParams}`, {
      body: JSON.stringify(cleanedWorkExperience),
    });

    return true;
  } catch (error) {
    console.error(`Failed to update work experience with ID ${id}:`, error);
    return false;
  }
};

// Delete a work experience
export const deleteWorkExperience = async (id: string, isAdminEdit?: boolean): Promise<boolean> => {
  try {
    // Add admin flag as a query parameter if it's an admin edit
    const queryParams = isAdminEdit ? '?isAdminEdit=true' : '';

    await apiDelete<void>(`/work-experiences/${id}${queryParams}`, {
    });

    return true;
  } catch (error) {
    console.error(`Failed to delete work experience with ID ${id}:`, error);
    return false;
  }
};

// Fetch user details by ID
export const fetchUserById = async (userId: string): Promise<unknown | null> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_IDENTITY_API_URL || 'http://identity-api.asafarim.local:5101'}/admin/users/${userId}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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
