import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
  children: React.ReactNode;
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

  return (
    <button
      className={baseClasses}
      disabled={disabled || isLoading}
      {...props}
    >
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
    </button>
  );
};

export default Button;
