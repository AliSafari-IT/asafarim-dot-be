// learn/learn-java-notes/java-notes-ui/src/components/MarkdownEditor/MarkdownEditor.tsx 

/**
 * MarkdownEditor Component
 * 
 * A CodeMirror 6 based Markdown editor with citation autocomplete support.
 * Uses official CodeMirror extensions - no manual DOM manipulation.
 */

import { useEffect, useRef, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { EditorView } from '@codemirror/view';
import { startCompletion } from '@codemirror/autocomplete';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { 
  createEditorExtensions, 
  createEditorState,
  wrapSelection,
  insertAtCursor 
} from './editorExtensions';
import { CITATION_PATTERN } from '../../utils/citationParser';
import './MarkdownEditor.css';

// ============ Types ============

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  excludeNoteId?: string;
  className?: string;
  minHeight?: number;
  showPreview?: boolean;
}

/**
 * Imperative handle for external control of the editor
 */
export interface MarkdownEditorHandle {
  /** Insert text at the current cursor position */
  insertTextAtCursor: (text: string) => void;
  /** Focus the editor */
  focus: () => void;
}

const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing in Markdown...\n\n# Heading\n**bold** *italic* `code`\n\nType @ to insert citations',
  excludeNoteId,
  className = '',
  minHeight = 300,
  showPreview = true,
}, ref) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [splitView, setSplitView] = useState(false);

  // Expose imperative handle for external control (e.g., inserting citations from sidebar)
  useImperativeHandle(ref, () => ({
    insertTextAtCursor(text: string) {
      const view = viewRef.current;
      if (!view) return;
      // Reuse the same insertAtCursor logic from editorExtensions
      insertAtCursor(view, text);
      view.focus();
    },
    focus() {
      viewRef.current?.focus();
    },
  }), []);

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

  // Initialize CodeMirror with clean extension architecture
  useEffect(() => {
    if (!editorRef.current) return;

    // Create extensions using the modular builder
    const extensions = createEditorExtensions({
      isDark,
      placeholder,
      excludeNoteId,
      onChange,
    });

    // Create editor state
    const state = createEditorState(value, extensions);

    // Create editor view
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
        // Insert @ and trigger CodeMirror's autocomplete
        insertAtCursor(view, '@');
        startCompletion(view);
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
});

export default MarkdownEditor;
