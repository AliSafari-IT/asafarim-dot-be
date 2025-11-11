import { API_BASE_URL } from '../config/api';

export interface TaskCommentDto {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskCommentDto {
  content: string;
}

export interface UpdateTaskCommentDto {
  content: string;
}

const commentService = {
  async getTaskComments(taskId: string): Promise<TaskCommentDto[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  },

  async createComment(taskId: string, dto: CreateTaskCommentDto): Promise<TaskCommentDto> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to create comment');
    return response.json();
  },

  async updateComment(taskId: string, commentId: string, dto: UpdateTaskCommentDto): Promise<TaskCommentDto> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to update comment');
    return response.json();
  },

  async deleteComment(taskId: string, commentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments/${commentId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete comment');
  },
};

export default commentService;
