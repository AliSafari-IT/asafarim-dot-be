import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import graphService, { Graph, Node, Edge, CreateGraphRequest } from '../api/graphService';
import GraphCanvas from '../components/GraphCanvas';
import PathfindingPanel from '../components/PathfindingPanel';
import './GraphEditorPage.css';

export default function GraphEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';

  const [graphName, setGraphName] = useState('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFromNode, setSelectedFromNode] = useState<number | null>(null);
  const [edgeWeight, setEdgeWeight] = useState(1);
  const [isDirected, setIsDirected] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      loadGraph(parseInt(id));
    }
  }, [id, isNew]);

  const loadGraph = async (graphId: number) => {
    try {
      setLoading(true);
      const graph = await graphService.getGraph(graphId);
      setGraphName(graph.name);
      setNodes(graph.nodes);
      setEdges(graph.edges);
    } catch (err) {
      console.error('Failed to load graph:', err);
      setError('Failed to load graph');
    } finally {
      setLoading(false);
    }
  };

  const addNode = () => {
    const newNode: Node = {
      id: Math.max(0, ...nodes.map(n => n.id)) + 1,
      label: `Node ${nodes.length + 1}`,
      x: Math.random() * 400 + 50,
      y: Math.random() * 300 + 50,
    };
    setNodes([...nodes, newNode]);
  };

  const updateNode = (nodeId: number, updates: Partial<Node>) => {
    setNodes(nodes.map(n => (n.id === nodeId ? { ...n, ...updates } : n)));
  };

  const deleteNode = (nodeId: number) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setEdges(edges.filter(e => e.fromNodeId !== nodeId && e.toNodeId !== nodeId));
  };

  const addEdge = (fromNodeId: number, toNodeId: number) => {
    if (fromNodeId === toNodeId) {
      setError('Cannot create self-loops');
      return;
    }

    if (edgeWeight <= 0) {
      setError('Edge weight must be positive');
      return;
    }

    const newEdge: Edge = {
      id: Math.max(0, ...edges.map(e => e.id)) + 1,
      fromNodeId,
      toNodeId,
      weight: edgeWeight,
      isDirected,
    };

    setEdges([...edges, newEdge]);
    setSelectedFromNode(null);
    setEdgeWeight(1);
    setIsDirected(false);
    setError(null);
  };

  const deleteEdge = (edgeId: number) => {
    setEdges(edges.filter(e => e.id !== edgeId));
  };

  const saveGraph = async () => {
    if (!graphName.trim()) {
      setError('Graph name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const request: CreateGraphRequest = {
        name: graphName,
        nodes: nodes.map(n => ({
          label: n.label,
          x: n.x,
          y: n.y,
          metadata: n.metadata,
        })),
        edges: edges.map(e => ({
          fromNodeId: e.fromNodeId,
          toNodeId: e.toNodeId,
          weight: e.weight,
          isDirected: e.isDirected,
        })),
      };

      if (isNew) {
        const graph = await graphService.createGraph(request);
        navigate(`/graphs/${graph.id}`);
      } else if (id) {
        await graphService.updateGraph(parseInt(id), request);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to save graph:', err);
      setError('Failed to save graph');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading" data-testid="graph-editor-loading">Loading...</div>;
  }

  return (
    <div className="graph-editor-page" data-testid="graph-editor-page">
      <header className="editor-header" data-testid="graph-editor-header">
        <button onClick={() => navigate('/graphs')} className="btn-back">
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="header-content">
          <input
            type="text"
            value={graphName}
            onChange={(e) => setGraphName(e.target.value)}
            placeholder="Graph name"
            className="graph-name-input"
            data-testid="graph-name-input"
          />
        </div>
        <div className="header-actions">
          <ButtonComponent onClick={saveGraph} variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Graph'}
          </ButtonComponent>
        </div>
      </header>

      {error && (
        <div className="error-banner" data-testid="graph-editor-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="editor-container">
        <div className="editor-left">
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            onNodeClick={(nodeId) => {
              if (selectedFromNode === null) {
                setSelectedFromNode(nodeId);
              } else if (selectedFromNode !== nodeId) {
                addEdge(selectedFromNode, nodeId);
              } else {
                setSelectedFromNode(null);
              }
            }}
            onNodeDrag={(nodeId, x, y) => updateNode(nodeId, { x, y })}
            onNodeDelete={deleteNode}
            selectedFromNode={selectedFromNode}
            data-testid="graph-canvas"
          />

          <div className="editor-controls" data-testid="graph-controls">
            <ButtonComponent onClick={addNode} variant="secondary">
              <Plus size={20} />
              Add Node
            </ButtonComponent>
          </div>
        </div>

        <div className="editor-right">
          <PathfindingPanel graphId={id ? parseInt(id) : 0} nodes={nodes} />

          <div className="edges-panel" data-testid="edges-panel">
            <h3>Edges</h3>
            {selectedFromNode !== null && (
              <div className="edge-creator" data-testid="edge-creator">
                <p>Creating edge from Node {selectedFromNode}</p>
                <div className="edge-form">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={edgeWeight}
                    onChange={(e) => setEdgeWeight(parseFloat(e.target.value))}
                    placeholder="Weight"
                    data-testid="edge-weight-input"
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={isDirected}
                      onChange={(e) => setIsDirected(e.target.checked)}
                      data-testid="edge-directed-checkbox"
                    />
                    Directed
                  </label>
                  <button
                    onClick={() => setSelectedFromNode(null)}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <div className="edges-list" data-testid="edges-list">
              {edges.map((edge) => (
                <div key={edge.id} className="edge-item" data-testid={`edge-item-${edge.id}`}>
                  <span>
                    {nodes.find(n => n.id === edge.fromNodeId)?.label} →{' '}
                    {nodes.find(n => n.id === edge.toNodeId)?.label} ({edge.weight})
                    {edge.isDirected && ' [→]'}
                  </span>
                  <button
                    onClick={() => deleteEdge(edge.id)}
                    className="btn-delete-edge"
                    data-testid={`edge-delete-btn-${edge.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
