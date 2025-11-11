// LayoutContainer.tsx responsive and themeable
import { type PropsWithChildren, useEffect } from "react";

export type ContainerSize = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";

export interface LayoutContainerProps {
  title?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export interface PageContainerProps {
  /**
   * Maximum width of the content container
   * @default "2xl" (1200px)
   */
  maxWidth?: ContainerSize;
  /**
   * Whether to add horizontal padding
   * @default true
   */
  withPadding?: boolean;
  /**
   * Additional CSS class names
   */
  className?: string;
  /**
   * HTML element type
   * @default "main"
   */
  as?: "div" | "main" | "section" | "article" | "aside";
}

/**
 * LayoutContainer - Full page layout wrapper with header and footer
 */
export function LayoutContainer({
  children,
  title,
  header,
  footer,
}: PropsWithChildren<LayoutContainerProps>) {
  useEffect(() => {
    if (title) {
      document.title = title || "ASafariM";
    }
  }, [title]);

  return (
    <div className="layout-page-wrapper">
      {header}
      {children}
      {footer}
    </div>
  );
}

/**
 * PageContainer - Responsive content container with width constraints
 * 
 * Use this component to wrap your page content for consistent responsive behavior.
 * 
 * Width breakpoints:
 * - 2xs: 240px - Very narrow content
 * - xs: 320px - Narrow content
 * - sm: 480px - Small content
 * - md: 640px - Medium content
 * - lg: 768px - Large content
 * - xl: 1024px - Extra large content
 * - 2xl: 1200px - Maximum content width (default)
 * - full: 100% - Full width
 * 
 * @example
 * ```tsx
 * <PageContainer maxWidth="xl" withPadding>
 *   <h1>My Page</h1>
 *   <p>Content here...</p>
 * </PageContainer>
 * ```
 */
export function PageContainer({
  children,
  maxWidth = "2xl",
  withPadding = true,
  className = "",
  as: Component = "main",
}: PropsWithChildren<PageContainerProps>) {
  const classes = [
    "layout-container",
    `layout-container--${maxWidth}`,
    withPadding && "layout-container--padded",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Component className={classes}>{children}</Component>;
}
