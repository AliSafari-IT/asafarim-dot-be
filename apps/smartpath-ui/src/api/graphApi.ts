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

export interface NodeDto {
  clientNodeId: string;
  label: string;
  x: number;
  y: number;
  metadata?: string;
}

export interface EdgeDto {
  fromClientNodeId: string;
  toClientNodeId: string;
  weight: number;
  isDirected: boolean;
}

export interface CreateGraphDto {
  name: string;
  nodes: NodeDto[];
  edges: EdgeDto[];
}

export interface UpdateGraphDto {
  name?: string;
  nodes?: NodeDto[];
  edges?: EdgeDto[];
}

export interface GraphNode {
  id: number;
  graphId: number;
  clientNodeId: string;
  label: string;
  x: number;
  y: number;
  metadata?: string;
}

export interface GraphEdge {
  id: number;
  graphId: number;
  fromNodeId: number;
  toNodeId: number;
  weight: number;
  isDirected: boolean;
}

export interface Graph {
  id: number;
  name: string;
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface PathfindingRequest {
  startNodeClientId: string;
  endNodeClientId: string;
  algorithm: string;
}

export interface PathfindingResult {
  pathNodeIds: number[];
  totalCost: number;
  visitedNodeIdsInOrder: number[];
}

const graphApi = {
  async getAllGraphs(): Promise<Graph[]> {
    const response = await apiClient.get('/api/graphs');
    return response.data;
  },

  async getGraphById(id: number): Promise<Graph> {
    const response = await apiClient.get(`/api/graphs/${id}`);
    return response.data;
  },

  async createGraph(dto: CreateGraphDto): Promise<Graph> {
    const response = await apiClient.post('/api/graphs', dto);
    return response.data;
  },

  async updateGraph(id: number, dto: UpdateGraphDto): Promise<Graph> {
    const response = await apiClient.put(`/api/graphs/${id}`, dto);
    return response.data;
  },

  async deleteGraph(id: number): Promise<void> {
    await apiClient.delete(`/api/graphs/${id}`);
  },

  async findShortestPath(graphId: number, req: PathfindingRequest): Promise<PathfindingResult> {
    const response = await apiClient.post(`/api/graphs/${graphId}/shortest-path`, req);
    return response.data;
  },
};

export default graphApi;
