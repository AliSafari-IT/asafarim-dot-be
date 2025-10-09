import { useState, useCallback } from 'react';
import type { DropdownPlacement } from './types';

export const useDropdown = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [placement, setPlacement] = useState<DropdownPlacement>('bottom-start');

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, toggle, open, close, placement, setPlacement };
};
