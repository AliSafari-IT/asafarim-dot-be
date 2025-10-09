/**
 * Utilities for persisting theme preferences
 */

import type { ThemeMode } from '../types';

/**
 * Get theme mode from localStorage
 */
export function getStoredThemeMode(storageKey: string): ThemeMode | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored && isValidThemeMode(stored)) {
      return stored as ThemeMode;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  
  return null;
}

/**
 * Save theme mode to localStorage
 */
export function setStoredThemeMode(storageKey: string, mode: ThemeMode): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(storageKey, mode);
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error);
  }
}

/**
 * Remove theme mode from localStorage
 */
export function removeStoredThemeMode(storageKey: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.warn('Failed to remove theme from localStorage:', error);
  }
}

/**
 * Check if a string is a valid theme mode
 */
function isValidThemeMode(value: string): boolean {
  return ['light', 'dark', 'system'].includes(value);
}
