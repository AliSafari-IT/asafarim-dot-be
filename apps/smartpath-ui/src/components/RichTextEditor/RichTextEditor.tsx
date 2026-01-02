import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import {Table} from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code, Link as LinkIcon } from 'lucide-react';
import { useEffect } from 'react';
import './RichTextEditor.css';

function tryConvertDefinitionCardsToTable(html: string): string {
  // Convert common "two-column div row" structures into a <table>.
  // If we can't confidently detect rows, return original HTML untouched.
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const body = doc.body;

    // Heuristic: look for repeating blocks where each block has exactly 2 direct "cell-like" children.
    // Example patterns often appear as row containers with 2 divs: [term][definition]
    const candidates = Array.from(body.querySelectorAll("div"))
      .filter((d) => d.children.length === 2)
      .map((d) => ({
        el: d as HTMLDivElement,
        left: d.children[0] as HTMLElement,
        right: d.children[1] as HTMLElement,
      }))
      // Filter out tiny/noise blocks
      .filter(({ left, right }) => left.textContent?.trim() && right.textContent?.trim());

    // If we don't have enough rows, don't transform.
    if (candidates.length < 2) return html;

    // Build a clean table
    const table = doc.createElement("table");
    const tbody = doc.createElement("tbody");
    table.appendChild(tbody);

    for (const { left, right } of candidates) {
      const tr = doc.createElement("tr");
      const td1 = doc.createElement("td");
      const td2 = doc.createElement("td");

      // Preserve inline HTML inside each cell as much as possible
      td1.innerHTML = left.innerHTML || left.textContent || "";
      td2.innerHTML = right.innerHTML || right.textContent || "";

      tr.appendChild(td1);
      tr.appendChild(td2);
      tbody.appendChild(tr);
    }

    // Replace body with the table
    body.innerHTML = "";
    body.appendChild(table);

    return body.innerHTML;
  } catch {
    return html;
  }
}

interface RichTextEditorProps {
  valueJson?: any | null;
  valueHtml?: string | null;
  onChangeJson?: (json: any) => void;
  onChangeHtml?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  valueJson,
  valueHtml,
  onChangeJson,
  onChangeHtml,
  placeholder = 'Start typing...',
  disabled = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'rte-paragraph',
          },
        },
        heading: {
          HTMLAttributes: {
            class: 'rte-heading',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'rte-bullet-list',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'rte-ordered-list',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'rte-list-item',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'rte-blockquote',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'rte-code-block',
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'rte-link',
        },
      }),

      // Tables
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: valueHtml || '',
    editable: !disabled,

    editorProps: {
      transformPastedHTML: (html) => {
        // Convert "div-based cards" into <table> so TipTap can represent it structurally.
        return tryConvertDefinitionCardsToTable(html);
      },
    },

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = editor.getJSON();
      
      if (onChangeHtml) {
        onChangeHtml(html);
      }
      if (onChangeJson) {
        onChangeJson(json);
      }
    },
  });

  // Update editor content when valueHtml prop changes
  useEffect(() => {
    if (editor && valueHtml !== undefined && valueHtml !== editor.getHTML()) {
      editor.commands.setContent(valueHtml || '');
    }
  }, [valueHtml, editor]);

  if (!editor) {
    return <div className="rte-loading">Loading editor...</div>;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleH1 = () => editor.chain().focus().toggleHeading({ level: 1 }).run();
  const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleH3 = () => editor.chain().focus().toggleHeading({ level: 3 }).run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();
  const toggleCodeBlock = () => editor.chain().focus().toggleCodeBlock().run();
  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const handleToolbarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleEditorMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;

    // If user clicks the wrapper (e.g., padding / empty area),
    // TipTap won't receive the event because ProseMirror isn't there.
    if (e.target === e.currentTarget) {
      e.preventDefault();
      editor.chain().focus().run();
    }
  };

  return (
    <div className="rte-container">
      <div className="rte-toolbar">
        <button
          type="button"
          onMouseDown={handleToolbarMouseDown}
          onClick={toggleBold}
          className={`rte-toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
          title="Bold (Ctrl+B)"
          disabled={disabled}
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onMouseDown={handleToolbarMouseDown}
          onClick={toggleItalic}
          className={`rte-toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
          title="Italic (Ctrl+I)"
          disabled={disabled}
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onMouseDown={handleToolbarMouseDown}
          onClick={toggleUnderline}
          className={`rte-toolbar-button ${editor.isActive('underline') ? 'active' : ''}`}
          title="Underline (Ctrl+U)"
          disabled={disabled}
        >
          <UnderlineIcon size={18} />
        </button>

        <div className="rte-toolbar-divider" />

        <button
          type="button"
          onMouseDown={handleToolbarMouseDown}
          onClick={toggleH1}
          className={`rte-toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
          title="Heading 1"
          disabled={disabled}
        >
          <Heading1 size={18} />
        </button>
        <button
          type="button"
          onMouseDown={handleToolbarMouseDown}
          onClick={toggleH2}
          className={`rte-toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
          title="Heading 2"
          disabled={disabled}
        >
          <Heading2 size={18} />
        </button>
        <button
          type="button"
          onMouseDown={handleToolbarMouseDown}
          onClick={toggleH3}
          className={`rte-toolbar-button ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
          title="Heading 3"
          disabled={disabled}
        >
          <Heading3 size={18} />
        </button>

        <div className="rte-toolbar-divider" />

        <button
          type="button"
          onMouseDown={handleToolbarMouseDown}
          onClick={toggleBulletList}
          className={`rte-toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
          title="Bullet List"
          disabled={disabled}
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onMouseDown={handleToolbarMouseDown}
          onClick={toggleOrderedList}
          className={`rte-toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`}
          title="Ordered List"
          disabled={disabled}
        >
          <ListOrdered size={18} />
        </button>

        <div className="rte-toolbar-divider" />

        <button
          type="button"
          onMouseDown={handleToolbarMouseDown}
          onClick={toggleBlockquote}
          className={`rte-toolbar-button ${editor.isActive('blockquote') ? 'active' : ''}`}
          title="Blockquote"
          disabled={disabled}
        >
          <Quote size={18} />
        </button>
        <button
          type="button"
          onMouseDown={handleToolbarMouseDown}
          onClick={toggleCodeBlock}
          className={`rte-toolbar-button ${editor.isActive('codeBlock') ? 'active' : ''}`}
          title="Code Block"
          disabled={disabled}
        >
          <Code size={18} />
        </button>
        <button
          type="button"
          onMouseDown={handleToolbarMouseDown}
          onClick={setLink}
          className={`rte-toolbar-button ${editor.isActive('link') ? 'active' : ''}`}
          title="Add Link"
          disabled={disabled}
        >
          <LinkIcon size={18} />
        </button>
      </div>
      <EditorContent 
        editor={editor} 
        className="rte-editor"
        onMouseDown={handleEditorMouseDown}
      />
    </div>
  );
};
