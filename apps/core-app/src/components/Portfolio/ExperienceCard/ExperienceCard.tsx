import React from 'react';
import type { WorkExperience } from '../../../types/portfolio.types';
import './ExperienceCard.css';

interface ExperienceCardProps {
  experience: WorkExperience;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience }) => {
  const { company, position, startDate, endDate, description, location } = experience;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const duration = endDate 
    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
    : `${formatDate(startDate)} - Present`;

  return (
    <article className="experience-card">
      <div className="experience-card__header">
        <div className="experience-card__main">
          <h3 className="experience-card__position">{position}</h3>
          <p className="experience-card__company">{company}</p>
        </div>
        <div className="experience-card__meta">
          <span className="experience-card__duration">{duration}</span>
          {location && (
            <span className="experience-card__location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {location}
            </span>
          )}
        </div>
      </div>
      
      {description && (
        <p className="experience-card__description">{description}</p>
      )}
    </article>
  );
};
