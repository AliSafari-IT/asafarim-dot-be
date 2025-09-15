import React from 'react';
import './Button.css';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'ghost' | 'outline' | 'link' | 'brand';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  // Link-specific props
  to?: string; // For React Router navigation
  href?: string; // For external links
  target?: string; // For external links (e.g., "_blank")
  rel?: string; // For external links (e.g., "noopener noreferrer")
  // Common HTML attributes
  onClick?: React.MouseEventHandler<HTMLElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLElement>;
  id?: string;
  title?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean;
  role?: string;
  tabIndex?: number;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  rounded = false,
  children,
  className = '',
  disabled,
  to,
  href,
  target,
  rel,
  ...props
}) => {
  const baseClasses = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full-width',
    rounded && 'btn--rounded',
    isLoading && 'btn--loading',
    disabled && 'btn--disabled',
    className
  ].filter(Boolean).join(' ');

  // Determine if this should render as a link
  // Treat presence of `to` or `href` as a link regardless of visual variant
  const isLink = Boolean(to || href);
  const isExternalLink = Boolean(href && /^(https?:)?\/\//i.test(href));

  // Common content for all variants
  const buttonContent = (
    <>
      {isLoading && (
        <span className="btn__loader" aria-hidden="true">
          <svg className="btn__spinner" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}

      {!isLoading && leftIcon && (
        <span className="btn__icon btn__icon--left" aria-hidden="true">
          {leftIcon}
        </span>
      )}

      <span className="btn__content">
        {children}
      </span>

      {!isLoading && rightIcon && (
        <span className="btn__icon btn__icon--right" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </>
  );

  // Render as external link
  if (isLink && isExternalLink) {
    return (
      <a
        href={href}
        target={target || '_blank'}
        rel={rel || 'noopener noreferrer'}
        className={baseClasses}
        {...props}
      >
        {buttonContent}
      </a>
    );
  }

  // Render as internal link (React Router-like). We use a regular anchor to avoid hard dependency.
  if (isLink && to) {
    // For now, use regular anchor tag
    // In a real implementation, you'd check if React Router is available
    return (
      <a
        href={to}
        className={baseClasses}
        {...props}
      >
        {buttonContent}
      </a>
    );
  }

  // Render as regular button
  return (
    <button
      className={baseClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {buttonContent}
    </button>
  );
};

export default Button;
