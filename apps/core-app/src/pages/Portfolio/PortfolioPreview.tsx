import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '../../stores/portfolioStore';
import { PortfolioHeader, PortfolioOverview, PortfolioSkeleton } from '../../components/Portfolio';

export const PortfolioPreview: React.FC = () => {
  const navigate = useNavigate();
  const { portfolio, loading, error, fetchMyPortfolio } = usePortfolioStore();

  useEffect(() => {
    fetchMyPortfolio();
  }, [fetchMyPortfolio]);

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
        <h1>Error Loading Portfolio</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
          {error}
        </p>
        <button 
          onClick={() => navigate('/dashboard/portfolio')}
          style={{
            padding: '10px 20px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--border-radius-sm)',
            cursor: 'pointer'
          }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  return (
    <div className="portfolio-preview">
      <div style={{
        background: 'var(--color-primary)',
        color: 'white',
        padding: '12px 20px',
        textAlign: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Preview Mode - This is how your portfolio will appear to visitors</span>
        <button 
          onClick={() => navigate('/dashboard/portfolio')}
          style={{
            padding: '8px 16px',
            background: 'white',
            color: 'var(--color-primary)',
            border: 'none',
            borderRadius: 'var(--border-radius-sm)',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Edit Portfolio
        </button>
      </div>
      
      <PortfolioHeader portfolio={portfolio} />
      <PortfolioOverview portfolio={portfolio} />
    </div>
  );
};
