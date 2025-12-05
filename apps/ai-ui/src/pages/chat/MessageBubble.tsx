/* apps/ai-ui/src/pages/chat/MessageBubble.tsx */

import type { ChatMessage } from "../../types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`msg-row ${isUser ? "user" : "assistant"}`}>
      {!isUser && (
        <div className="msg-avatar">
          <span className="avatar-icon">🤖</span>
        </div>
      )}
      <div className="msg-bubble">
        <div className="msg-text">{message.content}</div>
        <span className="msg-time">{time}</span>
      </div>
      {isUser && (
        <div className="msg-avatar user-avatar">
          <span className="avatar-icon">👤</span>
        </div>
      )}
    </div>
  );
}
