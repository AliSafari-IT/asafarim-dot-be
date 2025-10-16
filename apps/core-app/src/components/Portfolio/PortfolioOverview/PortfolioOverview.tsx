import React, { useState } from 'react';
import type { PublicPortfolio } from '../../../types/portfolio.types';
import { ProjectCard } from '../ProjectCard/ProjectCard';
import { ExperienceCard } from '../ExperienceCard/ExperienceCard';
import { PublicationCard } from '../PublicationCard/PublicationCard';
import { SkillsSection } from '../SkillsSection/SkillsSection';
import { ProjectDetail } from '../ProjectDetail/ProjectDetail';
import './PortfolioOverview.css';

interface PortfolioOverviewProps {
  portfolio: PublicPortfolio;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ portfolio }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const { projects = [], workExperiences = [], publications = [], technologies = [], settings } = portfolio;
  
  // Ensure sectionOrder exists with default value
  const sectionOrder = settings?.sectionOrder || ['projects', 'skills', 'experience', 'publications'];
  
  // Sort projects by displayOrder and featured status
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return a.displayOrder - b.displayOrder;
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Render sections based on sectionOrder from settings
  const renderSection = (sectionName: string) => {
    switch (sectionName.toLowerCase()) {
      case 'projects':
        return sortedProjects.length > 0 ? (
          <section key="projects" className="portfolio-section">
            <h2 className="portfolio-section__title">Projects</h2>
            <div className="portfolio-section__grid">
              {sortedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => setSelectedProjectId(project.id)}
                />
              ))}
            </div>
          </section>
        ) : null;

      case 'skills':
      case 'technologies':
        return technologies.length > 0 ? (
          <section key="skills" className="portfolio-section">
            <h2 className="portfolio-section__title">Skills & Technologies</h2>
            <SkillsSection technologies={technologies} />
          </section>
        ) : null;

      case 'experience':
      case 'work':
        return (settings?.showWorkExperience ?? true) && workExperiences.length > 0 ? (
          <section key="experience" className="portfolio-section">
            <h2 className="portfolio-section__title">Work Experience</h2>
            <div className="portfolio-section__list">
              {workExperiences.map((exp) => (
                <ExperienceCard key={exp.id} experience={exp} />
              ))}
            </div>
          </section>
        ) : null;

      case 'publications':
        return (settings?.showPublications ?? true) && publications.length > 0 ? (
          <section key="publications" className="portfolio-section">
            <h2 className="portfolio-section__title">Publications</h2>
            <div className="portfolio-section__list">
              {publications.map((pub) => (
                <PublicationCard key={pub.id} publication={pub} />
              ))}
            </div>
          </section>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="portfolio-overview">
      <div className="portfolio-overview__container">
        {sectionOrder.map(renderSection).filter(Boolean)}
        
        {/* Fallback if no sections configured */}
        {sectionOrder.length === 0 && (
          <>
            {renderSection('projects')}
            {renderSection('skills')}
            {renderSection('experience')}
            {renderSection('publications')}
          </>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => setSelectedProjectId(null)}
        />
      )}
    </div>
  );
};
