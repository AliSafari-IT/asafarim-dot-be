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
    return (
      <div style={{
        maxWidth: '600px',
        margin: '100px auto',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '20px',
        }}>
          📁
        </div>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 600,
          marginBottom: '16px',
          color: 'var(--color-text-primary, #1f2937)',
        }}>
          No Portfolio Yet
        </h1>
        <p style={{
          color: 'var(--color-text-secondary, #6b7280)',
          marginBottom: '32px',
          fontSize: '16px',
          lineHeight: '1.5',
        }}>
          You haven't created a portfolio yet. A portfolio lets you showcase your projects,
          work experience, and publications in a beautiful, shareable format.
        </p>
        <button
          onClick={() => navigate('/dashboard/portfolio')}
          style={{
            padding: '12px 24px',
            background: 'var(--color-primary, #3b82f6)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 600,
            marginRight: '12px'
          }}
        >
          Create Portfolio
        </button>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '12px 24px',
            background: 'var(--color-surface, #f9fafb)',
            color: 'var(--color-text-primary, #1f2937)',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="portfolio-preview">
      <div style={{
        background: 'var(--color-primary)',
        color: 'white',
        padding: '12px 20px',
        textAlign: 'center',
        position: 'fixed',
        top: '4rem',
        left: 0,
        right: 0,
        zIndex: 999,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
      
      {/* Spacer to prevent content from hiding under fixed banner */}
      <div style={{ height: 'calc(4rem + 48px)' }} />
      
      <PortfolioHeader portfolio={portfolio} />
      <PortfolioOverview portfolio={portfolio} />
    </div>
  );
};
