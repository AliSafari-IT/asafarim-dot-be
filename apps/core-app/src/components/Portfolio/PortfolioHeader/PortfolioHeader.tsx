import React from 'react';
import type { PublicPortfolio } from '../../../types/portfolio.types';
import './PortfolioHeader.css';

interface PortfolioHeaderProps {
  portfolio: PublicPortfolio;
}

export const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({ portfolio }) => {
  const { displayName, headline, bio, profileImageUrl, contact } = portfolio;

  return (
    <header className="portfolio-header">
      <div className="portfolio-header__container">
        {profileImageUrl && (
          <div className="portfolio-header__avatar">
            <img 
              src={profileImageUrl} 
              alt={displayName}
              className="portfolio-header__avatar-img"
            />
          </div>
        )}
        
        <div className="portfolio-header__content">
          <h1 className="portfolio-header__name">{displayName}</h1>
          
          {headline && (
            <p className="portfolio-header__headline">{headline}</p>
          )}
          
          {bio && (
            <p className="portfolio-header__bio">{bio}</p>
          )}
          
          {contact && portfolio.settings.showContactInfo && (
            <div className="portfolio-header__contact">
              {contact.email && (
                <a 
                  href={`mailto:${contact.email}`}
                  className="portfolio-header__contact-link"
                  aria-label="Email"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  {contact.email}
                </a>
              )}
              
              {contact.location && (
                <span className="portfolio-header__contact-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {contact.location}
                </span>
              )}
              
              {contact.phone && (
                <a 
                  href={`tel:${contact.phone}`}
                  className="portfolio-header__contact-link"
                  aria-label="Phone"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  {contact.phone}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
