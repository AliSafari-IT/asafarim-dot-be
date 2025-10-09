/**
 * Utilities for managing CSS variables
 */

import type { Theme, CSSVariable } from '../types';

/**
 * Convert a theme object to CSS variables
 */
export function themeToCSSVariables(theme: Theme): CSSVariable[] {
  const variables: CSSVariable[] = [];
  
  // Add color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    variables.push({
      name: `--theme-color-${camelToKebab(key)}`,
      value,
    });
  });
  
  // Add spacing variables
  if (theme.spacing) {
    Object.entries(theme.spacing).forEach(([key, value]) => {
      variables.push({
        name: `--theme-spacing-${key}`,
        value,
      });
    });
  }
  
  // Add typography variables
  if (theme.typography) {
    variables.push({
      name: '--theme-font-family',
      value: theme.typography.fontFamily,
    });
    variables.push({
      name: '--theme-font-family-mono',
      value: theme.typography.fontFamilyMono,
    });
    
    // Font sizes
    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      variables.push({
        name: `--theme-font-size-${key}`,
        value,
      });
    });
    
    // Font weights
    Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
      variables.push({
        name: `--theme-font-weight-${key}`,
        value,
      });
    });
    
    // Line heights
    Object.entries(theme.typography.lineHeight).forEach(([key, value]) => {
      variables.push({
        name: `--theme-line-height-${key}`,
        value,
      });
    });
  }
  
  // Add shadow variables
  if (theme.shadows) {
    Object.entries(theme.shadows).forEach(([key, value]) => {
      variables.push({
        name: `--theme-shadow-${key}`,
        value,
      });
    });
  }
  
  // Add border radius variables
  if (theme.borderRadius) {
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      variables.push({
        name: `--theme-radius-${key}`,
        value,
      });
    });
  }
  
  // Add transition variables
  if (theme.transitions) {
    Object.entries(theme.transitions).forEach(([key, value]) => {
      variables.push({
        name: `--theme-transition-${key}`,
        value,
      });
    });
  }
  
  // Add custom variables
  if (theme.custom) {
    Object.entries(theme.custom).forEach(([key, value]) => {
      if (typeof value === 'string') {
        variables.push({
          name: `--theme-custom-${camelToKebab(key)}`,
          value,
        });
      }
    });
  }
  
  return variables;
}

/**
 * Apply CSS variables to the document root
 */
export function applyCSSVariables(variables: CSSVariable[]): void {
  const root = document.documentElement;
  
  variables.forEach(({ name, value }) => {
    root.style.setProperty(name, value);
  });
}

/**
 * Remove CSS variables from the document root
 */
export function removeCSSVariables(variables: CSSVariable[]): void {
  const root = document.documentElement;
  
  variables.forEach(({ name }) => {
    root.style.removeProperty(name);
  });
}

/**
 * Get a CSS variable value
 */
export function getCSSVariable(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Create a style element with transition styles
 */
export function createTransitionStyles(duration: number): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = `
    * {
      transition: background-color ${duration}ms ease-in-out,
                  border-color ${duration}ms ease-in-out,
                  color ${duration}ms ease-in-out,
                  fill ${duration}ms ease-in-out,
                  stroke ${duration}ms ease-in-out !important;
    }
  `;
  return style;
}

/**
 * Apply smooth transitions temporarily
 */
export function applyTransitionEffect(duration: number): void {
  const style = createTransitionStyles(duration);
  document.head.appendChild(style);
  
  // Remove after transition completes
  setTimeout(() => {
    document.head.removeChild(style);
  }, duration);
}
