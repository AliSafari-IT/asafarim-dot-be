import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '@asafarim/shared-ui-react'
import { chatService } from '../api/chatService'
import type { ChatSession, ChatMessage, ChatSessionListItem } from '../types/chat'
import "./Chat.css"

export default function Chat() {
  const [prompt, setPrompt] = useState('')
  const [sessions, setSessions] = useState<ChatSessionListItem[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sessionsLoading, setSessionsLoading] = useState(false)
  
  const { isAuthenticated, loading: authLoading, signIn, user } = useAuth();

  // Toggle sidebar on mobile
  const toggleMobileSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };
  
  // Toggle sidebar collapse/expand for desktop
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Close mobile sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const sidebar = document.querySelector('.ai-ui-sidebar');
      const menuToggle = document.querySelector('.menu-toggle');
      
      if (sidebarExpanded && 
          sidebar && 
          menuToggle && 
          !sidebar.contains(event.target as Node) && 
          !menuToggle.contains(event.target as Node)) {
        setSidebarExpanded(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarExpanded]);

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
      console.error('Failed to load chat sessions:', error);
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
      if (window.innerWidth <= 768) {
        setSidebarExpanded(false);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      alert('Failed to load chat session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentSession(null);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const response = await chatService.sendMessage({
        sessionId: currentSession?.id,
        message: prompt,
        sessionTitle: !currentSession ? prompt.substring(0, 50) : undefined
      });

      if (!currentSession) {
        // New session created
        setCurrentSession(response.session);
        setMessages(response.messages);
      } else {
        // Existing session updated
        setMessages(response.messages);
      }

      setPrompt('');
      
      // Refresh sessions list
      await loadChatSessions();
      
      // Scroll to bottom of chat
      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-messages');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Render unauthenticated experience
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="ai-ui-container">
        <div className="ai-ui-main" style={{ marginLeft: 0, width: '100%' }}>
          <div className="ai-ui-header">
            <h1 className="ai-ui-title">AI Chat</h1>
          </div>
          
          <div className="chat-messages" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
            <div className="ai-ui-cover-letter">
              <p>
                Welcome to your AI-powered chat assistant! Get personalized responses to your questions
                and engage in meaningful conversations. Sign in to start your experience.
              </p>
              
              <div className="ai-ui-buttons">
                <button className="ai-ui-button" onClick={() => signIn()}>
                  Sign In to Start
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render authenticated experience
  return (
    <div className={`ai-ui-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar toggle button */}
      <button 
        className={`sidebar-toggle ${sidebarCollapsed ? 'collapsed' : ''}`}
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
      >
        {sidebarCollapsed ? '→' : '←'}
      </button>
      
      {/* Sidebar */}
      <div className={`ai-ui-sidebar ${sidebarExpanded ? 'expanded' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button 
            className="new-chat-btn" 
            onClick={handleNewChat}
            disabled={sessionsLoading}
          >
            {sessionsLoading ? '⏳' : '+'} New chat
          </button>
        </div>
        
        <div className="ai-ui-sessions-section">
          {sessions.map((session) => (
            <div 
              key={session.id} 
              className={`session-item ${currentSession?.id === session.id ? 'active' : ''}`}
              onClick={() => handleSessionSelect(session)}
            >
              <span>💬</span>
              <span className="session-title">{session.title}</span>
            </div>
          ))}
          
          {sessions.length === 0 && !sessionsLoading && (
            <div className="no-sessions">No conversations yet</div>
          )}
        </div>
        
        {user && (
          <div className="ai-ui-user-info">
            <div className="user-avatar">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="user-name">{user.email}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="ai-ui-main">
        <div className="ai-ui-header">
          <button className="menu-toggle" onClick={toggleMobileSidebar}>
            ☰
          </button>
          <h1 className="ai-ui-title">
            {currentSession ? currentSession.title : 'New Chat'}
          </h1>
        </div>
        
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
                {message.role === 'user' ? '👤' : '🤖'}
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
        </div>
        
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
              title={loading ? 'Processing...' : 'Send message'}
            > 
              {loading ? '⏳' : '➤'} 
            </button>
          </div>
          <div className="input-hint">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}
