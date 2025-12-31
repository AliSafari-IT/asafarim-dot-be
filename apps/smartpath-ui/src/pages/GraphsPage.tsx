import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import graphService, { Graph } from '../api/graphService';
import './GraphsPage.css';

export default function GraphsPage() {
  const navigate = useNavigate();
  const [graphs, setGraphs] = useState<Graph[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGraphs();
  }, []);

  const loadGraphs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await graphService.getGraphs();
      setGraphs(data);
    } catch (err) {
      console.error('Failed to load graphs:', err);
      setError('Failed to load graphs');
    } finally {
      setLoading(false);
    }
  };

  const deleteGraph = async (id: number) => {
    if (!confirm('Are you sure you want to delete this graph?')) return;
    try {
      await graphService.deleteGraph(id);
      setGraphs(graphs.filter(g => g.id !== id));
    } catch (err) {
      console.error('Failed to delete graph:', err);
      setError('Failed to delete graph');
    }
  };

  if (loading) {
    return <div className="loading" data-testid="graphs-loading">Loading...</div>;
  }

  return (
    <div className="graphs-page container" data-testid="graphs-page">
      <header className="page-header" data-testid="graphs-header">
        <div>
          <h1>Graphs</h1>
          <p>Create and explore shortest path algorithms</p>
        </div>
        <div className="header-actions" data-testid="graphs-header-actions">
          <ButtonComponent onClick={() => navigate('/graphs/new')} variant="primary">
            <Plus size={20} />
            New Graph
          </ButtonComponent>
        </div>
      </header>

      {error && (
        <div className="error-banner" data-testid="graphs-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="graphs-grid" data-testid="graphs-grid">
        {graphs.length === 0 ? (
          <div className="empty-state" data-testid="graphs-empty-state">
            <p>No graphs yet.</p>
            <p className="subtitle">Create your first graph to get started!</p>
          </div>
        ) : (
          graphs.map((graph) => (
            <div key={graph.id} className="graph-card" data-testid={`graph-card-${graph.id}`}>
              <div className="graph-card-content">
                <h3>{graph.name}</h3>
                <div className="graph-stats">
                  <span>{graph.nodes.length} nodes</span>
                  <span>•</span>
                  <span>{graph.edges.length} edges</span>
                </div>
                <p className="graph-date">
                  Created {new Date(graph.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="graph-card-actions">
                <button
                  onClick={() => navigate(`/graphs/${graph.id}`)}
                  className="btn-action btn-edit"
                  title="Edit graph"
                  data-testid={`graph-edit-btn-${graph.id}`}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deleteGraph(graph.id)}
                  className="btn-action btn-delete"
                  title="Delete graph"
                  data-testid={`graph-delete-btn-${graph.id}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
