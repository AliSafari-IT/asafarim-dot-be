/* apps/ai-ui/src/pages/chat/Sidebar.tsx */

import type { ChatSessionListItem } from "../../types/chat";

interface SidebarProps {
  sessions: ChatSessionListItem[];
  currentSessionId?: string;
  onSelectSession: (session: ChatSessionListItem) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onClose: () => void;
  isOpen: boolean;
  user?: { email: string } | null;
}

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClose,
  isOpen,
  user,
}: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="sidebar-head">
          <span className="sidebar-brand">💬 Chats</span>
          <button className="sidebar-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* New Chat Button */}
        <button className="new-chat-btn" onClick={onNewChat}>
          <span className="plus-icon">+</span>
          New Chat
        </button>

        {/* Sessions List */}
        <nav className="sessions-nav">
          {sessions.length === 0 ? (
            <p className="no-sessions">No conversations yet</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className={`session-item-wrapper ${s.id === currentSessionId ? "active" : ""}`}
              >
                <button
                  className="session-item"
                  onClick={() => onSelectSession(s)}
                >
                  <span className="session-icon">💬</span>
                  <span className="session-title">{s.title || "Untitled"}</span>
                </button>
                <button 
                  className="session-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm('Delete this chat?')) onDeleteSession(s.id);
                  }}
                  title="Delete chat"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </nav>

        {/* User Footer */}
        {user && (
          <div className="sidebar-footer">
            <div className="user-chip">
              <span className="user-initial">{user.email[0].toUpperCase()}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
