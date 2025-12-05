/* apps/ai-ui/src/pages/chat/ChatPage.tsx */

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth, isProduction } from "@asafarim/shared-ui-react";
import { chatService } from "../../api/chatService";
import Sidebar from "./Sidebar";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import type {
  ChatSession,
  ChatMessage,
  ChatSessionListItem,
} from "../../types/chat";
import "./ChatPage.css";

// Demo placeholder data
const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm your AI assistant. How can I help you today?",
    createdAt: new Date().toISOString(),
  },
];

export default function ChatPage() {
  // State
  const [prompt, setPrompt] = useState("");
  const [sessions, setSessions] = useState<ChatSessionListItem[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auth
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

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load sessions on auth
  useEffect(() => {
    if (isAuthenticated) {
      loadSessions();
    }
  }, [isAuthenticated]);

  // Add body class for layout override
  useEffect(() => {
    document.body.classList.add("asafarim-chat-page");
    return () => document.body.classList.remove("asafarim-chat-page");
  }, []);

  // Placeholder: Load sessions
  const loadSessions = async () => {
    try {
      const data = await chatService.getChatSessions();
      setSessions(data);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  };

  // Placeholder: Select session
  const selectSession = async (session: ChatSessionListItem) => {
    try {
      const data = await chatService.getChatSession(session.id);
      setCurrentSession(data);
      setMessages(data.messages || []);
      setSidebarOpen(false);
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  };

  // Placeholder: New chat
  const handleNewChat = () => {
    setCurrentSession(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  // Placeholder: Send message
  const sendMessage = async () => {
    const text = prompt.trim();
    if (!text || loading) return;

    setLoading(true);
    setPrompt("");

    // Optimistic user message
    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await chatService.sendMessage({
        sessionId: currentSession?.id,
        message: text,
        sessionTitle: !currentSession ? text.substring(0, 50) : undefined,
      });

      setCurrentSession(response.session);
      setMessages(response.messages);
      loadSessions();
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const getReturnUrl = () => {
    if (isProduction) return "https://ai.asafarim.be/chat";
    return window.location.href; // Includes port automatically
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: Unauthenticated
  // ─────────────────────────────────────────────────────────────
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="auth-gate">
        <div className="auth-card">
          <div className="auth-icon">🤖</div>
          <h1>ASafariM AI</h1>
          <p>Your intelligent assistant, ready to help.</p>
          <button
            className="auth-btn"
            onClick={() =>
              signIn(getReturnUrl())
            }
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: Main Chat UI
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="chat-app">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSession?.id}
        onSelectSession={selectSession}
        onNewChat={handleNewChat}
        onClose={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
        user={user}
      />

      {/* Main Area */}
      <main className="chat-main">
        {/* Top Bar */}
        <header className="topbar">
          <button
            className="menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <h1 className="topbar-title">AI Assistant</h1>
          <div className="topbar-spacer" />
        </header>

        {/* Messages */}
        <section className="messages-area">
          <div className="messages-inner">
            {messages.length === 0 ? (
              <div className="welcome-state">
                <div className="welcome-icon">🤖</div>
                <h2>How can I help you?</h2>
                <p>Ask me anything — I'm here to assist.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))
            )}

            {loading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        </section>

        {/* Input Bar */}
        <footer className="input-bar">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              className="input-field"
              placeholder="Type a message..."
              value={prompt}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!prompt.trim() || loading}
              aria-label="Send"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="20"
                height="20"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
          <span className="input-hint">
            Enter to send · Shift+Enter for new line
          </span>
        </footer>
      </main>
    </div>
  );
}
