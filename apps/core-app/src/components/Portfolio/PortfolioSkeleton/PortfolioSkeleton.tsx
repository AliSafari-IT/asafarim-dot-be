import React from 'react';
import './PortfolioSkeleton.css';

export const PortfolioSkeleton: React.FC = () => {
  return (
    <div className="portfolio-skeleton">
      {/* Header Skeleton */}
      <div className="portfolio-skeleton__header">
        <div className="skeleton skeleton--circle"></div>
        <div className="portfolio-skeleton__header-content">
          <div className="skeleton skeleton--title"></div>
          <div className="skeleton skeleton--subtitle"></div>
          <div className="skeleton skeleton--text"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="portfolio-skeleton__content">
        {/* Section Title */}
        <div className="skeleton skeleton--section-title"></div>
        
        {/* Grid of Cards */}
        <div className="portfolio-skeleton__grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="portfolio-skeleton__card">
              <div className="skeleton skeleton--image"></div>
              <div className="skeleton skeleton--card-title"></div>
              <div className="skeleton skeleton--text"></div>
              <div className="skeleton skeleton--text skeleton--text-short"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
