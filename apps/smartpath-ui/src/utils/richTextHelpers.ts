/**
 * Convert a JSON string (from API) to TipTap editor-compatible format
 */
export function toEditorJson(jsonString: string | null | undefined): any {
  if (!jsonString) {
    return null;
  }
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

/**
 * Convert TipTap editor JSON object to API-compatible JSON string
 */
export function toApiJsonString(jsonObject: any): string {
  if (!jsonObject) {
    return '';
  }
  return JSON.stringify(jsonObject);
}

/**
 * Extract plain text from HTML, stripping all tags and preserving readability
 */
export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) {
    return '';
  }

  // Create a temporary DOM element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Extract text content, preserving line breaks from block elements
  let text = '';
  const walker = document.createTreeWalker(
    temp,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    null
  );

  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE) {
      const content = node.textContent || '';
      if (content.trim()) {
        text += content;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      // Add newlines after block elements
      if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'PRE'].includes(element.tagName)) {
        if (text && !text.endsWith('\n')) {
          text += '\n';
        }
      }
    }
  }

  // Clean up multiple consecutive newlines
  return text
    .replace(/\n\n+/g, '\n\n')
    .trim();
}
