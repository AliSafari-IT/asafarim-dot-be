import type { ContentCardProps } from "@asafarim/shared-ui-react";

export interface PublicationDto {
  id: number | string;
  title: string;
  subtitle?: string;
  meta?: string;
  description?: string;
  link?: string;
  imageUrl?: string;
  useGradient?: boolean;
  tags?: string[];
  year?: string;
  metrics?: { label: string; value: string | number }[];
  variant?: string;
  size?: string;
  fullWidth?: boolean;
  elevated?: boolean;
  bordered?: boolean;
  clickable?: boolean;
  featured?: boolean;
  doi?: string;
  journalName?: string;
  conferenceName?: string;
  publicationType?: string;
  isPublished?: boolean;
  showImage?: boolean;
  userId?: string;
}

// Convert API response to ContentCardProps
export const mapToContentCardProps = (publication: PublicationDto): ContentCardProps & { id: number | string } => {
  return {
    id: publication.id.toString(),
    title: publication.title,
    subtitle: publication.subtitle,
    meta: publication.meta,
    description: publication.description,
    link: publication.link,
    imageUrl: publication.imageUrl,
    useGradient: publication.useGradient,
    tags: publication.tags,
    year: publication.year,
    metrics: publication.metrics,
    variant: publication.variant as 'project' | 'article' | 'publication' | 'report' | 'default',
    size: publication.size as 'sm' | 'md' | 'lg',
    fullWidth: publication.fullWidth,
    elevated: publication.elevated,
    bordered: publication.bordered,
    clickable: publication.clickable,
    featured: publication.featured,
    showImage: publication.showImage,
    userId: publication.userId,
  };
};

// API base URL
const API_BASE_URL = import.meta.env.VITE_CORE_API_URL || 'http://core-api.asafarim.local:5102/api';

// Fetch all publications
export const fetchPublications = async (variant?: string, featured?: boolean, myPublications?: boolean): Promise<(ContentCardProps & { id: number | string })[]> => {
  try {
    let url = `${API_BASE_URL}/publications`;
    
    // Add query parameters if provided
    const params = new URLSearchParams();
    if (variant) params.append('variant', variant);
    if (featured !== undefined) params.append('featured', featured.toString());
    if (myPublications === true) params.append('myPublications', 'true');
    
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
      throw new Error(`Error fetching publications: ${response.statusText}`);
    }
    
    const data: PublicationDto[] = await response.json();
    return data.map(mapToContentCardProps);
  } catch (error) {
    console.error('Failed to fetch publications:', error);
    return [];
  }
};

// Fetch a single publication by ID
export const fetchPublicationById = async (id: number | string): Promise<ContentCardProps | null> => {
  try {
    // Get token from both cookie and localStorage for maximum compatibility
    const token = getCookie('atk') || localStorage.getItem('auth_token');
    console.log('Using token for API call:', token ? 'Token exists' : 'No token');
    
    const response = await fetch(`${API_BASE_URL}/publications/${id}`, {
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        // Include auth token if available from either source
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching publication: ${response.statusText}`);
    }
    
    const data: PublicationDto = await response.json();
    return mapToContentCardProps(data);
  } catch (error) {
    console.error(`Failed to fetch publication with ID ${id}:`, error);
    return null;
  }
};

// Create a new publication
export const createPublication = async (publication: Omit<PublicationDto, 'id'>): Promise<PublicationDto | null> => {
  try {
    // Ensure tags is an array even if empty
    const publicationToSend = {
      ...publication,
      tags: publication.tags || [],
      metrics: publication.metrics || [],
      // Ensure other required fields have default values
      variant: publication.variant || 'publication',
      size: publication.size || 'md',
      sortOrder: 0, // Default sort order
      isPublished: publication.isPublished !== false // Default to true if not specified
    };
    
    console.log('Sending publication data:', publicationToSend);
    
    // Get token from both cookie and localStorage for maximum compatibility
    const token = getCookie('atk') || localStorage.getItem('auth_token');
    console.log('Using token for API call:', token ? 'Token exists' : 'No token');
    
    const response = await fetch(`${API_BASE_URL}/publications`, {
      method: 'POST',
      credentials: 'include', // Include cookies in the request
      headers: {
        'Content-Type': 'application/json',
        // Include auth token if available from either source
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(publicationToSend),
    });
    
    if (!response.ok) {
      // Try to get more detailed error information
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`Error creating publication: ${response.status} ${response.statusText}\n${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to create publication:', error);
    return null;
  }
};

// Update an existing publication
export const updatePublication = async (id: number, publication: Omit<PublicationDto, 'id'> & { isAdminEdit?: boolean }): Promise<boolean> => {
  try {
    // Get token from both cookie and localStorage for maximum compatibility
    const token = getCookie('atk') || localStorage.getItem('auth_token');
    console.log('Using token for API call:', token ? 'Token exists' : 'No token');
    
    // Extract admin flag before cleaning
    const isAdminEdit = publication.isAdminEdit;
    
    // Clean up the publication object to remove any undefined or null values
    // and remove the isAdminEdit property which is only for client-side use
    const cleanedPublication = Object.fromEntries(
      Object.entries(publication)
        .filter(([key, value]) => key !== 'isAdminEdit' && value !== undefined && value !== null)
    );
    
    console.log('Updating publication with data:', cleanedPublication);
    console.log('Is admin edit:', isAdminEdit ? 'Yes' : 'No');
    
    // Add admin flag as a query parameter if it's an admin edit
    let url = `${API_BASE_URL}/publications/${id}`;
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
      body: JSON.stringify(cleanedPublication),
    });
    
    if (!response.ok) {
      // Try to get more detailed error information
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`Error updating publication: ${response.status} ${response.statusText}\n${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to update publication with ID ${id}:`, error);
    return false;
  }
};

// Delete a publication
export const deletePublication = async (id: number): Promise<boolean> => {
  try {
    // Get token from both cookie and localStorage for maximum compatibility
    const token = getCookie('atk') || localStorage.getItem('auth_token');
    console.log('Using token for API call:', token ? 'Token exists' : 'No token');
    
    const response = await fetch(`${API_BASE_URL}/publications/${id}`, {
      method: 'DELETE',
      credentials: 'include', // Include cookies in the request
      headers: {
        'Content-Type': 'application/json',
        // Include auth token if available from either source
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting publication: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to delete publication with ID ${id}:`, error);
    return false;
  }
};

// Helper function to get cookie value
function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}
