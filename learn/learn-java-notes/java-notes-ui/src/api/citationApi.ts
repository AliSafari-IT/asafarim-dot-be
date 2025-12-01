import { api } from './notesApi';
import type {
  NoteCitation,
  CreateCitationRequest,
  UpdateCitationRequest,
  CitedNote,
  CitingNote,
  CitationStats,
} from '../types/citation';

// ==================== Create/Update/Delete Citations ====================

/**
 * Create a citation from one note to another
 */
export const createCitation = async (
  noteId: string,
  referencedNoteId: string,
  request?: CreateCitationRequest
): Promise<NoteCitation> => {
  const response = await api.post(
    `/citations/notes/${noteId}/cite/${referencedNoteId}`,
    request || {}
  );
  return response.data;
};

/**
 * Update citation metadata
 */
export const updateCitation = async (
  citationId: string,
  request: UpdateCitationRequest
): Promise<NoteCitation> => {
  const response = await api.put(`/citations/${citationId}`, request);
  return response.data;
};

/**
 * Delete a citation by ID
 */
export const deleteCitation = async (citationId: string): Promise<void> => {
  await api.delete(`/citations/${citationId}`);
};

/**
 * Delete a citation by note and referenced note IDs
 */
export const deleteCitationByNotes = async (
  noteId: string,
  referencedNoteId: string
): Promise<void> => {
  await api.delete(`/citations/notes/${noteId}/cite/${referencedNoteId}`);
};

// ==================== Query Citations ====================

/**
 * Get all outgoing citations from a note (notes this note cites)
 */
export const getOutgoingCitations = async (noteId: string): Promise<NoteCitation[]> => {
  const response = await api.get(`/citations/notes/${noteId}/outgoing`);
  return response.data;
};

/**
 * Get all incoming citations to a note (notes that cite this note)
 */
export const getIncomingCitations = async (noteId: string): Promise<NoteCitation[]> => {
  const response = await api.get(`/citations/notes/${noteId}/incoming`);
  return response.data;
};

/**
 * Get cited notes (notes referenced by a note) with summary info
 */
export const getCitedNotes = async (noteId: string): Promise<CitedNote[]> => {
  const response = await api.get(`/citations/notes/${noteId}/cited`);
  return response.data;
};

/**
 * Get citing notes (notes that reference this note) with summary info
 */
export const getCitingNotes = async (noteId: string): Promise<CitingNote[]> => {
  const response = await api.get(`/citations/notes/${noteId}/citing`);
  return response.data;
};

/**
 * Get citation statistics for a note
 */
export const getCitationStats = async (noteId: string): Promise<CitationStats> => {
  const response = await api.get(`/citations/notes/${noteId}/stats`);
  return response.data;
};

// ==================== Reorder Citations ====================

/**
 * Reorder citations for a note
 */
export const reorderCitations = async (
  noteId: string,
  citationIds: string[]
): Promise<void> => {
  await api.put(`/citations/notes/${noteId}/reorder`, citationIds);
};

// ==================== Citation Rendering ====================

/**
 * Reference entry in the bibliography
 */
export interface ReferenceEntry {
  referencedNoteId: string;
  publicId: string;
  label: string;
  formatted: string;
  title: string;
  authors?: string;
  year?: number;
  noteType?: string;
}

/**
 * Result of rendering citations for a note
 */
export interface CitationRenderResult {
  noteId: string;
  style: string;
  processedMarkdown: string;
  inlineLabels: Record<string, string>;  // publicId -> formatted inline citation
  references: ReferenceEntry[];
  warnings?: string[];
}

/**
 * Render citations for a note with formatted inline labels and references
 */
export const renderCitations = async (
  noteId: string,
  style: string = 'APA'
): Promise<CitationRenderResult> => {
  const response = await api.get(`/citations/notes/${noteId}/render`, {
    params: { style },
  });
  return response.data;
};
