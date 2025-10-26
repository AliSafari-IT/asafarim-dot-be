import { useRef, useState } from "react";
import {
  ButtonComponent as Button,
  Html,
  MarkDown,
  Pdf,
  useAuth,
  isProduction,
  ButtonComponent,
} from "@asafarim/shared-ui-react";
import {aiApi } from "../api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
  // Configure useAuth to use AI API proxy endpoints
  const authApiBase = isProduction
    ? "/api/auth"
    : "http://identity.asafarim.local:5101/auth";
  const { isAuthenticated, user, loading, signIn } = useAuth<{
    id: string;
    email?: string;
    userName?: string;
  }>({
    authApiBase,
    meEndpoint: "/me",
    tokenEndpoint: "/token",
    logoutEndpoint: "/logout",
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("React, TypeScript, .NET, PostgreSQL");
  const [detailedCv, setDetailedCv] = useState("");
  const [resp, setResp] = useState<FunctionalResumeResponse | null>(null);
  const [raw, setRaw] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [copyBtnText, setCopyBtnText] = useState("Copy");
  const [copied, setCopied] = useState(false);

  function prefillFromAccount() {
    if (!user) return;
    setEmail(user.email || "");
    // Use userName as a simple display name fallback
    if (!name && user.userName) setName(user.userName);
  }

  // Safe clipboard copy with fallbacks for non-secure contexts
  async function copyTextToClipboard(text: string) {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(text);
        setCopyBtnText("Copied!");
        setCopied(true);
        setTimeout(() => {
          setCopyBtnText("Copy");
          setCopied(false);
        }, 2000);
        return;
      }
    } catch {
      // fall through to legacy path
    }
    // Legacy fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      const ok = document.execCommand("copy");
      if (ok) {
        setCopyBtnText("Copied!");
        setCopied(true);
      } else {
        setCopyBtnText("Copy failed");
      }
    } finally {
      document.body.removeChild(ta);
    }
    setTimeout(() => {
      setCopyBtnText("Copy");
      setCopied(false);
    }, 2000);
  }

  function parseResumeFromRaw(text: string): FunctionalResumeResponse | null {
    if (!text) return null;
    // Strip Markdown code fences like ```json ... ``` or ``` ... ```
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, "");
    cleaned = cleaned.replace(/```\s*$/, "");
    cleaned = cleaned.trim();
    try {
      return JSON.parse(cleaned) as FunctionalResumeResponse;
    } catch {
      return null;
    }
  }

  function renderHtmlPreview(model: FunctionalResumeResponse) {
    return (
      <div className="ai-ui-resume-maker-resume-root" ref={previewRef}>
        <header className="ai-ui-resume-maker-resume-header">
          <h1 className="ai-ui-resume-maker-resume-name">{model.name}</h1>
          <div className="ai-ui-resume-maker-resume-contact">
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
            <ul className="ai-ui-resume-maker-resume-list ai-ui-resume-maker-two-col">
              {model.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        )}
        {!!model.projects?.length && (
          <section>
            <h2>Projects</h2>
            <ul className="ai-ui-resume-maker-resume-list">
              {model.projects.map((p, idx) => (
                <li key={idx} className="ai-ui-resume-maker-resume-project">
                  <div className="ai-ui-resume-maker-resume-project-title">
                    {p.title}
                  </div>
                  {p.description && (
                    <div className="ai-ui-resume-maker-resume-project-desc">
                      {p.description}
                    </div>
                  )}
                  {!!p.highlights?.length && (
                    <ul className="ai-ui-resume-maker-resume-bullets">
                      {p.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
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
            <ul className="ai-ui-resume-maker-resume-bullets">
              {model.achievements.map((a, idx) => (
                <li key={idx}>{a}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  function toMarkdown(model: FunctionalResumeResponse) {
    const lines: string[] = [];
    lines.push(`# ${model.name}`);
    lines.push(`${model.email}${model.phone ? " • " + model.phone : ""}`);
    lines.push("");
    lines.push("## Summary");
    lines.push(model.summary);
    lines.push("");
    if (model.skills?.length) {
      lines.push("## Core Skills");
      lines.push(model.skills.map((s) => `- ${s}`).join("\n"));
      lines.push("");
    }
    if (model.projects?.length) {
      lines.push("## Projects");
      model.projects.forEach((p) => {
        lines.push(`### ${p.title}`);
        if (p.description) lines.push(p.description);
        if (p.highlights?.length) {
          lines.push(p.highlights.map((h) => `- ${h}`).join("\n"));
        }
        lines.push("");
      });
    }
    if (model.achievements?.length) {
      lines.push("## Achievements");
      lines.push(model.achievements.map((a) => `- ${a}`).join("\n"));
      lines.push("");
    }
    return lines.join("\n");
  }

  function download(content: BlobPart, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadHtml(model: FunctionalResumeResponse) {
    const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${
      model.name
    } – Resume</title>
<style>
${`
  body { font-family: system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif; color:#0f172a; }
  .ai-ui-resume-maker-resume-root { max-width:800px; margin:2rem auto; padding:2rem; }
  .ai-ui-resume-maker-resume-header { border-bottom:1px solid #e2e8f0; margin-bottom:1rem; }
  .ai-ui-resume-maker-resume-name { margin:0 0 .25rem 0; font-size:1.75rem; }
  .ai-ui-resume-maker-resume-contact { color:#475569; margin-bottom:.75rem; }
  h2 { margin:1rem 0 .5rem; font-size:1.15rem; }
  .ai-ui-resume-maker-resume-list { margin:0; padding-left:1.25rem; }
  .ai-ui-resume-maker-two-col { columns: 2; column-gap: 2rem; }
  .ai-ui-resume-maker-resume-bullets { padding-left:1.25rem; }
  .ai-ui-resume-maker-resume-project-title { font-weight:600; }
  .ai-ui-resume-maker-resume-project-desc { color:#334155; }
`}
</style>
</head><body>${
      document.querySelector(".ai-ui-resume-maker-resume-root")?.outerHTML || ""
    }</body></html>`;
    download(
      html,
      `${model.name.replace(/\s+/g, "_")}_Resume.html`,
      "text/html"
    );
  }

  function downloadMarkdown(model: FunctionalResumeResponse) {
    const md = toMarkdown(model);
    download(
      md,
      `${model.name.replace(/\s+/g, "_")}_Resume.md`,
      "text/markdown"
    );
  }

  async function downloadPdf() {
    if (!previewRef.current) return;
    const node = previewRef.current;
    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(
      pageWidth / canvas.width,
      (pageHeight - 40) / canvas.height
    );
    const printWidth = canvas.width * ratio;
    const printHeight = canvas.height * ratio;
    const x = (pageWidth - printWidth) / 2;
    const y = 20; // top margin
    pdf.addImage(imgData, "PNG", x, y, printWidth, printHeight);
    pdf.save("resume.pdf");
  }

  async function generate() {
    setBusy(true);
    try {
      const payload = {
        name,
        email,
        phone,
        summary,
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        projects: [],
        achievements: [],
        detailedCv,
      };
      const data = await aiApi<{ userId: string; raw: string }>(
        "/resume/functional",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      setRaw(data.raw);
      const parsed = parseResumeFromRaw(data.raw);
      setResp(parsed);
    } finally {
      setBusy(false);
    }
  }

  function register(goto: string) {
    signIn(goto);
  }

  // Unauthenticated experience: intro and prompt to login/register
  if (!loading && !isAuthenticated) {
    const goTo =
      typeof window !== "undefined" ? window.location.href : undefined;
    return (
      <div className="ai-ui-resume-maker-container">
        <h1 className="ai-ui-resume-maker-title">
          Functional Resume Maker (MVP)
        </h1>
        <p className="ai-ui-resume-maker-cover-letter">
          Create a concise, skills-first CV with AI. To continue, please sign in
          or create an account.
        </p>
        <div className="ai-ui-resume-maker-buttons">
          <button
            onClick={() => signIn(goTo)}
            className="ai-ui-resume-maker-button"
          >
            Sign in
          </button>
          <button
            onClick={() => register(goTo ?? "register")}
            className="ai-ui-resume-maker-button"
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-ui-resume-maker-container">
      <h1 className="ai-ui-resume-maker-title">
        Functional Resume Maker (MVP)
      </h1>
      <div className="ai-ui-resume-maker-cover-letter ai-ui-resume-maker-form-card">
        <div className="ai-ui-resume-maker-form-header">
          <div className="ai-ui-resume-maker-buttons">
            <ButtonComponent
              variant="link"
              onClick={prefillFromAccount}
              disabled={!isAuthenticated || loading}
            >
              Fill from account
            </ButtonComponent>
          </div>
        </div>
        <div className="ai-ui-resume-maker-form-grid">
          <div className="ai-ui-resume-maker-form-field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="ai-ui-resume-maker-input"
            />
          </div>
          <div className="ai-ui-resume-maker-form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ai-ui-resume-maker-input"
            />
          </div>
          <div className="ai-ui-resume-maker-form-field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              placeholder="+1 555 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="ai-ui-resume-maker-input"
            />
          </div>
          <div className="ai-ui-resume-maker-form-field form-col-2">
            <label htmlFor="summary">Professional summary</label>
            <textarea
              id="summary"
              rows={3}
              placeholder="Short, compelling summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="ai-ui-resume-maker-input"
            />
          </div>
          <div className="ai-ui-resume-maker-form-field form-col-2">
            <label htmlFor="skills">Core skills (comma-separated)</label>
            <input
              id="skills"
              placeholder="React, TypeScript, .NET, PostgreSQL"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="ai-ui-resume-maker-input"
            />
          </div>
          <div className="ai-ui-resume-maker-form-field form-col-2">
            <label htmlFor="cv">Detailed CV (optional)</label>
            <textarea
              id="cv"
              rows={6}
              placeholder="Paste your detailed CV content"
              value={detailedCv}
              onChange={(e) => setDetailedCv(e.target.value)}
              className="ai-ui-resume-maker-input"
            />
          </div>
        </div>
        <div className="ai-ui-resume-maker-form-actions">
          <Button
            variant="success"
            size="lg"
            onClick={generate}
            disabled={busy || !isAuthenticated}
          >
            {busy ? "Generating..." : "Generate Functional Resume"}
          </Button>
        </div>
      </div>

      {resp && (
        <div className="ai-ui-resume-maker-cover-letter">
          <h2 className="ai-ui-resume-maker-cover-letter-title">Preview</h2>
          {renderHtmlPreview(resp)}
          <div className="ai-ui-resume-maker-buttons">
            <Button
              onClick={() => downloadHtml(resp)}
              variant="primary"
              size="md"
              rightIcon={<Html />}
              className="ai-ui-resume-maker-button"
            >
              Download HTML
            </Button>
            <Button
              onClick={() => downloadMarkdown(resp)}
              variant="primary"
              size="md"
              rightIcon={<MarkDown />}
              className="ai-ui-resume-maker-button"
            >
              Download MD
            </Button>
            <Button
              onClick={downloadPdf}
              variant="primary"
              size="md"
              rightIcon={<Pdf />}
              className="ai-ui-resume-maker-button"
            >
              Download PDF
            </Button>
          </div>
        </div>
      )}

      {raw && (
        <div className="ai-ui-resume-maker-cover-letter">
          <h2 className="ai-ui-resume-maker-cover-letter-title">Raw</h2>
          <div className={`ai-ui-copyable ${copied ? "is-copied" : ""}`}>
            <textarea
              readOnly
              rows={10}
              value={raw}
              className="ai-ui-resume-maker-cover-letter-textarea"
            />
            <Button
              variant="secondary"
              size="md"
              className="ai-ui-copy-btn"
              onClick={() => copyTextToClipboard(raw)}
              aria-label="Copy to clipboard"
              title="Copy to clipboard"
            >
              {copyBtnText}
            </Button>
          </div>
          {!resp && (
            <p
              style={{
                marginTop: ".5rem",
                color: "var(--color-warning, #b45309)",
              }}
            >
              Preview unavailable: AI response wasn’t valid JSON. You can still
              copy from Raw.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
