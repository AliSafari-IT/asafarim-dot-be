import React from 'react';
import type { Technology } from '../../../types/portfolio.types';
import './SkillsSection.css';

interface SkillsSectionProps {
  technologies: Technology[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ technologies }) => {
  // Group technologies by category
  const groupedTechnologies = technologies.reduce((acc, tech) => {
    const category = tech.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tech);
    return acc;
  }, {} as Record<string, Technology[]>);

  const categories = Object.keys(groupedTechnologies).sort();

  return (
    <div className="skills-section">
      {categories.map((category) => (
        <div key={category} className="skills-section__category">
          <h3 className="skills-section__category-title">{category}</h3>
          <div className="skills-section__tags">
            {groupedTechnologies[category].map((tech) => (
              <span key={tech.id} className="skills-section__tag">
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
