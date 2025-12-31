import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import GraphsPage from './GraphsPage';
import graphService from '../api/graphService';

vi.mock('../api/graphService');

const mockGraphs = [
  {
    id: 1,
    name: 'Test Graph 1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [
      { id: 1, label: 'A', x: 0, y: 0 },
      { id: 2, label: 'B', x: 100, y: 0 },
    ],
    edges: [{ id: 1, fromNodeId: 1, toNodeId: 2, weight: 1, isDirected: false }],
  },
];

describe('GraphsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders graphs list', async () => {
    vi.mocked(graphService.getGraphs).mockResolvedValue(mockGraphs);

    render(
      <BrowserRouter>
        <GraphsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Graph 1')).toBeInTheDocument();
    });
  });

  it('displays empty state when no graphs exist', async () => {
    vi.mocked(graphService.getGraphs).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <GraphsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No graphs yet.')).toBeInTheDocument();
    });
  });

  it('deletes graph when delete button clicked', async () => {
    vi.mocked(graphService.getGraphs).mockResolvedValue(mockGraphs);
    vi.mocked(graphService.deleteGraph).mockResolvedValue();

    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <GraphsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Graph 1')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByTestId('graph-delete-btn-1');
    window.confirm = vi.fn(() => true);

    await user.click(deleteBtn);

    await waitFor(() => {
      expect(graphService.deleteGraph).toHaveBeenCalledWith(1);
    });
  });
});
