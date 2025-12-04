import type { NoteType, CitationStyle } from './bibliography';

// Re-export common types
export type { NoteType, CitationStyle } from './bibliography';

/**
 * Citation relationship between two notes
 */
export interface NoteCitation {
  id: string;
  noteId: string;
  noteTitle: string;
  referencedNoteId: string;
  referencedNoteTitle: string;
  referencedNoteType?: NoteType;
  referencedNoteAuthors?: string;
  referencedNoteYear?: number;
  citationOrder?: number;
  pageReference?: string;
  inlineMarker?: string;
  context?: string;
  firstPosition?: number;
  citationCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request to create a citation
 */
export interface CreateCitationRequest {
  pageReference?: string;
  inlineMarker?: string;
  context?: string;
  firstPosition?: number;
  citationCount?: number;
}

/**
 * Request to update citation metadata
 */
export interface UpdateCitationRequest {
  pageReference?: string;
  inlineMarker?: string;
  context?: string;
  firstPosition?: number;
  citationCount?: number;
}

/**
 * Summary of a note that is cited by the current note
 */
export interface CitedNote {
  citationId: string;
  noteId: string;
  publicId?: string;
  title: string;
  authors?: string;
  publicationYear?: number;
  noteType?: NoteType;
  citationKey?: string;
  citationOrder?: number;
  pageReference?: string;
  inlineMarker?: string;
  context?: string;
}

/**
 * Summary of a note that cites the current note
 */
export interface CitingNote {
  citationId: string;
  noteId: string;
  title: string;
  authors?: string;
  noteType?: NoteType;
  context?: string;
  citedAt: string;
}

/**
 * Citation statistics for a note
 */
export interface CitationStats {
  noteId: string;
  outgoingCitations: number;  // How many notes this note cites
  incomingCitations: number;  // How many notes cite this note
}

/**
 * Extended note with academic metadata (for knowledge graph)
 */
export interface AcademicNote {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  abstractText?: string;
  keywords?: string;
  noteType: NoteType;
  citationStyle: CitationStyle;
  
  // Academic metadata
  authors?: string;
  publicationYear?: number;
  journalName?: string;
  publisher?: string;
  pages?: string;
  doi?: string;
  url?: string;
  isbn?: string;
  issn?: string;
  edition?: string;
  volume?: string;
  issue?: string;
  accessedDate?: string;
  citationKey?: string;
  favorite: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  
  // Citation stats
  citationStats?: CitationStats;
}
