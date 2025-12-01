/**
 * Citation parser utilities for processing @note:PUBLIC_ID markers in markdown
 */

export const CITATION_PATTERN = /@note:([A-Za-z0-9_-]+)/g;

export interface ParsedCitation {
  fullMatch: string;
  publicId: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Extract all citation markers from markdown content
 */
export function extractCitations(content: string): ParsedCitation[] {
  const citations: ParsedCitation[] = [];
  const regex = new RegExp(CITATION_PATTERN.source, 'g');
  let match;
  while ((match = regex.exec(content)) !== null) {
    citations.push({
      fullMatch: match[0],
      publicId: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }
  return citations;
}

/**
 * Replace citation markers with rendered inline labels
 * @param content Original markdown with @note:PUBLIC_ID markers
 * @param inlineLabels Map of publicId -> rendered label like "(Smith, 2021)"
 */
export function replaceCitations(
  content: string,
  inlineLabels: Record<string, string>
): string {
  return content.replace(CITATION_PATTERN, (match, publicId) => {
    return inlineLabels[publicId] || match;
  });
}

/**
 * Create a citation marker for a given publicId
 */
export function createCitationMarker(publicId: string): string {
  return `@note:${publicId}`;
}

/**
 * Check if a string position is inside a citation marker
 */
export function isInsideCitation(content: string, position: number): ParsedCitation | null {
  const citations = extractCitations(content);
  for (const cite of citations) {
    if (position >= cite.startIndex && position <= cite.endIndex) {
      return cite;
    }
  }
  return null;
}

/**
 * Get citation at cursor position in editor
 */
export function getCitationAtCursor(content: string, cursorPos: number): ParsedCitation | null {
  return isInsideCitation(content, cursorPos);
}

/**
 * Check if the character before cursor is @ (for triggering popup)
 */
export function shouldTriggerCitationPopup(content: string, cursorPos: number): boolean {
  if (cursorPos === 0) return false;
  const charBefore = content.charAt(cursorPos - 1);
  return charBefore === '@';
}

/**
 * Get search query after @ for filtering citation suggestions
 */
export function getCitationSearchQuery(content: string, cursorPos: number): string | null {
  // Look backwards for @ character
  let atPos = -1;
  for (let i = cursorPos - 1; i >= 0; i--) {
    const char = content.charAt(i);
    if (char === '@') {
      atPos = i;
      break;
    }
    if (/\s/.test(char)) break; // Stop at whitespace
  }
  if (atPos === -1) return null;
  return content.substring(atPos + 1, cursorPos);
}
