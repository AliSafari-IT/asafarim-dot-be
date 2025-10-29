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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Configure useAuth to use Identity API endpoints
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

  // Toggle sidebar collapse/expand for desktop
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Set initial sidebar state and handle window resize
  useEffect(() => {
    // Set initial state based on window width
    const setInitialState = () => {
      const isMobile = window.innerWidth < 580;
      setSidebarCollapsed(isMobile);
      if (isMobile) {
        document.body.style.overflow = "";
      }
    };

    // Set initial state immediately
    setInitialState();

    // Handle window resize
    function handleResize() {
      const isMobile = window.innerWidth < 580;
      if (isMobile && sidebarCollapsed) {
        setSidebarCollapsed(true);
        document.body.style.overflow = "";
      }
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [sidebarCollapsed]);

  // Load chat sessions on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadChatSessions();
    }
  }, [isAuthenticated]);

  const loadChatSessions = async () => {
    try {
      setSessionsLoading(true);
      const sessionsData = await chatService.getChatSessions();
      setSessions(sessionsData);
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleSessionSelect = async (session: ChatSessionListItem) => {
    try {
      setLoading(true);
      const sessionData = await chatService.getChatSession(session.id);
      setCurrentSession(sessionData);
      setMessages(sessionData.messages || []);
      // On mobile, collapse sidebar after selecting a session
      if (window.innerWidth < 580) {
        setSidebarCollapsed(true);
        document.body.style.overflow = "";
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      alert("Failed to load chat session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentSession(null);
    setMessages([]);

    // Scroll to bottom to ensure input section is visible at bottom of viewport
    setTimeout(() => {
      const inputSection = document.querySelector(".chat-input-section");
      if (inputSection) {
        inputSection.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, 100);
  };

  const sendMessage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const response = await chatService.sendMessage({
        sessionId: currentSession?.id,
        message: prompt,
        sessionTitle: !currentSession ? prompt.substring(0, 50) : undefined,
      });

      if (!currentSession) {
        // New session created
        setCurrentSession(response.session);
        setMessages(response.messages);
      } else {
        // Existing session updated
        setMessages(response.messages);
      }

      setPrompt("");

      // Refresh sessions list
      await loadChatSessions();

      // Scroll to bottom of chat
      setTimeout(() => {
        const chatContainer = document.querySelector(".chat-messages");
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Render unauthenticated experience
  if (!authLoading && !isAuthenticated) {
    return (
      <section className="ai-ui-container">
        <div className="ai-ui-main" style={{ marginLeft: 0, width: "100%" }}>
          <div className="ai-ui-header">
            <h1 className="ai-ui-title">AI Chat</h1>
          </div>

          <div
            className="chat-messages"
            style={{
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
            }}
          >
            <div className="ai-ui-cover-letter">
              <p>
                Welcome to your AI-powered chat assistant! Get personalized
                responses to your questions and engage in meaningful
                conversations. Sign in to start your experience.
              </p>

              <div className="ai-ui-buttons">
                <button className="ai-ui-button" onClick={() => signIn()}>
                  Sign In to Start
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Render authenticated experience
  return (
    <section
      className={`ai-ui-container ${sidebarCollapsed ? "collapsed" : ""}`}
    >
      {/* Sidebar toggle button */}
      <button
        className={`ai-ui-sidebar-toggle ${
          sidebarCollapsed ? "collapsed" : ""
        }`}
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
      >
        {sidebarCollapsed ? "→" : "←"}
      </button>

      {/* Sidebar */}
      <div className={`ai-ui-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <button
            className="new-chat-btn"
            onClick={handleNewChat}
            disabled={sessionsLoading}
          >
            {sessionsLoading ? "⏳" : "+"} New chat
          </button>
        </div>
        <ChatSessionList
          sessions={sessions}
          onSessionSelect={handleSessionSelect}
          onSessionsChange={loadChatSessions}
        />
        {user && (
          <div className="ai-ui-user-info">
            <div className="user-avatar">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="user-name">{user.email}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="ai-ui-main">
        <div className="chat-messages-container">
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="empty-chat-message">
                <h2>How can I help you today?</h2>
                <p>Ask me anything and I'll do my best to assist you!</p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`chat-message ${message.role}`}>
                <div className="message-avatar">
                  {message.role === "user" ? "👤" : "🤖"}
                </div>
                <div className="message-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                  <div className="message-timestamp">
                    {new Date(message.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div className="chat-input-section">
              <div className="chat-input-container">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message AI..."
                  className="ai-ui-input"
                  rows={1}
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !prompt.trim()}
                  className="send-btn"
                  title={loading ? "Processing..." : "Send message"}
                >
                  {loading ? "⏳" : "➤"}
                </button>
              </div>
              <div className="input-hint">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
