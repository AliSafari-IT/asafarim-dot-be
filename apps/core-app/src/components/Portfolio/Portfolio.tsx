import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '../../stores/portfolioStore';
import { PortfolioHeader } from './PortfolioHeader/PortfolioHeader';
import { PortfolioOverview } from './PortfolioOverview/PortfolioOverview';
import { PortfolioSkeleton } from './PortfolioSkeleton/PortfolioSkeleton';

const Portfolio: React.FC = () => {
  const navigate = useNavigate();
  const { portfolio, loading, error, fetchMyPortfolio } = usePortfolioStore();

  useEffect(() => {
    fetchMyPortfolio().catch(err => {
      console.error('Failed to fetch portfolio:', err);
      // If error message indicates authentication issue, redirect to login
      if (err.message && err.message.includes('Authentication required')) {
        // Error handler will redirect, no need to do anything here
        return;
      }
    });
  }, [fetchMyPortfolio]);

  if (loading) {
    return <PortfolioSkeleton />;
  }

  if (error) {
    // Check if it's an authentication error
    const isAuthError = error.includes('Authentication required') || 
                        error.includes('401') || 
                        error.includes('text/html');
    
    return (
      <div style={{ 
        maxWidth: '700px', 
        margin: '80px auto', 
        padding: '40px', 
        textAlign: 'center',
        background: 'var(--color-surface, #ffffff)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>
          {isAuthError ? '🔒' : '⚠️'}
        </div>
        
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 700, 
          marginBottom: '16px',
          color: 'var(--color-text-primary, #1f2937)'
        }}>
          {isAuthError ? 'Authentication Required' : 'Portfolio Not Found'}
        </h1>
        
        <p style={{ 
          color: 'var(--color-text-secondary, #6b7280)', 
          marginBottom: '32px',
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          {isAuthError 
            ? 'Please sign in to view your portfolio. If you just signed out, your session has been cleared successfully.'
            : 'Your portfolio hasn\'t been created yet. Get started by creating your first portfolio to showcase your projects and achievements.'}
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {isAuthError ? (
            <>
              <button 
                onClick={() => window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)}
                style={{
                  padding: '12px 24px',
                  background: 'var(--color-primary, #3b82f6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/')}
                style={{
                  padding: '12px 24px',
                  background: 'var(--color-surface, #f9fafb)',
                  color: 'var(--color-text-primary, #1f2937)',
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                Go to Home
              </button>
            </>
          ) : (
            <>
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
                  fontWeight: 600
                }}
              >
                Create Portfolio
              </button>
              <button 
                onClick={() => navigate('/')}
                style={{
                  padding: '12px 24px',
                  background: 'var(--color-surface, #f9fafb)',
                  color: 'var(--color-text-primary, #1f2937)',
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                Go to Home
              </button>
            </>
          )}
        </div>

        {/* Technical error details (collapsible) */}
        <details style={{ 
          marginTop: '32px', 
          textAlign: 'left',
          padding: '16px',
          background: 'var(--color-surface, #f9fafb)',
          borderRadius: '8px'
        }}>
          <summary style={{ 
            cursor: 'pointer', 
            fontWeight: 600,
            color: 'var(--color-text-secondary, #6b7280)',
            fontSize: '14px'
          }}>
            Technical Details
          </summary>
          <pre style={{ 
            marginTop: '12px',
            padding: '12px',
            background: '#1f2937',
            color: '#f9fafb',
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {error}
          </pre>
        </details>
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

export default Portfolio;
