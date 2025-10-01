import { CORE_API_BASE, getCookie } from '../api/core';

export interface EntityType {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  endpoint: string;
}

export interface EntityRecord {
  id: number | string;
  name?: string;
  title?: string;
  userId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface EntityListResponse {
  records: EntityRecord[];
  total: number;
}

// Available entity types in the system
export const ENTITY_TYPES: EntityType[] = [
  {
    id: 'resumes',
    name: 'resumes',
    displayName: 'Resumes',
    description: 'Manage comprehensive resume profiles',
    icon: '📄',
    endpoint: '/resumes'
  },
  {
    id: 'work-experiences',
    name: 'work-experiences',
    displayName: 'Work Experiences',
    description: 'Manage professional work experience records',
    icon: '💼',
    endpoint: '/work-experiences'
  },
  {
    id: 'publications',
    name: 'publications',
    displayName: 'Publications',
    description: 'Manage research publications and articles',
    icon: '📚',
    endpoint: '/publications'
  },
  {
    id: 'projects',
    name: 'projects',
    displayName: 'Projects',
    description: 'Manage portfolio projects',
    icon: '🚀',
    endpoint: '/projects'
  },
  {
    id: 'skills',
    name: 'skills',
    displayName: 'Skills',
    description: 'Manage technical and professional skills',
    icon: '⚡',
    endpoint: '/skills'
  }
];

// Fetch all records for an entity type
export const fetchEntityRecords = async (
  entityType: string,
  myRecordsOnly: boolean = false
): Promise<EntityListResponse> => {
  try {
    const entity = ENTITY_TYPES.find(e => e.id === entityType);
    if (!entity) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    let url = `${CORE_API_BASE}${entity.endpoint}`;
    
    // Add query parameter for user-specific filtering
    if (myRecordsOnly) {
      const params = new URLSearchParams();
      
      // Different entities use different query params
      if (entityType === 'resumes') {
        params.append('myResumes', 'true');
      } else if (entityType === 'work-experiences') {
        params.append('myExperiences', 'true');
      } else if (entityType === 'publications') {
        params.append('myPublications', 'true');
      } else {
        params.append('myRecords', 'true');
      }
      
      url += `?${params.toString()}`;
    }
    
    const token = getCookie('atk') || localStorage.getItem('auth_token');
    
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching ${entityType}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Normalize response - some endpoints return array, others return object with data
    const records = Array.isArray(data) ? data : (data.data || data.records || []);
    
    return {
      records,
      total: records.length
    };
  } catch (error) {
    console.error(`Failed to fetch ${entityType}:`, error);
    return { records: [], total: 0 };
  }
};

// Delete an entity record
export const deleteEntityRecord = async (
  entityType: string,
  recordId: number | string,
  isAdminEdit: boolean = false
): Promise<boolean> => {
  try {
    const entity = ENTITY_TYPES.find(e => e.id === entityType);
    if (!entity) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    let url = `${CORE_API_BASE}${entity.endpoint}/${recordId}`;
    
    if (isAdminEdit) {
      url += '?isAdminEdit=true';
    }
    
    const token = getCookie('atk') || localStorage.getItem('auth_token');
    
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(isAdminEdit && { 'X-Admin-Edit': 'true' }),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting ${entityType}: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to delete ${entityType} record:`, error);
    return false;
  }
};

// Get entity display name
export const getEntityDisplayName = (record: EntityRecord): string => {
  return (record.title as string) || (record.name as string) || (record.jobTitle as string) || `Record #${record.id}`;
};
