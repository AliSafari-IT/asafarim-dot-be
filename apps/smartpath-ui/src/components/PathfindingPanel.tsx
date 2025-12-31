import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import graphService, { Node, PathfindingResult } from '../api/graphService';
import './PathfindingPanel.css';

interface PathfindingPanelProps {
  graphId: number;
  nodes: Node[];
}

export default function PathfindingPanel({ graphId, nodes }: PathfindingPanelProps) {
  const [startNodeId, setStartNodeId] = useState<number | null>(null);
  const [endNodeId, setEndNodeId] = useState<number | null>(null);
  const [algorithm, setAlgorithm] = useState<'astar' | 'dijkstra'>('astar');
  const [result, setResult] = useState<PathfindingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const runPathfinding = async () => {
    if (!startNodeId || !endNodeId || graphId === 0) {
      setError('Please select start and end nodes');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await graphService.findShortestPath(graphId, {
        startNodeId,
        endNodeId,
        algorithm,
      });
      setResult(res);
      setCurrentStep(0);
      setIsPlaying(false);
    } catch (err: any) {
      console.error('Pathfinding failed:', err);
      setError(err.response?.data?.error || 'Pathfinding failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const playAnimation = () => {
    if (!result) return;
    setIsPlaying(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step > result.visitedNodeIdsInOrder.length) {
        setIsPlaying(false);
        clearInterval(interval);
      } else {
        setCurrentStep(step);
      }
    }, 500);
  };

  return (
    <div className="pathfinding-panel" data-testid="pathfinding-panel">
      <h3>Shortest Path</h3>

      {error && (
        <div className="error-message" data-testid="pathfinding-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="pathfinding-form" data-testid="pathfinding-form">
        <div className="form-group">
          <label htmlFor="start-node">Start Node</label>
          <select
            id="start-node"
            value={startNodeId || ''}
            onChange={(e) => setStartNodeId(e.target.value ? parseInt(e.target.value) : null)}
            data-testid="start-node-select"
          >
            <option value="">Select start node</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="end-node">End Node</label>
          <select
            id="end-node"
            value={endNodeId || ''}
            onChange={(e) => setEndNodeId(e.target.value ? parseInt(e.target.value) : null)}
            data-testid="end-node-select"
          >
            <option value="">Select end node</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="algorithm">Algorithm</label>
          <select
            id="algorithm"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as 'astar' | 'dijkstra')}
            data-testid="algorithm-select"
          >
            <option value="astar">A* Search</option>
            <option value="dijkstra">Dijkstra</option>
          </select>
        </div>

        <ButtonComponent
          onClick={runPathfinding}
          variant="primary"
          disabled={loading}
          data-testid="run-pathfinding-btn"
        >
          {loading ? 'Running...' : 'Find Path'}
        </ButtonComponent>
      </div>

      {result && (
        <div className="pathfinding-result" data-testid="pathfinding-result">
          <div className="result-header">
            <h4>Results</h4>
            <div className="result-stats">
              <span>Cost: {result.totalCost.toFixed(2)}</span>
              <span>Iterations: {result.diagnostics.iterations}</span>
              <span>Time: {result.diagnostics.durationMs}ms</span>
            </div>
          </div>

          <div className="path-display" data-testid="path-display">
            <p className="path-title">Shortest Path:</p>
            <div className="path-nodes">
              {result.pathNodeIds.map((nodeId, idx) => {
                const node = nodes.find(n => n.id === nodeId);
                return (
                  <div key={nodeId} className="path-node-item">
                    <span className="path-node-label">{node?.label || `Node ${nodeId}`}</span>
                    {idx < result.pathNodeIds.length - 1 && <span className="path-arrow">→</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="visited-nodes" data-testid="visited-nodes">
            <div className="visited-header">
              <p>Visited Nodes ({result.visitedNodeIdsInOrder.length})</p>
              <ButtonComponent
                onClick={playAnimation}
                variant="secondary"
                disabled={isPlaying}
                data-testid="play-animation-btn"
              >
                <Play size={16} />
                Play
              </ButtonComponent>
            </div>
            <div className="visited-list">
              {result.visitedNodeIdsInOrder.map((nodeId, idx) => {
                const node = nodes.find(n => n.id === nodeId);
                const isInPath = result.pathNodeIds.includes(nodeId);
                const isCurrent = idx < currentStep;
                return (
                  <div
                    key={`${nodeId}-${idx}`}
                    className={`visited-item ${isInPath ? 'in-path' : ''} ${isCurrent ? 'visited' : ''}`}
                    data-testid={`visited-node-${idx}`}
                  >
                    <span className="visited-index">{idx + 1}</span>
                    <span className="visited-label">{node?.label || `Node ${nodeId}`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
