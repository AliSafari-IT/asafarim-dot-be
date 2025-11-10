import React from "react";
import ToolCard from "../components/ToolCard";
import Hero from "../components/Hero";
import "./HomePage.css";

const tools = [
  {
    title: "Test Runner",
    description: "Configure, execute, and monitor automated E2E tests effortlessly.",
    to: "/test-runner",
    icon: "⚙️",
  },
  {
    title: "Test Reports",
    description: "View and analyze detailed results for each test run.",
    to: "/reports",
    icon: "📊",
  },
  {
    title: "Integrations",
    description: "Connect with CI/CD tools, APIs, and third-party systems.",
    to: "/integrations",
    icon: "🔗",
  },
  {
    title: "Settings",
    description: "Manage environments, credentials, and automation configurations.",
    to: "/settings",
    icon: "🧩",
  },
];

export default function HomePage() {
  return (
    <section className="home-page">
      <Hero />
      <div className="home-container">
        <h2 className="home-heading">Testora • E2E Test Automation Platform</h2>
        <div className="tool-grid">
          {tools.map((tool) => (
            <ToolCard
              key={tool.title}
              title={tool.title}
              description={tool.description}
              to={tool.to}
              icon={tool.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
