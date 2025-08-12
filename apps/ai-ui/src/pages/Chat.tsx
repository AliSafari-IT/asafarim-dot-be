import { useState } from 'react'
import { api } from '../api'

export default function Chat() {
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState('')

  async function send() {
    const data = await api<{ answer: string }>('/chat', { method: 'POST', body: JSON.stringify({ prompt }) })
    setAnswer(data.answer)
  }

  return (
    <div>
      <h1>Aptly – Chat (stub)</h1>
      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask something" style={{ width: '100%' }} />
      <div style={{ marginTop: 8 }}>
        <button onClick={send}>Send</button>
      </div>
      {answer && <pre style={{ marginTop: 12 }}>{answer}</pre>}
    </div>
  )
}