import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '@asafarim/shared-ui-react'
import { chatService } from '../api/chatService'
import ChatSessionList from '../components/ChatSessionList'
import type { ChatSession, ChatMessage, ChatSessionListItem } from '../types/chat'
import "./Chat.css"

export default function Chat() {
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState('')
  const [sessions, setSessions] = useState<ChatSessionListItem[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [showSessions, setShowSessions] = useState(true)
  const [sessionsLoading, setSessionsLoading] = useState(false)
  
  const { isAuthenticated, loading: authLoading, signIn, user } = useAuth();

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
      setShowSessions(false);
      setAnswer(''); // Clear previous answer
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
    setAnswer('');
    setShowSessions(true);
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

      setAnswer(response.answer);
      
      if (!currentSession) {
        // New session created
        setCurrentSession(response.session);
        setMessages(response.messages);
        setShowSessions(false);
      } else {
        // Existing session updated
        setMessages(response.messages);
      }

      setPrompt('');
      
      // Refresh sessions list
      await loadChatSessions();
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

  // Unauthenticated experience
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="ai-ui-container">
        <div className="ai-ui-header">
          <h1 className="ai-ui-title">AI Career Assistant</h1>
        </div>
        
        <div className="ai-ui-cover-letter">
          <p>
            Welcome to your AI-powered career companion! Get personalized advice on job searching, 
            interview preparation, career development, and professional growth. Sign in to start 
            your journey towards career success.
          </p>
        </div>
        
        <div className="ai-ui-buttons">
          <button className="ai-ui-button" onClick={() => signIn()}>
            Sign In to Start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-ui-container">
      <div className="ai-ui-header">
        <h1 className="ai-ui-title">AI Career Assistant</h1>
        {user && (
          <div className="ai-ui-user-info">
            <div className="user-avatar">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="user-name">{user.email}</span>
          </div>
        )}
      </div>

      {showSessions && (
        <div className="ai-ui-sessions-section">
          <div className="sessions-header">
            <h2>Start a New Conversation</h2>
            <button 
              className="new-chat-btn" 
              onClick={() => setShowSessions(false)}
              disabled={sessionsLoading}
            >
              {sessionsLoading ? '⏳' : '💬'} New Chat
            </button>
          </div>
          <ChatSessionList
            sessions={sessions}
            onSessionSelect={handleSessionSelect}
            onSessionsChange={loadChatSessions}
          />
        </div>
      )}

      {!showSessions && (
        <div className="ai-ui-chat-section">
          <div className="chat-header">
            <button 
              className="back-to-sessions-btn" 
              onClick={handleNewChat}
              disabled={loading}
            >
              ← Back to Sessions
            </button>
            {currentSession && (
              <div className="current-session-info">
                <h3>{currentSession.title}</h3>
                <div className="session-meta">
                  <span>📅 {new Date(currentSession.createdAt).toLocaleDateString()}</span>
                  <span>💬 {currentSession.messageCount} messages</span>
                  {currentSession.isArchived && <span>📁 Archived</span>}
                </div>
              </div>
            )}
          </div>
          
          <div className="chat-messages">
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
            
            {answer && (
              <div className="chat-message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {answer}
                  </ReactMarkdown>
                  <div className="message-timestamp">
                    {new Date().toLocaleString()}
                  </div>
                </div>
              </div>
            )}
            
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
                placeholder="Ask me anything about your career, interviews, or job search..." 
                className="ai-ui-input" 
                rows={3} 
                disabled={loading} 
              />
              <button 
                onClick={sendMessage} 
                disabled={loading || !prompt.trim()} 
                className="send-btn"
                title={loading ? 'Processing...' : 'Send message'}
              > 
                {loading ? '⏳' : '🚀'} 
              </button>
            </div>
            <div className="input-hint">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      )}
    </div>
  );
}