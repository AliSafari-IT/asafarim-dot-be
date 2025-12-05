/* apps/ai-ui/src/pages/chat/TypingIndicator.tsx */

export default function TypingIndicator() {
  return (
    <div className="msg-row assistant">
      <div className="msg-avatar">
        <span className="avatar-icon">🤖</span>
      </div>
      <div className="msg-bubble typing-bubble">
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
