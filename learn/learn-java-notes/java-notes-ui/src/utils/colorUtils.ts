/**
 * Generate a deterministic hue value (0-360) from a string
 */
export function stringToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash % 360);
}

/**
 * Generate tag color CSS variables based on tag name
 * Returns inline style object with CSS custom properties
 */
export function getTagColorStyle(tagName: string, isDark: boolean = false) {
  const hue = stringToHue(tagName);
  
  if (isDark) {
    return {
      "--tag-bg": `hsl(${hue}, 45%, 35%)`,
      "--tag-bg-hover": `hsl(${hue}, 50%, 40%)`,
      "--tag-text-color": `hsl(${hue}, 60%, 85%)`,
    } as React.CSSProperties;
  }
  
  return {
    "--tag-bg": `hsl(${hue}, 55%, 50%)`,
    "--tag-bg-hover": `hsl(${hue}, 60%, 45%)`,
    "--tag-text-color": `hsl(0, 0%, 100%)`,
  } as React.CSSProperties;
}

/**
 * Get a border color for tag indicators
 */
export function getTagBorderColor(tagName: string): string {
  const hue = stringToHue(tagName);
  return `hsl(${hue}, 60%, 50%)`;
}
