export default function Home() {
  return (
    <section className="section">
      <div className="container">
        <div className="mb-8">
          <div className="flex items-center gap-sm mb-4">
            <span className="badge">
              <span className="badge-dot"></span>
              ASafariM • Multi‑framework monorepo
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-4">Build fast. Scale clean. Theme everywhere.</h1>

          <p className="text-lg text-secondary mb-4" style={{ maxWidth: '42rem' }}>
            React, Angular, and Docusaurus frontends powered by .NET 8+ APIs.
            Shared design tokens ensure consistent UI. SSO via cookies on{" "}
            <code>.asafarim.be</code>.
          </p>

          <div className="flex flex-wrap gap-md mt-4">
            <a 
              href="/about"
              className="btn btn-primary"
            >
              Explore About
              <Arrow />
            </a>
            <a
              href="/contact"
              className="btn btn-outline"
            >
              Contact Me
              <Arrow />
            </a>
          </div>
        </div>

        <div className="features-grid mb-8">
          <Feature
            title="Core Apps"
            desc="Users & Projects with clean architecture, typed clients, and SSO."
            href="/about"
          />
          <Feature
            title="Jobs Tracker"
            desc="Track applications and interviews. Angular UI + .NET Jobs API."
            href="/contact"
          />
          <Feature
            title="Blog & Docs"
            desc="Docusaurus TS with shared header/footer and tokens."
            href="http://blog.asafarim.local:3000/"
            external
          />
        </div>

        <div className="divider mb-8">
          <h2 className="text-xl font-semibold mb-2">What's inside this monorepo?</h2>
          <ul className="list-disc">
            <li className="mb-1">Shared tokens (CSS variables) for theme parity</li>
            <li className="mb-1">Web, Core, AI (React TS) + Jobs (Angular TS)</li>
            <li className="mb-1">Docusaurus blog with shared header/footer</li>
            <li className="mb-1">.NET APIs (Identity, Core, AI, Jobs) with typed clients</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Feature({
  title,
  desc,
  href,
  external,
}: {
  title: string;
  desc: string;
  href: string;
  external?: boolean;
}) {
  const body = (
    <article className="feature-card p-4">
      <h3 className="flex items-center gap-sm font-semibold mb-2">
        <Spark /> {title}
      </h3>
      <p className="text-secondary mb-2" style={{ fontSize: '0.875rem' }}>{desc}</p>
      <span className="flex items-center gap-sm text-primary font-semibold" style={{ fontSize: '0.875rem' }}>
        Open <Arrow />
      </span>
    </article>
  );
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className="no-underline">
      {body}
    </a>
  ) : (
    <a href={href} className="no-underline">{body}</a>
  );
}
function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M7 17L17 7M17 7H9m8 0v8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function Spark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 3l1.7 5.2L19 10l-5.3 1.8L12 17l-1.7-5.2L5 10l5.3-1.8L12 3z"
        fill="currentColor"
        opacity=".9"
      />
    </svg>
  );
}
