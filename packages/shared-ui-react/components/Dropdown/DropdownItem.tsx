import type { ReactNode } from 'react';
import { useDropdownContext } from './DropdownContext';

export interface DropdownItemProps {
  id?: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  'data-testid'?: string;
}

export const DropdownItem = ({
  id,
  label,
  icon,
  disabled = false,
  danger = false,
  active = false,
  onClick,
  className = '',
  'data-testid': testId,
}: DropdownItemProps) => {
  const { close } = useDropdownContext();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    close();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      id={id}
      className={`dropdown-item ${disabled ? 'dropdown-item--disabled' : ''} ${danger ? 'dropdown-item--danger' : ''} ${active ? 'dropdown-item--active' : ''} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      data-testid={testId}
    >
      {icon && (
        <span className="dropdown-item__icon">
          {icon}
        </span>
      )}
      <span className="dropdown-item__label">
        {label}
      </span>
    </button>
  );
};
