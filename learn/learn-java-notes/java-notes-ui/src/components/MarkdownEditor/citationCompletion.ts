// learn/lear-java-notes/java-notes-ui/src/components/MarkdownEditor/citationCompletion.ts
/**
 * Citation Autocomplete Extension for CodeMirror 6
 * 
 * Provides @-triggered autocomplete for inserting citation references.
 * Uses CodeMirror's official autocomplete API - no manual DOM manipulation.
 */

import { 
  type CompletionContext, 
  type CompletionResult, 
  type Completion 
} from '@codemirror/autocomplete';
import { getNotes, type StudyNote } from '../../api/notesApi';

// Cache for notes to avoid repeated API calls
let notesCache: StudyNote[] | null = null;
let notesCacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

/**
 * Fetch notes for completion, with caching
 */
async function fetchNotesForCompletion(excludeNoteId?: string): Promise<StudyNote[]> {
  const now = Date.now();
  
  // Return cached notes if still valid
  if (notesCache && (now - notesCacheTime) < CACHE_TTL) {
    return excludeNoteId 
      ? notesCache.filter(n => n.id !== excludeNoteId)
      : notesCache;
  }
  
  try {
    const notes = await getNotes();
    notesCache = notes;
    notesCacheTime = now;
    return excludeNoteId 
      ? notesCache.filter(n => n.id !== excludeNoteId)
      : notesCache;
  } catch (error) {
    console.error('Failed to fetch notes for citation completion:', error);
    return [];
  }
}

/**
 * Clear the notes cache (call when notes are created/updated)
 */
export function clearCitationCache(): void {
  notesCache = null;
  notesCacheTime = 0;
}

/**
 * Format author name for display (e.g., "John Smith" -> "Smith, J.")
 */
function formatAuthorShort(authors?: string): string {
  if (!authors) return '';
  
  const firstAuthor = authors.split(',')[0].trim();
  const parts = firstAuthor.split(' ');
  
  if (parts.length >= 2) {
    const lastName = parts[parts.length - 1];
    const firstInitial = parts[0].charAt(0).toUpperCase();
    return `${lastName}, ${firstInitial}.`;
  }
  
  return firstAuthor;
}

/**
 * Create the citation completion source
 * 
 * @param excludeNoteId - Optional note ID to exclude from suggestions (current note)
 * @returns CompletionSource function for CodeMirror autocomplete
 */
export function createCitationCompletion(excludeNoteId?: string) {
  return async (context: CompletionContext): Promise<CompletionResult | null> => {
    // Match @word pattern - trigger on @ followed by optional word characters
    // This matches: @, @abc, @note-title, @some_id
    const word = context.matchBefore(/@[\w:-]*/);
    
    // Don't trigger if no @ found
    if (!word) return null;
    
    // Don't trigger for empty match unless explicitly requested
    if (word.from === word.to && !context.explicit) return null;
    
    // Fetch available notes
    const notes = await fetchNotesForCompletion(excludeNoteId);
    
    // Extract search text (everything after @)
    const searchText = word.text.slice(1).toLowerCase();
    
    // Filter and map notes to completion options
    const options: Completion[] = notes
      .filter(note => {
        // If no search text, show all
        if (!searchText) return true;
        
        // Match against title, authors, publicId, or citationKey
        return (
          note.title.toLowerCase().includes(searchText) ||
          note.authors?.toLowerCase().includes(searchText) ||
          note.publicId?.toLowerCase().includes(searchText) ||
          note.citationKey?.toLowerCase().includes(searchText)
        );
      })
      .slice(0, 20) // Limit results
      .map(note => {
        const authorShort = formatAuthorShort(note.authors);
        const year = note.publicationYear ? `${note.publicationYear}` : '';
        const detail = [authorShort, year].filter(Boolean).join(', ');
        
        return {
          // Main display label
          label: note.title,
          // Secondary info (author, year)
          detail: detail || undefined,
          // Additional info shown in tooltip
          info: note.authors || undefined,
          // Type icon
          type: 'text',
          // What gets inserted when selected
          apply: `@note:${note.publicId || note.id}`,
          // Boost exact matches
          boost: note.title.toLowerCase().startsWith(searchText) ? 2 : 
                 note.publicId?.toLowerCase().startsWith(searchText) ? 1 : 0,
        };
      });
    
    // Return completion result
    return {
      from: word.from,
      options,
      filter: false, // We already filtered
    };
  };
}
