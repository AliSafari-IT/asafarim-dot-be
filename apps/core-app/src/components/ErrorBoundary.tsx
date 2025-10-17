import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // Optionally reload the page
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            maxWidth: '600px',
            margin: '100px auto',
            padding: '40px 20px',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              marginBottom: '20px',
            }}
          >
            ⚠️
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 600,
              marginBottom: '16px',
              color: 'var(--color-text-primary, #1f2937)',
            }}
          >
            Unexpected Application Error
          </h1>
          <p
            style={{
              color: 'var(--color-text-secondary, #6b7280)',
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: '1.5',
            }}
          >
            {this.state.error?.message || 'Something went wrong. Please try again.'}
          </p>
          
          {import.meta.env.DEV && this.state.errorInfo && (
            <details
              style={{
                marginTop: '20px',
                padding: '16px',
                background: 'var(--color-surface, #f9fafb)',
                borderRadius: '8px',
                textAlign: 'left',
                fontSize: '14px',
                maxHeight: '300px',
                overflow: 'auto',
              }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '8px' }}>
                Error Details (Development Only)
              </summary>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '12px',
                  color: 'var(--color-text-secondary, #6b7280)',
                }}
              >
                {this.state.error?.stack}
                {'\n\n'}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}

          <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 20px',
                background: 'var(--color-primary, #3b82f6)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              Go to Home
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                background: 'var(--color-surface, #f9fafb)',
                color: 'var(--color-text-primary, #1f2937)',
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
