import { useState } from 'react';
import { useAuth } from '@asafarim/shared-ui-react';
import { coreApi } from '../api';

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
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
        <h1>Functional Resume Maker (MVP)</h1>
        <p style={{ marginTop: 8 }}>
          Create a concise, skills-first CV with AI. To continue, please sign in or create an account.
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button onClick={() => signIn(goTo)}>Sign in</button>
          <a href={`http://identity.asafarim.local:5177/register?returnUrl=${encodeURIComponent(goTo || '')}`}>
            <button>Register</button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>Functional Resume Maker (MVP)</h1>
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={prefillFromAccount} disabled={!isAuthenticated || loading}>
            Fill from account
          </button>
        </div>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <textarea rows={3} placeholder="Professional summary" value={summary} onChange={e => setSummary(e.target.value)} />
        <input placeholder="Skills (comma-separated)" value={skills} onChange={e => setSkills(e.target.value)} />
        <textarea rows={6} placeholder="Paste detailed CV (optional)" value={detailedCv} onChange={e => setDetailedCv(e.target.value)} />
        <button onClick={generate} disabled={busy || !isAuthenticated}>
          {busy ? 'Generating...' : 'Generate Functional Resume'}
        </button>
      </div>

      {resp && (
        <div style={{ marginTop: 16 }}>
          <h2>Preview</h2>
          <p><strong>{resp.name}</strong> • {resp.email}{resp.phone ? ` • ${resp.phone}` : ''}</p>
          <p>{resp.summary}</p>
          <h3>Core Skills</h3>
          <ul>{resp.skills.map(s => <li key={s}>{s}</li>)}</ul>
          {!!resp.projects.length && (<>
            <h3>Projects</h3>
            <ul>{resp.projects.map((p, idx) => <li key={idx}><strong>{p.title}</strong> — {p.description}</li>)}</ul>
          </>)}
          {!!resp.achievements.length && (<>
            <h3>Achievements</h3>
            <ul>{resp.achievements.map((a, idx) => <li key={idx}>{a}</li>)}</ul>
          </>)}
        </div>
      )}

      {raw && (
        <div style={{ marginTop: 16 }}>
          <h2>Raw</h2>
          <textarea
            readOnly
            rows={10}
            value={raw}
            style={{ width: '100%', fontFamily: 'monospace' }}
          />
        </div>
      )}
    </div>
  );
}


