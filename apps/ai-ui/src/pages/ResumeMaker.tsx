import { useRef, useState } from 'react';
import { useAuth } from '@asafarim/shared-ui-react';
import "./ResumeMaker.css";
import { api } from '../api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const previewRef = useRef<HTMLDivElement | null>(null);

  function prefillFromAccount() {
    if (!user) return;
    setEmail(user.email || '');
    // Use userName as a simple display name fallback
    if (!name && user.userName) setName(user.userName);
  }

  function parseResumeFromRaw(text: string): FunctionalResumeResponse | null {
    if (!text) return null;
    // Strip Markdown code fences like ```json ... ``` or ``` ... ```
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '');
    cleaned = cleaned.replace(/```\s*$/, '');
    cleaned = cleaned.trim();
    try {
      return JSON.parse(cleaned) as FunctionalResumeResponse;
    } catch {
      return null;
    }
  }

  function renderHtmlPreview(model: FunctionalResumeResponse) {
    return (
      <div className="resume-root" ref={previewRef}>
        <header className="resume-header">
          <h1 className="resume-name">{model.name}</h1>
          <div className="resume-contact">
            <span>{model.email}</span>
            {model.phone ? <span> • {model.phone}</span> : null}
          </div>
        </header>
        <section>
          <h2>Summary</h2>
          <p>{model.summary}</p>
        </section>
        {!!model.skills?.length && (
          <section>
            <h2>Core Skills</h2>
            <ul className="resume-list two-col">
              {model.skills.map(s => <li key={s}>{s}</li>)}
            </ul>
          </section>
        )}
        {!!model.projects?.length && (
          <section>
            <h2>Projects</h2>
            <ul className="resume-list">
              {model.projects.map((p, idx) => (
                <li key={idx} className="resume-project">
                  <div className="resume-project-title">{p.title}</div>
                  {p.description && <div className="resume-project-desc">{p.description}</div>}
                  {!!p.highlights?.length && (
                    <ul className="resume-bullets">
                      {p.highlights.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        {!!model.achievements?.length && (
          <section>
            <h2>Achievements</h2>
            <ul className="resume-bullets">
              {model.achievements.map((a, idx) => <li key={idx}>{a}</li>)}
            </ul>
          </section>
        )}
      </div>
    );
  }

  function toMarkdown(model: FunctionalResumeResponse) {
    const lines: string[] = [];
    lines.push(`# ${model.name}`);
    lines.push(`${model.email}${model.phone ? ' • ' + model.phone : ''}`);
    lines.push('');
    lines.push('## Summary');
    lines.push(model.summary);
    lines.push('');
    if (model.skills?.length) {
      lines.push('## Core Skills');
      lines.push(model.skills.map(s => `- ${s}`).join('\n'));
      lines.push('');
    }
    if (model.projects?.length) {
      lines.push('## Projects');
      model.projects.forEach(p => {
        lines.push(`### ${p.title}`);
        if (p.description) lines.push(p.description);
        if (p.highlights?.length) {
          lines.push(p.highlights.map(h => `- ${h}`).join('\n'));
        }
        lines.push('');
      });
    }
    if (model.achievements?.length) {
      lines.push('## Achievements');
      lines.push(model.achievements.map(a => `- ${a}`).join('\n'));
      lines.push('');
    }
    return lines.join('\n');
  }

  function download(content: BlobPart, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadHtml(model: FunctionalResumeResponse) {
    const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${model.name} – Resume</title>
<style>
${`
  body { font-family: system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif; color:#0f172a; }
  .resume-root { max-width:800px; margin:2rem auto; padding:2rem; }
  .resume-header { border-bottom:1px solid #e2e8f0; margin-bottom:1rem; }
  .resume-name { margin:0 0 .25rem 0; font-size:1.75rem; }
  .resume-contact { color:#475569; margin-bottom:.75rem; }
  h2 { margin:1rem 0 .5rem; font-size:1.15rem; }
  .resume-list { margin:0; padding-left:1.25rem; }
  .two-col { columns: 2; column-gap: 2rem; }
  .resume-bullets { padding-left:1.25rem; }
  .resume-project-title { font-weight:600; }
  .resume-project-desc { color:#334155; }
`}
</style>
</head><body>${(document.querySelector('.resume-root')?.outerHTML) || ''}</body></html>`;
    download(html, `${model.name.replace(/\s+/g,'_')}_Resume.html`, 'text/html');
  }

  function downloadMarkdown(model: FunctionalResumeResponse) {
    const md = toMarkdown(model);
    download(md, `${model.name.replace(/\s+/g,'_')}_Resume.md`, 'text/markdown');
  }

  async function downloadPdf() {
    if (!previewRef.current) return;
    const node = previewRef.current;
    const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, (pageHeight - 40) / canvas.height);
    const printWidth = canvas.width * ratio;
    const printHeight = canvas.height * ratio;
    const x = (pageWidth - printWidth) / 2;
    const y = 20; // top margin
    pdf.addImage(imgData, 'PNG', x, y, printWidth, printHeight);
    pdf.save('resume.pdf');
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
      const data = await api<{ userId: string; raw: string }>('/resume/functional', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setRaw(data.raw);
      const parsed = parseResumeFromRaw(data.raw);
      setResp(parsed);
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
          {renderHtmlPreview(resp)}
          <div className="ai-ui-buttons">
            <button onClick={() => downloadHtml(resp)} className="ai-ui-button">Download HTML</button>
            <button onClick={() => downloadMarkdown(resp)} className="ai-ui-button">Download MD</button>
            <button onClick={downloadPdf} className="ai-ui-button">Download PDF</button>
          </div>
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
          {!resp && (
            <p style={{ marginTop: '.5rem', color: 'var(--color-warning, #b45309)' }}>
              Preview unavailable: AI response wasn’t valid JSON. You can still copy from Raw.
            </p>
          )}
        </div>
      )}
    </div>
  );
}


