import { API_BASE_URL } from '../config/api';

export interface TaskDto {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignments: TaskAssignmentDto[];
  commentCount: number;
  attachmentCount: number;
}

export interface CreateTaskDto {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignedUserIds?: string[];
}

export interface UpdateTaskDto {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignedUserIds?: string[];
}

export interface TaskAssignmentDto {
  id: string;
  userId: string;
  assignedAt: string;
}

export enum TaskStatus {
  ToDo = 0,
  InProgress = 1,
  Done = 2,
  Blocked = 3,
  Archived = 4
}

export enum TaskPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

export interface TaskFilterDto {
  status?: TaskStatus;
  priority?: TaskPriority;
  searchTerm?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  assignedUserId?: string;
  sortBy?: string;
  descending?: boolean;
  skip?: number;
  take?: number;
}

const taskService = {
  async getTask(id: string): Promise<TaskDto> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch task');
    return response.json();
  },

  async getProjectTasks(projectId: string, filter?: TaskFilterDto): Promise<TaskDto[]> {
    const params = new URLSearchParams();
    if (filter?.status !== undefined) params.append('status', filter.status.toString());
    if (filter?.priority !== undefined) params.append('priority', filter.priority.toString());
    if (filter?.searchTerm) params.append('searchTerm', filter.searchTerm);
    if (filter?.dueDateFrom) params.append('dueDateFrom', filter.dueDateFrom);
    if (filter?.dueDateTo) params.append('dueDateTo', filter.dueDateTo);
    if (filter?.assignedUserId) params.append('assignedUserId', filter.assignedUserId);
    if (filter?.sortBy) params.append('sortBy', filter.sortBy);
    if (filter?.descending !== undefined) params.append('descending', filter.descending.toString());
    if (filter?.skip) params.append('skip', filter.skip.toString());
    if (filter?.take) params.append('take', filter.take.toString());

    const response = await fetch(`${API_BASE_URL}/tasks/project/${projectId}?${params}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  async createTask(dto: CreateTaskDto): Promise<TaskDto> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  async updateTask(id: string, dto: UpdateTaskDto): Promise<TaskDto> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<TaskDto> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update task status');
    return response.json();
  },

  async deleteTask(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete task');
  },
};

export default taskService;
