import React from 'react';

export type SortDirection = 'asc' | 'desc' | null;

interface SortIconProps {
  direction: SortDirection;
  className?: string;
}

export const SortIcon: React.FC<SortIconProps> = ({ direction, className = '' }) => {
  if (direction === 'asc') {
    return (
      <span className={`sort-icon ${className}`} aria-label="Sorted ascending">
        ↑
      </span>
    );
  }
  
  if (direction === 'desc') {
    return (
      <span className={`sort-icon ${className}`} aria-label="Sorted descending">
        ↓
      </span>
    );
  }
  
  return null;
};
