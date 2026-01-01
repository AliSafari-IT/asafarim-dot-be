import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SMARTPATH_API_URL || 'http://smartpath.asafarim.local:5109';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Node {
  id: number;
  label: string;
  x: number;
  y: number;
  metadata?: string;
}

export interface Edge {
  id: number;
  fromNodeId: number;
  toNodeId: number;
  weight: number;
  isDirected: boolean;
}

export interface Graph {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  nodes: Node[];
  edges: Edge[];
}

export interface CreateGraphRequest {
  name: string;
  nodes: Omit<Node, 'id'>[];
  edges: Omit<Edge, 'id'>[];
}

export interface UpdateGraphRequest {
  name?: string;
  nodes?: Omit<Node, 'id'>[];
  edges?: Omit<Edge, 'id'>[];
}

export interface PathfindingRequest {
  startNodeId: number;
  endNodeId: number;
  algorithm: 'astar' | 'dijkstra';
  allowDiagonal?: boolean;
}

export interface PathfindingResult {
  pathNodeIds: number[];
  totalCost: number;
  visitedNodeIdsInOrder: number[];
  expandedEdgesInOrder: Array<{ fromId: number; toId: number }>;
  diagnostics: {
    iterations: number;
    durationMs: number;
  };
}

const graphService = {
  async getGraphs(): Promise<Graph[]> {
    const response = await apiClient.get('/api/graphs');
    return response.data;
  },

  async getGraph(id: number): Promise<Graph> {
    const response = await apiClient.get(`/api/graphs/${id}`);
    return response.data;
  },

  async createGraph(request: CreateGraphRequest): Promise<Graph> {
    const response = await apiClient.post('/api/graphs', request);
    return response.data;
  },

  async updateGraph(id: number, request: UpdateGraphRequest): Promise<Graph> {
    const response = await apiClient.put(`/api/graphs/${id}`, request);
    return response.data;
  },

  async deleteGraph(id: number): Promise<void> {
    await apiClient.delete(`/api/graphs/${id}`);
  },

  async findShortestPath(
    graphId: number,
    request: PathfindingRequest
  ): Promise<PathfindingResult> {
    const response = await apiClient.post(
      `/api/graphs/${graphId}/shortest-path`,
      request
    );
    return response.data;
  },
};

export default graphService;
