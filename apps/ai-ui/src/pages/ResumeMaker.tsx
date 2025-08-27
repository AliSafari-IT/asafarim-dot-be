import { useState } from 'react';
import { useAuth } from '@asafarim/shared-ui-react';
import { coreApi } from '../api';
import "./ResumeMaker.css";

type FunctionalResumeResponse = {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  summary: string;
  skills: string[];
  projects: { title: string; description?: string; highlights?: string[] }[];
  achievements: string[];
  sections: string[];
};

export default function ResumeMaker() {
  const { isAuthenticated, user, loading, signIn } = useAuth<{ id: string; email?: string; userName?: string }>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState('React, TypeScript, .NET, PostgreSQL');
  const [detailedCv, setDetailedCv] = useState('');
  const [resp, setResp] = useState<FunctionalResumeResponse | null>(null);
  const [raw, setRaw] = useState<string>('');
  const [busy, setBusy] = useState(false);

  function prefillFromAccount() {
    if (!user) return;
    setEmail(user.email || '');
    // Use userName as a simple display name fallback
    if (!name && user.userName) setName(user.userName);
  }

  async function generate() {
    setBusy(true);
    try {
      const payload = {
        name,
        email,
        phone,
        summary,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        projects: [],
        achievements: [],
        detailedCv,
      };
      const data = await coreApi<{ userId: string; raw: string }>('/resume/functional', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setRaw(data.raw);
      try {
        const parsed = JSON.parse(data.raw) as FunctionalResumeResponse;
        setResp(parsed);
      } catch {
        setResp(null);
      }
    } finally {
      setBusy(false);
    }
  }

  // Unauthenticated experience: intro and prompt to login/register
  if (!loading && !isAuthenticated) {
    const goTo = typeof window !== 'undefined' ? window.location.href : undefined;
    return (
      <div className="ai-ui-container">
        <h1 className="ai-ui-title">Functional Resume Maker (MVP)</h1>
        <p className="ai-ui-cover-letter">
          Create a concise, skills-first CV with AI. To continue, please sign in or create an account.
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
      <h1 className="ai-ui-title">Functional Resume Maker (MVP)</h1>
      <div className="ai-ui-cover-letter">
        <div className="ai-ui-buttons">
          <button onClick={prefillFromAccount} disabled={!isAuthenticated || loading} className="ai-ui-button">
            Fill from account
          </button>
        </div>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="ai-ui-input" />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="ai-ui-input" />
        <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="ai-ui-input" />
        <textarea rows={3} placeholder="Professional summary" value={summary} onChange={e => setSummary(e.target.value)} className="ai-ui-input" />
        <input placeholder="Skills (comma-separated)" value={skills} onChange={e => setSkills(e.target.value)} className="ai-ui-input" />
        <textarea rows={6} placeholder="Paste detailed CV (optional)" value={detailedCv} onChange={e => setDetailedCv(e.target.value)} className="ai-ui-input" />
        <button onClick={generate} disabled={busy || !isAuthenticated} className="ai-ui-button">
          {busy ? 'Generating...' : 'Generate Functional Resume'}
        </button>
      </div>

      {resp && (
        <div className="ai-ui-cover-letter">
          <h2 className="ai-ui-cover-letter-title">Preview</h2>
          <p className="ai-ui-cover-letter-name"><strong>{resp.name}</strong> • {resp.email}{resp.phone ? ` • ${resp.phone}` : ''}</p>
          <p className="ai-ui-cover-letter-summary">{resp.summary}</p>
          <h3 className="ai-ui-cover-letter-title">Core Skills</h3>
          <ul className="ai-ui-cover-letter-list">{resp.skills.map(s => <li key={s}>{s}</li>)}</ul>
          {!!resp.projects.length && (<>
            <h3 className="ai-ui-cover-letter-title">Projects</h3>
            <ul className="ai-ui-cover-letter-list">{resp.projects.map((p, idx) => <li key={idx}><strong>{p.title}</strong> — {p.description}</li>)}</ul>
          </>)}
          {!!resp.achievements.length && (<>
            <h3 className="ai-ui-cover-letter-title">Achievements</h3>
            <ul className="ai-ui-cover-letter-list">{resp.achievements.map((a, idx) => <li key={idx}>{a}</li>)}</ul>
          </>)}
        </div>
      )}

      {raw && (
        <div className="ai-ui-cover-letter">
          <h2 className="ai-ui-cover-letter-title">Raw</h2>
          <textarea
            readOnly
            rows={10}
            value={raw}
            className="ai-ui-cover-letter-textarea"
          />
        </div>
      )}
    </div>
  );
}


