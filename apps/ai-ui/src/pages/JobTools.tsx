import { useState } from 'react'
import { api } from '../api'

type ExtractResp = { title: string; mustHave: string[]; niceToHave: string[]; keywords: string[] }

export default function JobTools() {
  const [text, setText] = useState('')
  const [skills, setSkills] = useState('React, TypeScript, .NET, PostgreSQL')
  const [extracted, setExtracted] = useState<ExtractResp | null>(null)
  const [score, setScore] = useState<number | null>(null)
  const [letter, setLetter] = useState<string>('')

  async function doExtract() {
    const data = await api<ExtractResp>('/extract/job', { method: 'POST', body: JSON.stringify({ text }) })
    setExtracted(data)
  }

  async function doScore() {
    if (!extracted) return
    const candidateSkills = skills.split(',').map((s) => s.trim())
    const data = await api<{ score: number }>(
      '/score/match',
      { method: 'POST', body: JSON.stringify({ candidateSkills, jobSkills: extracted.mustHave }) },
    )
    setScore(data.score)
  }

  async function doLetter() {
    if (!extracted) return
    const highlights = skills.split(',').map((s) => s.trim())
    const data = await api<{ letter: string }>(
      '/generate/cover-letter',
      { method: 'POST', body: JSON.stringify({ jobTitle: extracted.title, company: 'Sample Co', highlights, tone: 'concise' }) },
    )
    setLetter(data.letter)
  }

  return (
    <div>
      <h1>Aptly – Job Tools (stub)</h1>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste job description" rows={6} style={{ width: '100%' }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={doExtract}>Extract</button>
        <button onClick={doScore} disabled={!extracted}>Match Score</button>
        <button onClick={doLetter} disabled={!extracted}>Cover Letter</button>
      </div>

      {extracted && (
        <div style={{ marginTop: 12 }}>
          <strong>Extracted:</strong>
          <pre>{JSON.stringify(extracted, null, 2)}</pre>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <label>My skills (comma-separated): </label>
        <input value={skills} onChange={(e) => setSkills(e.target.value)} style={{ width: '100%' }} />
      </div>

      {score !== null && <p><strong>Score:</strong> {score}</p>}

      {letter && (
        <div style={{ marginTop: 12 }}>
          <strong>Cover letter:</strong>
          <pre>{letter}</pre>
        </div>
      )}
    </div>
  )
}