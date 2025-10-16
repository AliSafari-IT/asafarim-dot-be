import React from 'react';
import type { Project } from '../../../types/portfolio.types';
import './ProjectCard.css';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const { title, summary, isFeatured, technologies, images, githubUrl, demoUrl } = project;
  const primaryImage = images.find(img => img.displayOrder === 0) || images[0];

  return (
    <article 
      className={`project-card ${isFeatured ? 'project-card--featured' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {isFeatured && (
        <div className="project-card__badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Featured
        </div>
      )}

      {primaryImage && (
        <div className="project-card__image">
          <img 
            src={primaryImage.imageUrl} 
            alt={primaryImage.caption || title}
            loading="lazy"
          />
        </div>
      )}

      <div className="project-card__content">
        <h3 className="project-card__title">{title}</h3>
        <p className="project-card__summary">{summary}</p>

        {technologies.length > 0 && (
          <div className="project-card__technologies">
            {technologies.slice(0, 4).map((tech) => (
              <span key={tech.id} className="project-card__tech-tag">
                {tech.name}
              </span>
            ))}
            {technologies.length > 4 && (
              <span className="project-card__tech-tag project-card__tech-tag--more">
                +{technologies.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="project-card__actions">
          {githubUrl && (
            <a 
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card__link"
              onClick={(e) => e.stopPropagation()}
              aria-label="View on GitHub"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          )}
          
          {demoUrl && (
            <a 
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card__link project-card__link--primary"
              onClick={(e) => e.stopPropagation()}
              aria-label="View live demo"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Live Demo
            </a>
          )}
        </div>
      </div>
    </article>
  );
};
