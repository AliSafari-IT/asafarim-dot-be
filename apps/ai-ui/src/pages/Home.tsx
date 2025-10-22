import ToolCard from "../components/ToolCard";
import Hero from "../components/Hero";
import './home.css';

const tools = [
  {
    title: "Resume Maker",
    description:
      "Create and customize your professional resume with AI-powered suggestions and templates.",
    to: "/resume-maker",
    icon: "📝",
  },
  {
    title: "Job Tools",
    description:
      "Enhance your job search with AI-powered tools for applications and interviews.",
    to: "/ai-ui-job-tools",
    icon: "💼",
  },
  {
    title: "AI Chat",
    description:
      "Get instant help from our AI assistant for all your career-related questions.",
    to: "/chat",
    icon: "🤖",
  },
];

export default function Home() {
  return (
    <section className="ai-ui-home-container">
      <Hero />
      <div className="container">
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
