import { Arrow, Button, Spark } from "@asafarim/shared-ui-react";

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

          <h1 className="text-2xl font-bold mb-4 text-phosphor">Build fast. Scale clean. Theme everywhere.</h1>

          <p className="text-lg text-secondary mb-4" style={{ maxWidth: '42rem' }}>
            React, Angular, and Docusaurus frontends powered by .NET 8+ APIs.
            Shared design tokens ensure consistent UI. SSO via cookies on{" "}
            <code>.asafarim.be</code>.
          </p>
          
          <div className="flex flex-wrap gap-md mt-4">
            <Button
              href="/about"
              variant="primary"
              rightIcon={<Spark />}
            >
              Explore More
            </Button>
            <Button
              href="/contact"
              variant="outline"
              rightIcon={<Arrow />}
            >
              Contact Me
            </Button>
          </div>
        </div>

        <div className="features-grid mb-8">
          <Feature
            title="Core Apps"
            desc="Users & Projects with clean architecture, typed clients, and SSO."
            href="https://core.asafarim.be"
          />
          <Feature
            title="Jobs Tracker"
            desc="Track applications and interviews. Angular UI + .NET Jobs API."
            href="https://core.asafarim.be/jobs"
          />
          <Feature
            title="Blog & Docs"
            desc="Docusaurus TS with shared header/footer and tokens."
            href="https://blog.asafarim.be/"
            external
          />
        </div>

        <div className="divider mb-8">
          <h2 className="text-xl font-semibold mb-2 text-brand">What's inside this monorepo?</h2>
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
      <h3 className="flex items-center gap-sm font-semibold mb-2 text-brand">
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


