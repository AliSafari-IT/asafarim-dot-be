import { createContext, useContext } from 'react';
import type { DropdownPlacement } from './types';

export interface DropdownContextValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  placement: DropdownPlacement;
}

export const DropdownContext = createContext<DropdownContextValue | null>(null);

export const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown provider');
  }
  return context;
};
