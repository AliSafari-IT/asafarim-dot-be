import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ReferenceList from './ReferenceList';
import type { CitationRenderResult } from '../../api/citationApi';
import { CITATION_PATTERN } from '../../utils/citationParser';
import './MarkdownWithCitations.css';

interface MarkdownWithCitationsProps {
  content: string;
  renderResult?: CitationRenderResult;
  showReferences?: boolean;
}

export default function MarkdownWithCitations({
  content,
  renderResult,
  showReferences = true,
}: MarkdownWithCitationsProps) {
  // Replace @note:ID markers with formatted inline citations directly in the markdown
  const processedContent = useMemo(() => {
    if (!renderResult || !renderResult.inlineLabels) {
      // No render result - just show the raw markers as placeholder text
      return content.replace(CITATION_PATTERN, (_match, publicId) => {
        return `[📚 ${publicId}]`;
      });
    }

    // Replace each @note:ID with the formatted citation label
    const regex = new RegExp(CITATION_PATTERN.source, 'g');
    return content.replace(regex, (_match, publicId) => {
      const label = renderResult.inlineLabels[publicId];
      if (label) {
        // Return the formatted citation as bold text with link styling
        return `${label}`;
      }
      // Fallback if no label found
      return `[📚 ${publicId}]`;
    });
  }, [content, renderResult]);

  return (
    <div className="markdown-with-citations">
      <div className="markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {processedContent}
        </ReactMarkdown>
      </div>
      {showReferences && renderResult && renderResult.references.length > 0 && (
        <ReferenceList references={renderResult.references} />
      )}
    </div>
  );
}
