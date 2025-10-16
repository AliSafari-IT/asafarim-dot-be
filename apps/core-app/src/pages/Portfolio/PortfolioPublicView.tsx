import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePortfolioStore } from '../../stores/portfolioStore';
import { PortfolioHeader, PortfolioOverview, PortfolioSkeleton } from '../../components/Portfolio';
import { updatePageMeta } from '../../utils/seo';

export const PortfolioPublicView: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { portfolio, loading, error, fetchPublicPortfolio } = usePortfolioStore();

  useEffect(() => {
    if (username) {
      fetchPublicPortfolio(username);
    }
  }, [username, fetchPublicPortfolio]);

  useEffect(() => {
    if (portfolio) {
      updatePageMeta({
        title: `${portfolio.displayName} - Portfolio`,
        description: portfolio.settings.metaDescription || portfolio.headline || `View ${portfolio.displayName}'s portfolio`,
        author: portfolio.displayName,
      });
    }
  }, [portfolio]);

  if (loading) {
    return <PortfolioSkeleton />;
  }

  if (error) {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '100px auto', 
        padding: '20px', 
        textAlign: 'center' 
      }}>
        <h1>Portfolio Not Found</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {error}
        </p>
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  // Check if portfolio is public
  if (!portfolio.settings.isPublic) {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '100px auto', 
        padding: '20px', 
        textAlign: 'center' 
      }}>
        <h1>Portfolio Private</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          This portfolio is not publicly available.
        </p>
      </div>
    );
  }

  return (
    <div className="portfolio-public-view">
      <PortfolioHeader portfolio={portfolio} />
      <PortfolioOverview portfolio={portfolio} />
    </div>
  );
};
