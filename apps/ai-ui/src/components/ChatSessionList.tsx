import React, { useState } from 'react';
import type { ChatSessionListItem } from '../types/chat';
import { chatService } from '../api/chatService';
import './ChatSessionList.css';

interface ChatSessionListProps {
  sessions: ChatSessionListItem[];
  onSessionSelect: (session: ChatSessionListItem) => void;
  onSessionsChange: () => void;
}

export default function ChatSessionList({ 
  sessions, 
  onSessionSelect, 
  onSessionsChange 
}: ChatSessionListProps) {
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat session? This action cannot be undone.')) {
      try {
        await chatService.deleteChatSession(sessionId);
        onSessionsChange();
      } catch (error) {
        console.error('Failed to delete session:', error);
        alert('Failed to delete session. Please try again.');
      }
    }
  };

  const handleArchive = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatService.archiveChatSession(sessionId);
      onSessionsChange();
    } catch (error) {
      console.error('Failed to archive session:', error);
      alert('Failed to archive session. Please try again.');
    }
  };

  const handleResume = (session: ChatSessionListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onSessionSelect(session);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (sessions.length === 0) {
    return (
      <div className="ai-ui-chat-session-list-empty">
        <div className="empty-icon">💬</div>
        <h3>No chat sessions yet</h3>
        <p>Start a new conversation to see your chat history here.</p>
      </div>
    );
  }

  return (
    <div className="ai-ui-chat-session-list">
      <h3 className="ai-ui-chat-session-list-title">Previous Conversations</h3>
      <div className="ai-ui-chat-session-items">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`ai-ui-chat-session-item ${session.isArchived ? 'archived' : ''}`}
            onMouseEnter={() => setHoveredSession(session.id)}
            onMouseLeave={() => setHoveredSession(null)}
            onClick={() => onSessionSelect(session)}
          >
            <div className="ai-ui-chat-session-content">
              <div className="ai-ui-chat-session-header">
                <h4 className="ai-ui-chat-session-title">
                  {truncateText(session.title, 40)}
                </h4>
                <span className="ai-ui-chat-session-date">
                  {formatDate(session.lastMessageAt || session.createdAt)}
                </span>
              </div>
              
              {session.description && (
                <p className="ai-ui-chat-session-description">
                  {truncateText(session.description, 80)}
                </p>
              )}
              
              <div className="ai-ui-chat-session-meta">
                <span className="ai-ui-chat-session-message-count">
                  {session.messageCount} messages
                </span>
                {session.isArchived && (
                  <span className="ai-ui-chat-session-archived-badge">Archived</span>
                )}
              </div>
            </div>

            {/* Hover Actions */}
            {hoveredSession === session.id && (
              <div className="ai-ui-chat-session-actions">
                <button
                  className="action-btn resume-btn"
                  onClick={(e) => handleResume(session, e)}
                  title="Resume conversation"
                >
                  ▶️
                </button>
                <button
                  className="action-btn archive-btn"
                  onClick={(e) => handleArchive(session.id, e)}
                  title={session.isArchived ? "Unarchive" : "Archive"}
                >
                  {session.isArchived ? "📂" : "📁"}
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={(e) => handleDelete(session.id, e)}
                  title="Delete session"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
