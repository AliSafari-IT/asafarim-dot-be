import { aiApi } from '../api';
import type { 
  ChatSession, 
  CreateChatSessionDto, 
  UpdateChatSessionDto, 
  SendMessageDto, 
  ChatResponseDto,
  ChatSessionListItem 
} from '../types/chat';

export const chatService = {
  // Get all chat sessions for the current user
  async getChatSessions(): Promise<ChatSessionListItem[]> {
    return aiApi<ChatSessionListItem[]>('/chatsessions', { method: 'GET' });
  },

  // Get a specific chat session with messages
  async getChatSession(id: string): Promise<ChatSession> {
    return aiApi<ChatSession>(`/chatsessions/${id}`, { method: 'GET' });
  },

  // Create a new chat session
  async createChatSession(data: CreateChatSessionDto): Promise<ChatSession> {
    return aiApi<ChatSession>('/chatsessions', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    });
  },

  // Update a chat session
  async updateChatSession(id: string, data: UpdateChatSessionDto): Promise<void> {
    return aiApi<void>(`/chatsessions/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    });
  },

  // Delete a chat session
  async deleteChatSession(id: string): Promise<void> {
    return aiApi<void>(`/chatsessions/${id}`, { method: 'DELETE' });
  },

  // Archive/unarchive a chat session
  async archiveChatSession(id: string): Promise<void> {
    return aiApi<void>(`/chatsessions/${id}/archive`, { method: 'POST' });
  },

  // Send a message (creates new session or continues existing one)
  async sendMessage(data: SendMessageDto): Promise<ChatResponseDto> {
    return aiApi<ChatResponseDto>('/chat', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    });
  },

  // Update a specific message
  async updateMessage(id: string, content: string, regenerateResponse = false): Promise<ChatResponseDto | null> {
    return aiApi<ChatResponseDto | null>(`/chatmessages/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content, regenerateResponse })
    });
  },

  // Delete a specific message
  async deleteMessage(id: string): Promise<void> {
    return aiApi<void>(`/chatmessages/${id}`, { method: 'DELETE' });
  }
};
