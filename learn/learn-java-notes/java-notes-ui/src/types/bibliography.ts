// Note Type hierarchy
export type NoteType =
  | 'SIMPLE'
  | 'EXTENDED'
  | 'CODE_SNIPPET'
  | 'TUTORIAL'
  | 'TECHNICAL_DOC'
  | 'RESEARCH'
  | 'ARTICLE'
  | 'PAPER';

export const NoteTypeLabels: Record<NoteType, { name: string; description: string; icon: string }> = {
  SIMPLE: { name: 'Simple Note', description: 'Basic note with markdown support', icon: '📝' },
  EXTENDED: { name: 'Extended Note', description: 'Structured note with sections and code blocks', icon: '📋' },
  CODE_SNIPPET: { name: 'Code Snippet', description: 'Code-focused note with syntax highlighting', icon: '💻' },
  TUTORIAL: { name: 'Tutorial', description: 'Step-by-step instructional content', icon: '📖' },
  TECHNICAL_DOC: { name: 'Technical Documentation', description: 'API documentation or technical specifications', icon: '📚' },
  RESEARCH: { name: 'Research Note', description: 'Note with citations and sources', icon: '🔬' },
  ARTICLE: { name: 'Article', description: 'Blog-style article with structured sections', icon: '📰' },
  PAPER: { name: 'Academic Paper', description: 'Full academic paper with bibliography', icon: '🎓' },
};

// Citation styles
export type CitationStyle = 'APA' | 'MLA' | 'IEEE' | 'CHICAGO' | 'HARVARD' | 'VANCOUVER' | 'BIBTEX';

export const CitationStyleLabels: Record<CitationStyle, { name: string; example: string }> = {
  APA: { name: 'APA', example: '(Author, Year)' },
  MLA: { name: 'MLA', example: '(Author Page)' },
  IEEE: { name: 'IEEE', example: '[Number]' },
  CHICAGO: { name: 'Chicago', example: '(Author Year, Page)' },
  HARVARD: { name: 'Harvard', example: '(Author Year)' },
  VANCOUVER: { name: 'Vancouver', example: '(Number)' },
  BIBTEX: { name: 'BibTeX', example: '@key' },
};

// Formatted Reference for a note (used in paper preview)
export interface FormattedReference {
  noteId: string;
  citationKey?: string;
  citationOrder?: number;
  style: CitationStyle;
  inlineCitation: string;
  fullReference: string;
  htmlReference?: string;
  bibtexEntry?: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
