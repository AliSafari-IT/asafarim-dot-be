import React from 'react';
import type { Publication } from '../../../types/portfolio.types';
import './PublicationCard.css';

interface PublicationCardProps {
  publication: Publication;
}

export const PublicationCard: React.FC<PublicationCardProps> = ({ publication }) => {
  const { title, journalName, link, createdAt } = publication;

  const year = new Date(createdAt).getFullYear();

  return (
    <article className="publication-card">
      <div className="publication-card__content">
        <h3 className="publication-card__title">
          {link ? (
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="publication-card__link"
            >
              {title}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          ) : (
            title
          )}
        </h3>
        
        <div className="publication-card__meta">
          {journalName && (
            <span className="publication-card__journal">{journalName}</span>
          )}
          <span className="publication-card__year">{year}</span>
        </div>
      </div>
    </article>
  );
};
