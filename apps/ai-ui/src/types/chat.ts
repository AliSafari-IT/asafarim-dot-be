export interface ChatSession {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  lastMessageAt?: string;
  messageCount: number;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  tokensUsed?: number;
  modelUsed?: string;
  responseTimeMs?: number;
}

export interface CreateChatSessionDto {
  title: string;
  description?: string;
}

export interface UpdateChatSessionDto {
  title: string;
  description?: string;
  isArchived: boolean;
}

export interface SendMessageDto {
  sessionId?: string;
  message: string;
  sessionTitle?: string;
}

export interface ChatResponseDto {
  sessionId: string;
  answer: string;
  session: ChatSession;
  messages: ChatMessage[];
}

export interface ChatSessionListItem {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  lastMessageAt?: string;
  messageCount: number;
  isArchived: boolean;
}
