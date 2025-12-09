// packages/shared-ui-react/components/FormErrorBoundary/FormErrorBoundary.tsx
import React from 'react';
import './FormErrorBoundary.css';

export interface FormErrorBoundaryProps {
  /** Record of field names to error messages */
  errors: Record<string, string>;
  /** Optional callback when errors are cleared/dismissed */
  onClear?: () => void;
  /** Child elements to wrap */
  children: React.ReactNode;
  /** Optional custom title for the error banner */
  title?: string;
  /** Optional className for the wrapper */
  className?: string;
}

/**
 * FormErrorBoundary - A reusable component that displays validation errors
 * in an accessible, dismissible banner above form content.
 * 
 * Uses ASafariM Design Tokens exclusively for styling.
 */
export const FormErrorBoundary: React.FC<FormErrorBoundaryProps> = ({
  errors,
  onClear,
  children,
  title = 'Please fix the following errors:',
  className,
}) => {
  const errorEntries = Object.entries(errors).filter(([, value]) => value);
  const hasErrors = errorEntries.length > 0;

  return (
    <div className={className}>
      {hasErrors && (
        <div
          className="form-error-boundary__banner"
          role="alert"
          aria-live="assertive"
        >
          <div className="form-error-boundary__content">
            <p className="form-error-boundary__title">{title}</p>
            <ul className="form-error-boundary__list">
              {errorEntries.map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </div>
          {onClear && (
            <button
              type="button"
              className="form-error-boundary__dismiss"
              onClick={onClear}
              aria-label="Dismiss errors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

FormErrorBoundary.displayName = 'FormErrorBoundary';

export default FormErrorBoundary;
