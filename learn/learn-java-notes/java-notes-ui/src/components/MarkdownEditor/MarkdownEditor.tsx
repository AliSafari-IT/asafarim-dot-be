import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
import { 
  autocompletion, 
  type CompletionContext, 
  type CompletionResult,
  type Completion
} from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CITATION_PATTERN, extractCitations } from '../../utils/citationParser';
import { getNotes } from '../../api/notesApi';
import './MarkdownEditor.css';

// Types
interface NoteOption {
  id: string;
  publicId?: string;
  title: string;
  authors?: string;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  excludeNoteId?: string;
  className?: string;
  minHeight?: number;
  showPreview?: boolean;
}

// Citation decoration mark
const citationMark = Decoration.mark({
  class: 'cm-citation-marker',
  attributes: { 'data-citation': 'true' }
});

// State effect to update citations
const updateCitations = StateEffect.define<void>();

// State field for citation decorations
const citationDecorations = StateField.define<DecorationSet>({
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
        // Add mark decoration for the full citation
        builder.add(cite.startIndex, cite.endIndex, citationMark);
      }
      
      return builder.finish();
    }
    
    return decorations;
  },
  provide: f => EditorView.decorations.from(f)
});

// Cache for notes to avoid repeated API calls
let notesCache: NoteOption[] | null = null;
let notesCacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

async function fetchNotesForCompletion(excludeNoteId?: string): Promise<NoteOption[]> {
  const now = Date.now();
  if (notesCache && (now - notesCacheTime) < CACHE_TTL) {
    return excludeNoteId 
      ? notesCache.filter(n => n.id !== excludeNoteId)
      : notesCache;
  }
  
  try {
    const notes = await getNotes();
    notesCache = notes.map((n: { id: string; publicId?: string; title: string; authors?: string }) => ({
      id: n.id,
      publicId: n.publicId,
      title: n.title,
      authors: n.authors,
    }));
    notesCacheTime = now;
    return excludeNoteId 
      ? notesCache.filter(n => n.id !== excludeNoteId)
      : notesCache;
  } catch {
    console.error('Failed to fetch notes for completion');
    return [];
  }
}

// Create citation completion source
function createCitationCompletion(excludeNoteId?: string) {
  return async (context: CompletionContext): Promise<CompletionResult | null> => {
    // Match @word pattern - trigger on @ followed by optional word characters
    const word = context.matchBefore(/@[\w-]*/);
    if (!word) return null;
    
    // Only trigger if we're at the @ or after it
    if (word.from === word.to && !context.explicit) return null;
    
    const notes = await fetchNotesForCompletion(excludeNoteId);
    const searchText = word.text.slice(1).toLowerCase(); // Remove @ prefix
    
    const options: Completion[] = notes
      .filter(note => 
        note.title.toLowerCase().includes(searchText) ||
        note.authors?.toLowerCase().includes(searchText) ||
        note.publicId?.toLowerCase().includes(searchText)
      )
      .slice(0, 15)
      .map(note => ({
        label: note.title,
        detail: note.authors ? `${note.authors}` : undefined,
        type: 'text',
        apply: `@note:${note.publicId || note.id}`,
        boost: note.title.toLowerCase().startsWith(searchText) ? 1 : 0,
      }));
    
    return {
      from: word.from,
      options,
      filter: false, // We already filtered
    };
  };
}

// Markdown formatting commands
function wrapSelection(view: EditorView, prefix: string, suffix: string = prefix): boolean {
  const { from, to } = view.state.selection.main;
  const selectedText = view.state.sliceDoc(from, to);
  
  view.dispatch({
    changes: { from, to, insert: `${prefix}${selectedText}${suffix}` },
    selection: { anchor: from + prefix.length, head: to + prefix.length }
  });
  
  return true;
}

function insertAtCursor(view: EditorView, text: string): boolean {
  const pos = view.state.selection.main.head;
  view.dispatch({
    changes: { from: pos, insert: text },
    selection: { anchor: pos + text.length }
  });
  return true;
}

// Custom keymap for markdown shortcuts
const markdownKeymap = keymap.of([
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

// Dark/Light theme based on CSS custom properties
const editorTheme = EditorView.theme({
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
  '.cm-citation-badge': {
    display: 'inline-block',
    backgroundColor: 'var(--color-primary, #3b82f6)',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '12px',
    marginLeft: '4px',
    verticalAlign: 'middle',
  },
}, { dark: false });

// Dark theme override
const darkTheme = EditorView.theme({
  '.cm-activeLine': {
    backgroundColor: 'var(--bg-hover-color, #1e293b)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--color-surface-muted, #0f172a)',
    color: 'var(--color-text-muted, #64748b)',
  },
}, { dark: true });

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing in Markdown...\n\n# Heading\n**bold** *italic* `code`\n\nType @ to insert citations',
  excludeNoteId,
  className = '',
  minHeight = 300,
  showPreview = true,
}: MarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [splitView, setSplitView] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDark = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDark(theme === 'dark');
    };
    checkDark();
    
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['data-theme'] 
    });
    
    return () => observer.disconnect();
  }, []);

  // Initialize CodeMirror
  useEffect(() => {
    if (!editorRef.current) return;

    // Create citation autocomplete with proper configuration
    const citationAutocomplete = autocompletion({
      override: [createCitationCompletion(excludeNoteId)],
      activateOnTyping: true,
      icons: false,
    });

    const extensions = [
      history(),
      indentOnInput(),
      bracketMatching(),
      highlightSelectionMatches(),
      markdown({ base: markdownLanguage }),
      syntaxHighlighting(defaultHighlightStyle),
      citationAutocomplete,
      citationDecorations,
      editorTheme,
      isDark ? darkTheme : [],
      cmPlaceholder(placeholder),
      markdownKeymap,
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...searchKeymap,
        ...lintKeymap,
        indentWithTab,
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      }),
      EditorView.lineWrapping,
    ];

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark, placeholder, excludeNoteId]); // Re-init on theme change or excludeNoteId change

  // Sync external value changes
  useEffect(() => {
    if (!viewRef.current) return;
    
    const currentValue = viewRef.current.state.doc.toString();
    if (value !== currentValue) {
      viewRef.current.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value }
      });
    }
  }, [value]);

  // Toolbar button handler
  const handleToolbarAction = useCallback((action: string) => {
    if (!viewRef.current) return;
    const view = viewRef.current;
    
    switch (action) {
      case 'bold':
        wrapSelection(view, '**');
        break;
      case 'italic':
        wrapSelection(view, '*');
        break;
      case 'strikethrough':
        wrapSelection(view, '~~');
        break;
      case 'code':
        wrapSelection(view, '`');
        break;
      case 'codeblock':
        wrapSelection(view, '```\n', '\n```');
        break;
      case 'link':
        wrapSelection(view, '[', '](url)');
        break;
      case 'image':
        insertAtCursor(view, '![alt](image-url)');
        break;
      case 'h1':
        insertAtCursor(view, '# ');
        break;
      case 'h2':
        insertAtCursor(view, '## ');
        break;
      case 'h3':
        insertAtCursor(view, '### ');
        break;
      case 'ul':
        insertAtCursor(view, '- ');
        break;
      case 'ol':
        insertAtCursor(view, '1. ');
        break;
      case 'quote':
        insertAtCursor(view, '> ');
        break;
      case 'hr':
        insertAtCursor(view, '\n---\n');
        break;
      case 'table':
        insertAtCursor(view, '\n| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n');
        break;
      case 'citation':
        // Insert @ and trigger autocomplete
        insertAtCursor(view, '@');
        // Use CodeMirror's startCompletion to trigger the autocomplete popup
        import('@codemirror/autocomplete').then(({ startCompletion }) => {
          startCompletion(view);
        });
        break;
    }
    
    view.focus();
  }, []);

  // Processed content for preview (replace citations with readable format)
  const previewContent = useMemo(() => {
    // Replace @note:PUBLIC_ID with a readable format for preview
    // In the actual saved note, renderCitations API will format it properly
    return value.replace(CITATION_PATTERN, (_match, publicId) => {
      return `[📚 ${publicId}]`;
    });
  }, [value]);

  return (
    <div className={`markdown-editor ${isDark ? 'dark' : 'light'} ${className}`}>
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button type="button" onClick={() => handleToolbarAction('bold')} title="Bold (Ctrl+B)">
            <strong>B</strong>
          </button>
          <button type="button" onClick={() => handleToolbarAction('italic')} title="Italic (Ctrl+I)">
            <em>I</em>
          </button>
          <button type="button" onClick={() => handleToolbarAction('strikethrough')} title="Strikethrough (Ctrl+/)">
            <s>S</s>
          </button>
          <button type="button" onClick={() => handleToolbarAction('code')} title="Inline Code (Ctrl+`)">
            {'</>'}
          </button>
        </div>
        
        <div className="toolbar-divider" />
        
        <div className="toolbar-group">
          <button type="button" onClick={() => handleToolbarAction('h1')} title="Heading 1 (Ctrl+Shift+1)">
            H1
          </button>
          <button type="button" onClick={() => handleToolbarAction('h2')} title="Heading 2 (Ctrl+Shift+2)">
            H2
          </button>
          <button type="button" onClick={() => handleToolbarAction('h3')} title="Heading 3 (Ctrl+Shift+3)">
            H3
          </button>
        </div>
        
        <div className="toolbar-divider" />
        
        <div className="toolbar-group">
          <button type="button" onClick={() => handleToolbarAction('ul')} title="Bullet List (Ctrl+Shift+L)">
            •
          </button>
          <button type="button" onClick={() => handleToolbarAction('ol')} title="Numbered List (Ctrl+Shift+O)">
            1.
          </button>
          <button type="button" onClick={() => handleToolbarAction('quote')} title="Quote (Ctrl+Shift+Q)">
            "
          </button>
        </div>
        
        <div className="toolbar-divider" />
        
        <div className="toolbar-group">
          <button type="button" onClick={() => handleToolbarAction('link')} title="Link (Ctrl+K)">
            🔗
          </button>
          <button type="button" onClick={() => handleToolbarAction('image')} title="Image">
            🖼️
          </button>
          <button type="button" onClick={() => handleToolbarAction('codeblock')} title="Code Block (Ctrl+Shift+K)">
            {'{ }'}
          </button>
          <button type="button" onClick={() => handleToolbarAction('table')} title="Table">
            📊
          </button>
        </div>
        
        <div className="toolbar-divider" />
        
        <div className="toolbar-group">
          <button 
            type="button" 
            onClick={() => handleToolbarAction('citation')} 
            title="Insert Citation (@)"
            className="citation-btn"
          >
            📚 Cite
          </button>
        </div>
        
        <div className="toolbar-spacer" />
        
        {showPreview && (
          <div className="toolbar-group view-toggle">
            <button 
              type="button"
              className={activeTab === 'write' && !splitView ? 'active' : ''}
              onClick={() => { setActiveTab('write'); setSplitView(false); }}
              title="Write"
            >
              ✏️ Write
            </button>
            <button 
              type="button"
              className={activeTab === 'preview' && !splitView ? 'active' : ''}
              onClick={() => { setActiveTab('preview'); setSplitView(false); }}
              title="Preview"
            >
              👁️ Preview
            </button>
            <button 
              type="button"
              className={splitView ? 'active' : ''}
              onClick={() => setSplitView(!splitView)}
              title="Split View"
            >
              ⬜⬜
            </button>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div 
        className={`editor-content ${splitView ? 'split' : ''}`}
        style={{ minHeight }}
      >
        {/* Write Pane - Always render but hide with CSS to preserve CodeMirror state */}
        <div 
          ref={editorRef} 
          className="editor-pane codemirror-wrapper"
          style={{ display: (activeTab === 'write' || splitView) ? 'block' : 'none' }}
        />
        
        {/* Preview Pane */}
        {(activeTab === 'preview' || splitView) && showPreview && (
          <div className="preview-pane">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom rendering for code blocks
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <pre className={`code-block language-${match[1]}`}>
                      <code {...props}>{children}</code>
                    </pre>
                  ) : (
                    <code className="inline-code" {...props}>{children}</code>
                  );
                },
              }}
            >
              {previewContent}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="editor-footer">
        <span className="shortcuts-hint">
          <kbd>Ctrl</kbd>+<kbd>B</kbd> Bold &nbsp;
          <kbd>Ctrl</kbd>+<kbd>I</kbd> Italic &nbsp;
          <kbd>Ctrl</kbd>+<kbd>K</kbd> Link &nbsp;
          <kbd>@</kbd> Citation
        </span>
      </div>
    </div>
  );
}
