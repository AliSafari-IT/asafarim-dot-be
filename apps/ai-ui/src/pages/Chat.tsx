import { useState } from 'react'
import { api } from '../api'
import "./Chat.css"

export default function Chat() {
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState('')

  async function send() {
    const data = await api<{ answer: string }>('/chat', { method: 'POST', body: JSON.stringify({ prompt }) })
    setAnswer(data.answer)
  }

  return (
    <div className="ai-ui-container">
      <h1 className="ai-ui-title">Chat (stub)</h1>
      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask something" 
      className="ai-ui-input" />
      <div className="ai-ui-buttons">
        <button onClick={send}>Send</button>
      </div>
      {answer && <pre className="ai-ui-cover-letter">{answer}</pre>}
    </div>
  )
}