import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth, isProduction } from "@asafarim/shared-ui-react";
import { chatService } from "../api/chatService";
import ChatSessionList from "../components/ChatSessionList";
import type {
  ChatSession,
  ChatMessage,
  ChatSessionListItem,
} from "../types/chat";
import "./Chat.css";

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [sessions, setSessions] = useState<ChatSessionListItem[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const authApiBase = isProduction
    ? "/api/auth"
    : "http://identity.asafarim.local:5101/auth";

  const {
    isAuthenticated,
    loading: authLoading,
    signIn,
    user,
  } = useAuth({
    authApiBase,
    meEndpoint: "/me",
    tokenEndpoint: "/token",
    logoutEndpoint: "/logout",
  });

  /** Load chat sessions */
  useEffect(() => {
    if (isAuthenticated) loadChatSessions();
  }, [isAuthenticated]);

  const loadChatSessions = async () => {
    try {
      const data = await chatService.getChatSessions();
      setSessions(data);
    } catch (e) {
      console.error(e);
    }
  };

  /** Select a chat session */
  const handleSessionSelect = async (session: ChatSessionListItem) => {
    try {
      const s = await chatService.getChatSession(session.id);
      setCurrentSession(s);
      setMessages(s.messages || []);
      setSidebarOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewChat = () => {
    setCurrentSession(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  /** Send a prompt */
  const sendMessage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const response = await chatService.sendMessage({
        sessionId: currentSession?.id,
        message: prompt,
        sessionTitle: !currentSession ? prompt.substring(0, 50) : undefined,
      });

      setCurrentSession(response.session);
      setMessages(response.messages);
      setPrompt("");

      loadChatSessions();
      scrollToBottom();
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () =>
    setTimeout(() => {
      const el = document.querySelector(".chat-body");
      if (el) el.scrollTop = el.scrollHeight;
    }, 80);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /** If not authenticated */
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="auth-wall">
        <div className="auth-card">
          <div className="bot-icon">🤖</div>
          <h1>AI Assistant</h1>
          <p>Sign in to start your conversation.</p>
          <button onClick={() => signIn(isProduction ? window.location.href : "http://ai.asafarim.local:5173/chat")}>Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-app">
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <h3>Chats</h3>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>

        <button className="new-chat" onClick={handleNewChat}>
          + New Chat
        </button>

        <div className="session-list">
          <ChatSessionList
            sessions={sessions}
            onSessionSelect={handleSessionSelect}
            onSessionsChange={loadChatSessions}
          />
        </div>

        {user && (
          <div className="user-footer">
            <div className="avatar">{user.email[0].toUpperCase()}</div>
            <span>{user.email}</span>
          </div>
        )}
      </aside>

      {/* MAIN AREA */}
      <main className="chat-main">
        {/* TOP BAR */}
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <h1>AI Assistant</h1>
        </header>

        {/* CHAT BODY */}
        <div className="chat-body">
          {messages.length === 0 && (
            <div className="welcome">
              <div className="bot-icon-circle">🤖</div>
              <h2>How can I help?</h2>
              <p>Ask anything — I'm here to assist.</p>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`bubble ${m.role}`}>
              <div className="avatar-mini">
                {m.role === "user" ? "👤" : "🤖"}
              </div>
              <div className="bubble-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <div className="bubble assistant">
              <div className="avatar-mini">🤖</div>
              <div className="typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        {/* INPUT AREA */}
        <div className="input-box">
          <textarea
            placeholder="Type a message..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKey}
          ></textarea>

          <button
            className="send"
            onClick={sendMessage}
            disabled={!prompt.trim()}
          >
            ➤
          </button>
        </div>
      </main>
    </div>
  );
}
