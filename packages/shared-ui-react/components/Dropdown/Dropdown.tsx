import { useEffect, useRef, type ReactNode } from 'react';
import { useDropdown } from './useDropdown';
import { useClickOutside } from './useClickOutside';
import { DropdownContext } from './DropdownContext';
import type { DropdownPlacement } from './types';
import './Dropdown.css';

export interface DropdownProps {
  children: ReactNode;
  items?: ReactNode;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  placement?: DropdownPlacement;
  autoFlip?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  menuClassName?: string;
  'data-testid'?: string;
}

export const Dropdown = ({
  children,
  items,
  isOpen: controlledIsOpen,
  onToggle,
  placement = 'bottom-start',
  autoFlip = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  className = '',
  menuClassName = '',
  'data-testid': testId,
}: DropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const {
    isOpen: internalIsOpen,
    toggle,
    close,
    setPlacement,
  } = useDropdown();

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  useClickOutside(dropdownRef, () => {
    if (isOpen && closeOnClickOutside) {
      close();
      onToggle?.(false);
    }
  });

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && closeOnEscape) {
        close();
        onToggle?.(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, close, onToggle]);

  useEffect(() => {
    if (autoFlip && isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      if (rect.bottom > viewportHeight) {
        setPlacement('top-start');
      } else if (rect.right > viewportWidth) {
        setPlacement('bottom-end');
      } else {
        setPlacement(placement);
      }
    }
  }, [isOpen, placement, autoFlip, setPlacement]);

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    if (controlledIsOpen === undefined) {
      toggle();
    }
    onToggle?.(newIsOpen);
  };

  const contextValue = {
    isOpen,
    toggle: handleToggle,
    close,
    placement,
  };

  return (
    <DropdownContext.Provider value={contextValue}>
      <div
        ref={dropdownRef}
        className={`dropdown ${className}`}
        data-testid={testId}
      >
        <div
          ref={triggerRef}
          className="dropdown-trigger"
          onClick={handleToggle}
          role="button"
          tabIndex={0}
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          {children}
        </div>

        {isOpen && (
          <div
            className={`dropdown-menu dropdown-menu--${placement} ${menuClassName}`}
            role="menu"
            aria-hidden={!isOpen}
            data-state="open"
          >
            {items}
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  );
};
