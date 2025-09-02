import { useState } from 'react';
import { api } from '../api';
import "./JobTools.css";
import { useAuth } from '@asafarim/shared-ui-react';

type ExtractResp = {
  title: string;
  mustHave: string[];
  niceToHave: string[];
  keywords: string[]
}

type LoadingState = 'idle' | 'extracting' | 'scoring' | 'generating';

export default function JobTools() {
  const [text, setText] = useState('');
  const [skills, setSkills] = useState('React, TypeScript, .NET, PostgreSQL');
  const [extracted, setExtracted] = useState<ExtractResp | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [letter, setLetter] = useState<string>('');
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, loading: authLoading, signIn } = useAuth();

  const resetState = () => {
    setExtracted(null);
    setScore(null);
    setLetter('');
    setError(null);
  };

  const handleError = (err: unknown) => {
    console.error(err);
    setError('An error occurred. Please try again.');
    setLoading('idle');
  };

  async function doExtract() {
    if (!text.trim()) {
      setError('Please enter a job description');
      return;
    }

    try {
      setLoading('extracting');
      resetState();
      const data = await api<ExtractResp>('/extract/job', {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      setExtracted(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading('idle');
    }
  }

  async function doScore() {
    if (!extracted) return;

    try {
      setLoading('scoring');
      const candidateSkills = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const data = await api<{ score: number }>(
        '/score/match',
        {
          method: 'POST',
          body: JSON.stringify({
            candidateSkills,
            jobSkills: extracted.mustHave
          })
        },
      );
      setScore(Math.round(data.score * 100));
    } catch (err) {
      handleError(err);
    } finally {
      setLoading('idle');
    }
  }

  async function doLetter() {
    if (!extracted) return;

    try {
      setLoading('generating');
      const highlights = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const data = await api<{ letter: string }>(
        '/generate/cover-letter',
        {
          method: 'POST',
          body: JSON.stringify({
            jobTitle: extracted.title,
            company: 'Sample Co',
            highlights,
            tone: 'concise'
          })
        },
      );
      setLetter(data.letter);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading('idle');
    }
  }

  const isLoading = (type: LoadingState) => loading === type;
  const isDisabled = (type: LoadingState) => loading !== 'idle' && loading !== type;

  // Unauthenticated experience: intro and prompt to login/register
  if (!authLoading && !isAuthenticated) {
    const goTo = typeof window !== 'undefined' ? window.location.href : undefined;
    return (
      <div className="job-tools">
        <h1>Job Application Assistant</h1>
        <p className="ai-ui-cover-letter">
          Paste a job description and analyze how well you match the requirements. To continue, please sign in or create an account.
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
    <div className="job-tools">
      <header className="job-tools-header">
        <h1>Job Application Assistant</h1>
        <p className="subtitle">Paste a job description and analyze how well you match the requirements</p>
      </header>

      <div className="job-tools-container">
        <section className="job-description-section">
          <div className="form-group">
            <label htmlFor="job-description" className="form-label">
              Job Description
              <span className="required">*</span>
            </label>
            <textarea
              id="job-description"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={8}
              className="form-textarea"
              disabled={isDisabled('extracting')}
            />
          </div>

          <div className="action-buttons">
            <button
              onClick={doExtract}
              disabled={!text.trim() || isDisabled('extracting')}
              className={`btn btn-primary ${isLoading('extracting') ? 'loading' : ''}`}
            >
              {isLoading('extracting') ? 'Analyzing...' : 'Analyze Job'}
            </button>
          </div>
        </section>

        <section className="skills-section">
          <div className="form-group">
            <label htmlFor="skills" className="form-label">
              Your Skills
              <span className="hint">(comma-separated): include Must-Have skills from Job Details if applicable, then re-calculate match score</span>
            </label>
            <input
              id="skills"
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, TypeScript, Node.js"
              className="form-input"
              disabled={isDisabled('scoring')}
            />
          </div>

          <div className="action-buttons">
            <button
              onClick={doScore}
              disabled={!extracted || isDisabled('scoring')}
              className={`btn btn-secondary ${isLoading('scoring') ? 'loading' : ''}`}
            >
              {isLoading('scoring') ? 'Calculating...' : 'Calculate Match'}
            </button>
            <button
              onClick={doLetter}
              disabled={!extracted || isDisabled('generating')}
              className={`btn btn-secondary ${isLoading('generating') ? 'loading' : ''}`}
            >
              {isLoading('generating') ? 'Generating...' : 'Generate Cover Letter'}
            </button>
          </div>
        </section>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span> {error}
          </div>
        )}

        {score !== null && (
          <section className="results-section">
            <h2>Match Score</h2>
            <div className="score-container">
              <div className="score-circle" style={{
                '--score': `${score}%`,
                '--color': score > 70 ? '#4CAF50' : score > 40 ? '#FFC107' : '#F44336'
              } as React.CSSProperties}>
                <span className="score-value">{score}%</span>
              </div>
              <p className="score-description">
                {score > 70
                  ? 'Excellent match! You meet most of the requirements.'
                  : score > 40
                    ? 'Moderate match. Consider highlighting your transferable skills.'
                    : 'Low match. You might want to look for roles that better align with your skills.'
                }
              </p>
            </div>
          </section>
        )}

        {extracted && (
          <section className="extracted-details">
            <h2>Job Details</h2>
            <div className="details-grid">
              <div className="detail-item">
                <h3>Job Title</h3>
                <p>{extracted.title || 'Not specified'}</p>
              </div>
              <div className="detail-item">
                <h3>Must-Have Skills</h3>
                <ul>
                  {extracted.mustHave.map((skill, i) => (
                    <li key={i}>{skill}</li>
                  ))}
                </ul>
              </div>
              <div className="detail-item">
                <h3>Nice-to-Have Skills</h3>
                <ul>
                  {extracted.niceToHave.map((skill, i) => (
                    <li key={i}>{skill}</li>
                  ))}
                </ul>
              </div>
              <div className="detail-item">
                <h3>Keywords</h3>
                <div className="keywords">
                  {extracted.keywords.map((keyword, i) => (
                    <span key={i} className="keyword-tag">{keyword}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {letter && (
          <section className="cover-letter-section">
            <div className="section-header">
              <h2>Generated Cover Letter</h2>
              <button
                onClick={() => navigator.clipboard.writeText(letter)}
                className="btn btn-text"
              >
                Copy to Clipboard
              </button>
            </div>
            <div className="cover-letter-content">
              {letter.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}