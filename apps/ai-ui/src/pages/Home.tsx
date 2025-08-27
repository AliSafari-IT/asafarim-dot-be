import { motion } from 'framer-motion';
import ToolCard from "../components/ToolCard";
import "./Home.css";

const tools = [
  {
    title: "Resume Maker",
    description: "Create and customize your professional resume with AI-powered suggestions and templates.",
    to: "/resume-maker",
    icon: "📝"
  },
  {
    title: "Job Tools",
    description: "Enhance your job search with AI-powered tools for applications and interviews.",
    to: "/job-tools",
    icon: "💼"
  },
  {
    title: "AI Chat",
    description: "Get instant help from our AI assistant for all your career-related questions.",
    to: "/chat",
    icon: "🤖"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Home() {
  return (
    <div className="home-container">
      <motion.div 
        className="home-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="home-title">AI-Powered Career Tools</h1>
        <p className="home-subtitle">
          Supercharge your job search with our suite of AI-powered tools designed to help you land your dream job.
        </p>
      </motion.div>

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
  );
}

