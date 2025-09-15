import { isProduction } from "@asafarim/shared-ui-react";
import Hero from "../components/Hero";
import Feature from "../components/Feature";

export default function Home() {
  return (
    <section className="section">
      <div className="container">
        <div className="mb-8">
          <Hero />
        </div>

        <div className="features-grid mb-8">
          <Feature
            title="What's I'm building now?"
            desc="A “What I’m Building Now” feed (pull from GitHub commits)."
            href={isProduction ? "https://core.asafarim.be/what-is-building" : "/what-is-building"}
          />
          <Feature
            title="AI"
            desc="AI with clean architecture, typed clients, and SSO."
            href={isProduction ? "https://ai.asafarim.be" : "http://ai.asafarim.local:5173"}
          />
          <Feature
            title="Core Apps"
            desc="Users & Projects with clean architecture, typed clients, and SSO."
            href={isProduction ? "https://core.asafarim.be" : "http://core.asafarim.local:5174"}
          />
          <Feature
            title="Jobs Tracker"
            desc="Track applications and interviews. Angular UI + .NET Jobs API."
            href={isProduction ? "https://core.asafarim.be/jobs" : "http://core.asafarim.local:5174/jobs"}
          />
          <Feature
            title="Blog & Docs"
            desc="Docusaurus TS with shared header/footer and tokens."
            href={isProduction ? "https://blog.asafarim.be/" : "http://blog.asafarim.local:3000/"}
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




