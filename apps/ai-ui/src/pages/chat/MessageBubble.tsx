/* apps/ai-ui/src/pages/chat/MessageBubble.tsx */

import { useState } from "react";
import type { ChatMessage } from "../../types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
  onEdit?: (id: string, newContent: string) => void;
  onDelete?: (id: string) => void;
}

export default function MessageBubble({ message, onEdit, onDelete }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSave = () => {
    if (editContent.trim() !== message.content) {
      onEdit?.(message.id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  return (
    <div className={`msg-row ${isUser ? "user" : "assistant"}`}>
      {!isUser && (
        <div className="msg-avatar">
          <span className="avatar-icon">🤖</span>
        </div>
      )}
      
      <div className="msg-content-wrapper">
        <div className="msg-bubble">
          {isEditing ? (
            <div className="msg-edit-box">
              <textarea
                className="msg-edit-textarea"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
              />
              <div className="msg-edit-actions">
                <button className="msg-action-btn save" onClick={handleSave}>Save</button>
                <button className="msg-action-btn cancel" onClick={handleCancel}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="msg-text">{message.content}</div>
          )}
          <span className="msg-time">{time}</span>
        </div>

        {/* Action Buttons (Edit/Delete) - Only show when not editing */}
        {!isEditing && (
          <div className="msg-actions">
            {isUser && (
              <button 
                className="msg-icon-btn edit" 
                onClick={() => setIsEditing(true)}
                title="Edit message"
              >
                ✎
              </button>
            )}
            <button 
              className="msg-icon-btn delete" 
              onClick={() => {
                if(confirm('Delete this message?')) onDelete?.(message.id);
              }}
              title="Delete message"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="msg-avatar user-avatar">
          <span className="avatar-icon">👤</span>
        </div>
      )}
    </div>
  );
}
