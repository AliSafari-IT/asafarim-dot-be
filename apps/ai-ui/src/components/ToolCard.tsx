import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./ToolCard.css";

interface ToolCardProps {
  title: string;
  description: string;
  to: string;
  icon?: string;
}

export default function ToolCard({ title, description, to, icon }: ToolCardProps) {
  return (
    <motion.div 
      className="ai-ui-tool-card"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      <Link to={to} className="ai-ui-tool-card-link">
        <div className="ai-ui-tool-card-content">
          {icon && <div className="ai-ui-tool-card-icon">{icon}</div>}
          <h3 className="ai-ui-tool-card-title">{title}</h3>
          <p className="ai-ui-tool-card-description">{description}</p>
          <div className="ai-ui-tool-card-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
