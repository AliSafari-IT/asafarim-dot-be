import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CitedNote, CitingNote } from '../../types/citation';
import './CitationGraph.css';

interface CitationGraphProps {
  noteId: string;
  noteTitle: string;
  citedNotes: CitedNote[];
  citingNotes: CitingNote[];
}

export default function CitationGraph({
  noteId,
  noteTitle,
  citedNotes,
  citingNotes,
}: CitationGraphProps) {
  const navigate = useNavigate();

  const { nodes, edges } = useMemo(() => {
    const nodeMap = new Map<string, { id: string; title: string; type: 'center' | 'cited' | 'citing' }>();
    const edgeList: Array<{ from: string; to: string; type: 'cites' | 'cited-by' }> = [];

    // Center node (current note)
    nodeMap.set(noteId, { id: noteId, title: noteTitle, type: 'center' });

    // Cited notes (this note cites them)
    citedNotes.forEach((cited) => {
      if (!nodeMap.has(cited.noteId)) {
        nodeMap.set(cited.noteId, { id: cited.noteId, title: cited.title, type: 'cited' });
      }
      edgeList.push({ from: noteId, to: cited.noteId, type: 'cites' });
    });

    // Citing notes (they cite this note)
    citingNotes.forEach((citing) => {
      if (!nodeMap.has(citing.noteId)) {
        nodeMap.set(citing.noteId, { id: citing.noteId, title: citing.title, type: 'citing' });
      }
      edgeList.push({ from: citing.noteId, to: noteId, type: 'cited-by' });
    });

    return { nodes: Array.from(nodeMap.values()), edges: edgeList };
  }, [noteId, noteTitle, citedNotes, citingNotes]);

  const handleNodeClick = (id: string) => {
    if (id !== noteId) {
      navigate(`/note/${id}`);
    }
  };

  if (citedNotes.length === 0 && citingNotes.length === 0) {
    return (
      <div className="citation-graph-empty">
        <p>No citation connections yet.</p>
        <span className="hint">Add citations using @note:ID in edit mode</span>
      </div>
    );
  }

  // Calculate positions in a radial layout
  const centerX = 200;
  const centerY = 150;
  const radius = 120;

  const getNodePosition = (index: number, _total: number, type: string) => {
    if (type === 'center') return { x: centerX, y: centerY };
    
    const citedCount = citedNotes.length;
    const citingCount = citingNotes.length;
    
    if (type === 'cited') {
      // Place cited notes on the right
      const angle = ((index / Math.max(citedCount, 1)) * Math.PI - Math.PI / 2);
      return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
    } else {
      // Place citing notes on the left
      const angle = ((index / Math.max(citingCount, 1)) * Math.PI + Math.PI / 2);
      return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
    }
  };

  let citedIndex = 0;
  let citingIndex = 0;

  return (
    <div className="citation-graph">
      <div className="graph-legend">
        <span className="legend-item"><span className="dot center"></span> Current Note</span>
        <span className="legend-item"><span className="dot cited"></span> References ({citedNotes.length})</span>
        <span className="legend-item"><span className="dot citing"></span> Cited By ({citingNotes.length})</span>
      </div>
      
      <svg viewBox="0 0 400 300" className="graph-svg">
        {/* Draw edges */}
        {edges.map((edge, i) => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;
          
          let fromIdx = 0, toIdx = 0;
          if (fromNode.type === 'cited') fromIdx = citedNotes.findIndex(n => n.noteId === fromNode.id);
          if (fromNode.type === 'citing') fromIdx = citingNotes.findIndex(n => n.noteId === fromNode.id);
          if (toNode.type === 'cited') toIdx = citedNotes.findIndex(n => n.noteId === toNode.id);
          if (toNode.type === 'citing') toIdx = citingNotes.findIndex(n => n.noteId === toNode.id);
          
          const from = getNodePosition(fromIdx, nodes.length, fromNode.type);
          const to = getNodePosition(toIdx, nodes.length, toNode.type);
          
          return (
            <line
              key={`edge-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className={`graph-edge ${edge.type}`}
              markerEnd="url(#arrowhead)"
            />
          );
        })}
        
        {/* Arrow marker */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-text-muted)" />
          </marker>
        </defs>
        
        {/* Draw nodes */}
        {nodes.map((node) => {
          let idx = 0;
          if (node.type === 'cited') idx = citedIndex++;
          if (node.type === 'citing') idx = citingIndex++;
          const pos = getNodePosition(idx, nodes.length, node.type);
          
          return (
            <g
              key={node.id}
              className={`graph-node ${node.type}`}
              onClick={() => handleNodeClick(node.id)}
              style={{ cursor: node.type !== 'center' ? 'pointer' : 'default' }}
            >
              <circle cx={pos.x} cy={pos.y} r={node.type === 'center' ? 25 : 20} />
              <text x={pos.x} y={pos.y + 35} textAnchor="middle" className="node-label">
                {node.title.length > 15 ? node.title.slice(0, 15) + '...' : node.title}
              </text>
              <text x={pos.x} y={pos.y + 5} textAnchor="middle" className="node-icon">
                {node.type === 'center' ? '📝' : node.type === 'cited' ? '📖' : '🔗'}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
