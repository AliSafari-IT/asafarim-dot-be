import { useState } from 'react'
import { api } from '../api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import "./Chat.css"
import { useAuth } from '@asafarim/shared-ui-react'

export default function Chat() {
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState('')
  const { isAuthenticated, loading: authLoading, signIn } = useAuth();
  async function send() {
    const data = await api<{ answer: string }>('/chat', { method: 'POST', body: JSON.stringify({ prompt }) })
    setAnswer(data.answer)
  }

  // Unauthenticated experience: intro and prompt to login/register
  if (!authLoading && !isAuthenticated) {
    const goTo = typeof window !== 'undefined' ? window.location.href : undefined;
    return (
      <div className="ai-ui-container">
        <h1 className="ai-ui-title">Chat (stub)</h1>
        <p className="ai-ui-cover-letter">
          Ask anything about your career. To continue, please sign in or create an account.
        </p>
        <div className="ai-ui-buttons">
          <button onClick={() => signIn(goTo)} className="ai-ui-button">Sign in</button>
          <a href={`http://identity.asafarim.local:5177/register?returnUrl=${encodeURIComponent(goTo || '')}`}>
            <button className="ai-ui-button">Register</button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-ui-container">
      <h1 className="ai-ui-title">Chat (stub)</h1>
      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask something" 
      className="ai-ui-input" />
      <div className="ai-ui-buttons">
        <button onClick={send}>Send</button>
      </div>
      {answer && (
        <div className="ai-ui-markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}