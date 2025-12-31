import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PathfindingPanel from './PathfindingPanel';
import graphService from '../api/graphService';

vi.mock('../api/graphService');

const mockNodes = [
  { id: 1, label: 'A', x: 0, y: 0 },
  { id: 2, label: 'B', x: 100, y: 0 },
  { id: 3, label: 'C', x: 200, y: 0 },
];

describe('PathfindingPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders pathfinding form', () => {
    render(<PathfindingPanel graphId={1} nodes={mockNodes} />);

    expect(screen.getByTestId('pathfinding-form')).toBeInTheDocument();
    expect(screen.getByTestId('start-node-select')).toBeInTheDocument();
    expect(screen.getByTestId('end-node-select')).toBeInTheDocument();
    expect(screen.getByTestId('algorithm-select')).toBeInTheDocument();
  });

  it('runs pathfinding and displays results', async () => {
    const mockResult = {
      pathNodeIds: [1, 2, 3],
      totalCost: 2.0,
      visitedNodeIdsInOrder: [1, 2, 3],
      expandedEdgesInOrder: [
        { fromId: 1, toId: 2 },
        { fromId: 2, toId: 3 },
      ],
      diagnostics: { iterations: 3, durationMs: 5 },
    };

    vi.mocked(graphService.findShortestPath).mockResolvedValue(mockResult);

    const user = userEvent.setup();

    render(<PathfindingPanel graphId={1} nodes={mockNodes} />);

    const startSelect = screen.getByTestId('start-node-select');
    const endSelect = screen.getByTestId('end-node-select');
    const runBtn = screen.getByTestId('run-pathfinding-btn');

    await user.selectOptions(startSelect, '1');
    await user.selectOptions(endSelect, '3');
    await user.click(runBtn);

    await waitFor(() => {
      expect(screen.getByTestId('pathfinding-result')).toBeInTheDocument();
      expect(screen.getByText('Cost: 2.00')).toBeInTheDocument();
    });
  });

  it('displays error when nodes not selected', async () => {
    const user = userEvent.setup();

    render(<PathfindingPanel graphId={1} nodes={mockNodes} />);

    const runBtn = screen.getByTestId('run-pathfinding-btn');
    await user.click(runBtn);

    await waitFor(() => {
      expect(screen.getByTestId('pathfinding-error')).toBeInTheDocument();
    });
  });
});
