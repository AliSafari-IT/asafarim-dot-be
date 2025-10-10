import { apiGet, apiPost, apiPut, apiDelete } from '../api/core';
import type { ContentCardProps } from "@asafarim/shared-ui-react";
import { API_BASE_URL } from '../config/api';

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
export const mapToContentCardProps = (publication: PublicationDto): ContentCardProps & { id: number | string; doi?: string; journalName?: string; conferenceName?: string } => {
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
    // Include these fields to ensure they're available when editing
    doi: publication.doi,
    journalName: publication.journalName,
    conferenceName: publication.conferenceName,
  };
};

// Fetch publications or projects by variant (unified function)
export const fetchContent = async (
  variant?: string,
  featured?: boolean,
  myContent?: boolean,
  contentType?: 'publications' | 'projects' // For backwards compatibility
): Promise<(ContentCardProps & { id: number | string })[]> => {
  try {
    // For projects, map frontend variants to backend publication variants
    let mappedVariant = variant;

    if (contentType === 'projects' || (variant && ['featured', 'opensource', 'commercial', 'research', 'tools'].includes(variant))) {
      // Map project variants to publication variants in backend
      const projectVariantMapping: Record<string, string> = {
        'featured': 'featured',
        'opensource': 'opensource',
        'commercial': 'commercial',
        'research': 'research',
        'tools': 'tools'
      };

      mappedVariant = projectVariantMapping[variant || ''] || variant;
    }

    let url = `${API_BASE_URL}/publications`;

    // Add query parameters if provided
    const params = new URLSearchParams();
    if (mappedVariant) params.append('variant', mappedVariant);
    if (featured !== undefined) params.append('featured', featured.toString());
    if (myContent === true) params.append('myPublications', 'true');

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error fetching content: ${response.statusText}`);
    }

    const data: PublicationDto[] = await response.json();
    return data.map(mapToContentCardProps);
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return [];
  }
};

// Backwards compatibility - keep the original function
export const fetchPublications = async (variant?: string, featured?: boolean, myPublications?: boolean): Promise<(ContentCardProps & { id: number | string })[]> => {
  return fetchContent(variant, featured, myPublications, 'publications');
};

// New function for projects (which are just publications with project variants)
export const fetchProjects = async (variant?: string, featured?: boolean, myProjects?: boolean): Promise<(ContentCardProps & { id: number | string })[]> => {
  return fetchContent(variant, featured, myProjects, 'projects');
};

// Fetch a single publication by ID
export const fetchPublicationById = async (id: number | string): Promise<ContentCardProps | null> => {
  try {
    const response = await apiGet<PublicationDto>(`/publications/${id}`, {
    });

    return mapToContentCardProps(response);
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
    
    const response = await apiPost<PublicationDto>(`/publications`, {
      body: JSON.stringify(publicationToSend),
    });
        
    return response;
  } catch (error) {
    console.error('Failed to create publication:', error);
    return null;
  }
};

// Update an existing publication
export const updatePublication = async (id: number, publication: Omit<PublicationDto, 'id'> & { isAdminEdit?: boolean }): Promise<boolean> => {
  try {
    // Extract admin flag before cleaning
    const isAdminEdit = publication.isAdminEdit;
    
    // Clean up the publication object to remove any undefined values
    // and remove the isAdminEdit property which is only for client-side use
    // BUT keep empty strings for doi and journalName to ensure they're updated
    const cleanedPublication = Object.fromEntries(
      Object.entries(publication)
        .filter(([key, value]) => {
          // Always include doi and journalName even if they're empty strings
          if (key === 'doi' || key === 'journalName') return true;
          // For other fields, filter out undefined and null values
          return key !== 'isAdminEdit' && value !== undefined && value !== null;
        })
    );
    
    console.log('Updating publication with data:', cleanedPublication);
    console.log('Is admin edit:', isAdminEdit ? 'Yes' : 'No');
    
    // Add admin flag as a query parameter if it's an admin edit
    let url = `/publications/${id}`;
    if (isAdminEdit) {
      url += '?isAdminEdit=true';
    }
    
    const response = await apiPut<PublicationDto>(url, {
      body: JSON.stringify(cleanedPublication),
    });
    if (response) {
      return true;
    }  
    return false;
  } catch (error) {
    console.error(`Failed to update publication with ID ${id}:`, error);
    return false;
  }
};

// Delete a publication
export const deletePublication = async (id: number): Promise<boolean> => {
  try {
    await apiDelete<void>(`/publications/${id}`, {
    });
    return true;
  } catch (error) {
    console.error(`Failed to delete publication with ID ${id}:`, error);
    return false;
  }
};

