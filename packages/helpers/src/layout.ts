// Viewport / layout helpers

export type ViewportCategory = "mobile" | "tablet" | "desktop";

/** Safely get current viewport width (returns 0 on server / non-browser envs). */
export function getViewportWidth(): number {
  if (typeof window === "undefined") return 0;
  return window.innerWidth || 0;
}

/** Determine viewport category based on width breakpoints. */
export function getViewportCategory(width: number = getViewportWidth()): ViewportCategory {
  if (width <= 0) return "desktop"; // sensible default for SSR
  if (width < 768) return "mobile";
  if (width < 1280) return "tablet";
  return "desktop";
}

export function isMobileViewport(width?: number): boolean {
  return getViewportCategory(width) === "mobile";
}

export function isTabletViewport(width?: number): boolean {
  return getViewportCategory(width) === "tablet";
}

export function isDesktopViewport(width?: number): boolean {
  return getViewportCategory(width) === "desktop";
}
