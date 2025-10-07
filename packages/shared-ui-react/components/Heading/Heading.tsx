import React from 'react';
import './Heading.css';

export interface HeadingProps {
  /**
   * Semantic HTML heading level (1-6)
   */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Visual styling variant
   */
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'display' | 'subtitle' | 'caption';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right';
  /**
   * Font weight
   */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  /**
   * Text color variant
   */
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'accent';
  /**
   * Whether the heading should be uppercase
   */
  uppercase?: boolean;
  /**
   * Custom font size (overrides variant sizing)
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  /**
   * Line height
   */
  lineHeight?: 'tight' | 'normal' | 'relaxed';
  /**
   * Margin bottom spacing
   */
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Whether to truncate text with ellipsis
   */
  truncate?: boolean;
  /**
   * Children content
   */
  children: React.ReactNode;
  /**
   * Additional props passed to the underlying element
   */
  [key: string]: any;
}

const Heading: React.FC<HeadingProps> = ({
  level,
  variant,
  className = '',
  align = 'left',
  weight = 'bold',
  color = 'default',
  uppercase = false,
  size,
  lineHeight = 'normal',
  marginBottom = 'md',
  truncate = false,
  children,
  ...props
}) => {
  // Determine the variant if not explicitly set
  const headingVariant = variant || `h${level}` as HeadingProps['variant'];

  // Build CSS classes
  const headingClasses = [
    'heading',
    `heading--${headingVariant}`,
    `heading--align-${align}`,
    `heading--weight-${weight}`,
    `heading--color-${color}`,
    `heading--line-height-${lineHeight}`,
    `heading--margin-bottom-${marginBottom}`,
    uppercase && 'heading--uppercase',
    truncate && 'heading--truncate',
    size && `heading--size-${size}`,
    className
  ].filter(Boolean).join(' ');

  // Create the appropriate semantic element based on level
  const renderHeadingElement = () => {
    const commonProps = {
      className: headingClasses,
      ...props
    };

    switch (level) {
      case 1:
        return <h1 {...commonProps}>{children}</h1>;
      case 2:
        return <h2 {...commonProps}>{children}</h2>;
      case 3:
        return <h3 {...commonProps}>{children}</h3>;
      case 4:
        return <h4 {...commonProps}>{children}</h4>;
      case 5:
        return <h5 {...commonProps}>{children}</h5>;
      case 6:
        return <h6 {...commonProps}>{children}</h6>;
      default:
        return <h2 {...commonProps}>{children}</h2>;
    }
  };

  return renderHeadingElement();
};

export default Heading;
