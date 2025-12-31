import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import GraphEditorPage from './GraphEditorPage';
import graphService from '../api/graphService';

vi.mock('../api/graphService');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'new' }),
  };
});

describe('GraphEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders graph editor for new graph', async () => {
    render(
      <BrowserRouter>
        <GraphEditorPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('graph-editor-page')).toBeInTheDocument();
    expect(screen.getByTestId('graph-name-input')).toBeInTheDocument();
  });

  it('allows adding nodes', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <GraphEditorPage />
      </BrowserRouter>
    );

    const addNodeBtn = screen.getByText('Add Node');
    await user.click(addNodeBtn);

    await waitFor(() => {
      expect(screen.getByTestId('graph-canvas')).toBeInTheDocument();
    });
  });

  it('saves graph with name and nodes', async () => {
    vi.mocked(graphService.createGraph).mockResolvedValue({
      id: 1,
      name: 'Test Graph',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: [],
      edges: [],
    });

    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <GraphEditorPage />
      </BrowserRouter>
    );

    const nameInput = screen.getByTestId('graph-name-input');
    await user.type(nameInput, 'Test Graph');

    const saveBtn = screen.getByText('Save Graph');
    await user.click(saveBtn);

    await waitFor(() => {
      expect(graphService.createGraph).toHaveBeenCalled();
    });
  });
});
