/**
 * CodeMirror 6 Editor Extensions
 * 
 * Clean, modular extension configuration for the Markdown editor.
 * All extensions use official CodeMirror APIs.
 */

import { EditorState, StateField, StateEffect, RangeSetBuilder } from '@codemirror/state';
import { 
  EditorView, 
  keymap, 
  Decoration, 
  type DecorationSet,
  placeholder as cmPlaceholder
} from '@codemirror/view';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { 
  syntaxHighlighting, 
  defaultHighlightStyle, 
  bracketMatching,
  indentOnInput
} from '@codemirror/language';
import { autocompletion } from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';

import { createCitationCompletion } from './citationCompletion';
import { extractCitations } from '../../utils/citationParser';

// ============ Citation Decorations ============

// Citation decoration mark
const citationMark = Decoration.mark({
  class: 'cm-citation-marker',
  attributes: { 'data-citation': 'true' }
});

// State effect to update citations
const updateCitations = StateEffect.define<void>();

// State field for citation decorations
export const citationDecorations = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    
    // Rebuild decorations when document changes
    if (tr.docChanged || tr.effects.some(e => e.is(updateCitations))) {
      const builder = new RangeSetBuilder<Decoration>();
      const content = tr.state.doc.toString();
      const citations = extractCitations(content);
      
      for (const cite of citations) {
        builder.add(cite.startIndex, cite.endIndex, citationMark);
      }
      
      return builder.finish();
    }
    
    return decorations;
  },
  provide: f => EditorView.decorations.from(f)
});

// ============ Markdown Formatting Commands ============

export function wrapSelection(view: EditorView, prefix: string, suffix: string = prefix): boolean {
  const { from, to } = view.state.selection.main;
  const selectedText = view.state.sliceDoc(from, to);
  
  view.dispatch({
    changes: { from, to, insert: `${prefix}${selectedText}${suffix}` },
    selection: { anchor: from + prefix.length, head: to + prefix.length }
  });
  
  return true;
}

export function insertAtCursor(view: EditorView, text: string): boolean {
  const pos = view.state.selection.main.head;
  view.dispatch({
    changes: { from: pos, insert: text },
    selection: { anchor: pos + text.length }
  });
  return true;
}

// ============ Keymaps ============

// Custom keymap for markdown shortcuts
export const markdownKeymap = keymap.of([
  { key: 'Mod-b', run: (view) => wrapSelection(view, '**'), preventDefault: true },
  { key: 'Mod-i', run: (view) => wrapSelection(view, '*'), preventDefault: true },
  { key: 'Mod-k', run: (view) => wrapSelection(view, '[', '](url)'), preventDefault: true },
  { key: 'Mod-`', run: (view) => wrapSelection(view, '`'), preventDefault: true },
  { key: 'Mod-Shift-k', run: (view) => wrapSelection(view, '```\n', '\n```'), preventDefault: true },
  { key: 'Mod-Shift-1', run: (view) => insertAtCursor(view, '# '), preventDefault: true },
  { key: 'Mod-Shift-2', run: (view) => insertAtCursor(view, '## '), preventDefault: true },
  { key: 'Mod-Shift-3', run: (view) => insertAtCursor(view, '### '), preventDefault: true },
  { key: 'Mod-Shift-l', run: (view) => insertAtCursor(view, '- '), preventDefault: true },
  { key: 'Mod-Shift-o', run: (view) => insertAtCursor(view, '1. '), preventDefault: true },
  { key: 'Mod-Shift-q', run: (view) => insertAtCursor(view, '> '), preventDefault: true },
  { key: 'Mod-/', run: (view) => wrapSelection(view, '~~'), preventDefault: true },
]);

// ============ Themes ============

// Light theme based on CSS custom properties
export const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
    fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
  },
  '.cm-content': {
    padding: '16px',
    minHeight: '200px',
    caretColor: 'var(--color-primary, #3b82f6)',
  },
  '.cm-focused': {
    outline: 'none',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'inherit',
  },
  '.cm-line': {
    padding: '2px 0',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--color-primary-muted, #3b82f633) !important',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--bg-hover-color, #f1f5f9)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--color-surface-muted, #f8fafc)',
    color: 'var(--color-text-muted, #64748b)',
    border: 'none',
    borderRight: '1px solid var(--color-border, #e2e8f0)',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--color-primary, #3b82f6)',
    borderLeftWidth: '2px',
  },
  '&.cm-focused .cm-matchingBracket': {
    backgroundColor: 'var(--color-success-muted, #10b98133)',
    outline: '1px solid var(--color-success, #10b981)',
  },
  '.cm-placeholder': {
    color: 'var(--color-text-muted, #94a3b8)',
    fontStyle: 'italic',
  },
  '.cm-citation-marker': {
    backgroundColor: 'var(--color-primary-muted, #3b82f620)',
    borderRadius: '4px',
    padding: '0 4px',
    color: 'var(--color-primary, #3b82f6)',
    fontWeight: '500',
  },
}, { dark: false });

// Dark theme override
export const darkTheme = EditorView.theme({
  '.cm-activeLine': {
    backgroundColor: 'var(--bg-hover-color, #1e293b)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--color-surface-muted, #0f172a)',
    color: 'var(--color-text-muted, #64748b)',
  },
}, { dark: true });

// ============ Extension Builder ============

export interface EditorExtensionsConfig {
  isDark: boolean;
  placeholder: string;
  excludeNoteId?: string;
  onChange: (value: string) => void;
}

/**
 * Create the complete set of editor extensions
 */
export function createEditorExtensions(config: EditorExtensionsConfig) {
  const { isDark, placeholder, excludeNoteId, onChange } = config;
  
  // Create citation autocomplete with proper configuration
  const citationAutocomplete = autocompletion({
    override: [createCitationCompletion(excludeNoteId)],
    activateOnTyping: true,
    icons: false,
    optionClass: () => 'cm-citation-option',
  });

  return [
    // Core editing
    history(),
    indentOnInput(),
    bracketMatching(),
    highlightSelectionMatches(),
    
    // Markdown support
    markdown({ base: markdownLanguage }),
    syntaxHighlighting(defaultHighlightStyle),
    
    // Citation features
    citationAutocomplete,
    citationDecorations,
    
    // Theming
    editorTheme,
    isDark ? darkTheme : [],
    cmPlaceholder(placeholder),
    
    // Keymaps
    markdownKeymap,
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...searchKeymap,
      ...lintKeymap,
      indentWithTab,
    ]),
    
    // Change listener
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChange(update.state.doc.toString());
      }
    }),
    
    // Line wrapping
    EditorView.lineWrapping,
  ];
}

/**
 * Create initial editor state
 */
export function createEditorState(doc: string, extensions: ReturnType<typeof createEditorExtensions>) {
  return EditorState.create({
    doc,
    extensions,
  });
}
