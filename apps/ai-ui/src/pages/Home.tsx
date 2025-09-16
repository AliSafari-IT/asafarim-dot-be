import { motion } from "framer-motion";
import ToolCard from "../components/ToolCard";
import Hero from "../components/Hero";

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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  return (
    <section className="ai-ui-home-container">
      <div className="container">
        <div className="mb-8">
          <Hero />
        </div>

        <motion.div
          className="tool-grid"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {tools.map((tool) => (
            <motion.div key={tool.title} variants={item}>
              <ToolCard
                title={tool.title}
                description={tool.description}
                to={tool.to}
                icon={tool.icon}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
