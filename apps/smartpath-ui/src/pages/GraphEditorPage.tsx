import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import graphApi, { Graph, GraphNode, NodeDto, EdgeDto, CreateGraphDto, UpdateGraphDto } from '../api/graphApi';
import './GraphEditorPage.css';

export default function GraphEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isNewGraph = !id;

  const [graph, setGraph] = useState<Graph | null>(null);
  const [graphName, setGraphName] = useState('');
  const [nodes, setNodes] = useState<NodeDto[]>([]);
  const [edges, setEdges] = useState<EdgeDto[]>([]);
  const [loading, setLoading] = useState(!isNewGraph);
  const [error, setError] = useState<string | null>(null);
  const [startNodeId, setStartNodeId] = useState('');
  const [endNodeId, setEndNodeId] = useState('');
  const [pathResult, setPathResult] = useState<number[] | null>(null);

  useEffect(() => {
    if (!isNewGraph && id) {
      loadGraph(parseInt(id));
    }
  }, [id, isNewGraph]);

  const loadGraph = async (graphId: number) => {
    try {
      setLoading(true);
      const data = await graphApi.getGraphById(graphId);
      setGraph(data);
      setGraphName(data.name);
      setNodes(data.nodes.map(n => ({
        clientNodeId: n.clientNodeId,
        label: n.label,
        x: n.x,
        y: n.y,
        metadata: n.metadata,
      })));
      setEdges(data.edges.map(e => {
        const fromNode = data.nodes.find(n => n.id === e.fromNodeId);
        const toNode = data.nodes.find(n => n.id === e.toNodeId);
        return {
          fromClientNodeId: fromNode?.clientNodeId || '',
          toClientNodeId: toNode?.clientNodeId || '',
          weight: e.weight,
          isDirected: e.isDirected,
        };
      }));
    } catch (err) {
      setError('Failed to load graph');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNode = () => {
    const newClientId = `node_${Date.now()}`;
    setNodes([...nodes, {
      clientNodeId: newClientId,
      label: `Node ${nodes.length + 1}`,
      x: Math.random() * 400,
      y: Math.random() * 400,
    }]);
  };

  const handleAddEdge = () => {
    if (nodes.length < 2) {
      setError('Need at least 2 nodes to create an edge');
      return;
    }
    setEdges([...edges, {
      fromClientNodeId: nodes[0]!.clientNodeId,
      toClientNodeId: nodes[1]!.clientNodeId,
      weight: 1,
      isDirected: true,
    }]);
  };

  const handleSaveGraph = async () => {
    try {
      if (!graphName.trim()) {
        setError('Graph name is required');
        return;
      }

      const dto: CreateGraphDto | UpdateGraphDto = {
        name: graphName.trim(),
        nodes,
        edges,
      };

      let savedGraph: Graph;
      if (isNewGraph) {
        savedGraph = await graphApi.createGraph(dto as CreateGraphDto);
      } else {
        savedGraph = await graphApi.updateGraph(parseInt(id!), dto as UpdateGraphDto);
      }

      setGraph(savedGraph);
      setError(null);
      if (isNewGraph) {
        navigate(`/graphs/${savedGraph.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save graph');
      console.error(err);
    }
  };

  const handleFindPath = async () => {
    try {
      if (!graph || !startNodeId || !endNodeId) {
        setError('Select start and end nodes');
        return;
      }

      const result = await graphApi.findShortestPath(graph.id, {
        startNodeClientId: startNodeId,
        endNodeClientId: endNodeId,
        algorithm: 'Dijkstra',
      });

      setPathResult(result.pathNodeIds);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to find path');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="graph-editor-page"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="graph-editor-page">
      <header className="header">
        <div className="header-title">
          <h1>{isNewGraph ? 'Create Graph' : 'Edit Graph'}</h1>
        </div>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Graph name"
            value={graphName}
            onChange={(e) => setGraphName(e.target.value)}
            className="name-input"
          />
          <button onClick={handleSaveGraph} className="btn-primary">Save Graph</button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="editor-layout">
        <div className="canvas-area">
          <div className="canvas">
            {nodes.map((node) => (
              <div
                key={node.clientNodeId}
                className="node"
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
              >
                {node.label}
              </div>
            ))}
          </div>
        </div>

        <div className="right-panel">
          <div className="section">
            <h3>Nodes</h3>
            <button onClick={handleAddNode} className="btn-secondary">+ Add Node</button>
            <div className="node-list">
              {nodes.map((node) => (
                <div key={node.clientNodeId} className="node-item">
                  <input
                    type="text"
                    value={node.label}
                    onChange={(e) => {
                      const updated = nodes.map(n =>
                        n.clientNodeId === node.clientNodeId ? { ...n, label: e.target.value } : n
                      );
                      setNodes(updated);
                    }}
                    placeholder="Node label"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>Edges</h3>
            <button onClick={handleAddEdge} className="btn-secondary">+ Add Edge</button>
            <div className="edge-list">
              {edges.map((edge, idx) => (
                <div key={idx} className="edge-item">
                  <select
                    value={edge.fromClientNodeId}
                    onChange={(e) => {
                      const updated = edges.map((ed, i) =>
                        i === idx ? { ...ed, fromClientNodeId: e.target.value } : ed
                      );
                      setEdges(updated);
                    }}
                  >
                    <option value="">From</option>
                    {nodes.map(n => (
                      <option key={n.clientNodeId} value={n.clientNodeId}>{n.label}</option>
                    ))}
                  </select>
                  <select
                    value={edge.toClientNodeId}
                    onChange={(e) => {
                      const updated = edges.map((ed, i) =>
                        i === idx ? { ...ed, toClientNodeId: e.target.value } : ed
                      );
                      setEdges(updated);
                    }}
                  >
                    <option value="">To</option>
                    {nodes.map(n => (
                      <option key={n.clientNodeId} value={n.clientNodeId}>{n.label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={edge.weight}
                    onChange={(e) => {
                      const updated = edges.map((ed, i) =>
                        i === idx ? { ...ed, weight: parseFloat(e.target.value) } : ed
                      );
                      setEdges(updated);
                    }}
                    placeholder="Weight"
                  />
                </div>
              ))}
            </div>
          </div>

          {graph && (
            <div className="section">
              <h3>Shortest Path</h3>
              <select value={startNodeId} onChange={(e) => setStartNodeId(e.target.value)}>
                <option value="">Select start node</option>
                {nodes.map(n => (
                  <option key={n.clientNodeId} value={n.clientNodeId}>{n.label}</option>
                ))}
              </select>
              <select value={endNodeId} onChange={(e) => setEndNodeId(e.target.value)}>
                <option value="">Select end node</option>
                {nodes.map(n => (
                  <option key={n.clientNodeId} value={n.clientNodeId}>{n.label}</option>
                ))}
              </select>
              <button
                onClick={handleFindPath}
                disabled={!startNodeId || !endNodeId}
                className="btn-secondary"
              >
                Find Path
              </button>
              {pathResult && (
                <div className="path-result">
                  Path: {pathResult.map(id => {
                    const node = graph.nodes.find(n => n.id === id);
                    return node?.label || `Node ${id}`;
                  }).join(' → ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
