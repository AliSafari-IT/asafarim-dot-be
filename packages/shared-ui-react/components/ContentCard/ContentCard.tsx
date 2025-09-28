import React from 'react';
import './ContentCard.css';

export interface ContentCardProps {
  /** Title of the content card */
  title: string;
  /** Subtitle or author information */
  subtitle?: string;
  /** Publication date, journal name, or other secondary information */
  meta?: string;
  /** Main content or abstract */
  description?: string;
  /** URL for the content, if clickable */
  link?: string;
  /** Image URL for thumbnail */
  imageUrl?: string;
  /** Alternative to imageUrl, shows a colored gradient background */
  useGradient?: boolean;
  /** Tags or categories for the content */
  tags?: string[];
  /** Citation count or other metrics */
  metrics?: {
    label: string;
    value: string | number;
  }[];
  /** Content type: project, article, publication, report */
  variant?: 'project' | 'article' | 'publication' | 'report' | 'default';
  /** Card size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Whether the card should take full width */
  fullWidth?: boolean;
  /** Whether the card should be elevated */
  elevated?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Custom action button */
  actionButton?: React.ReactNode;
  /** Icon to display next to title */
  icon?: React.ReactNode;
  /** Year of publication or creation */
  year?: string | number;
  /** Whether the card is clickable as a whole */
  clickable?: boolean;
  /** Whether the card is featured */
  featured?: boolean;
  /** Custom header content */
  headerContent?: React.ReactNode;
  /** Custom footer content */
  footerContent?: React.ReactNode;
  /** Additional props */
  [key: string]: any;
}

const ContentCard: React.FC<ContentCardProps> = ({
  title,
  subtitle,
  meta,
  description,
  link,
  imageUrl,
  useGradient = false,
  tags = [],
  metrics = [],
  variant = 'default',
  size = 'md',
  className = '',
  fullWidth = false,
  elevated = false,
  bordered = true,
  actionButton,
  icon,
  year,
  clickable = false,
  featured = false,
  headerContent,
  footerContent,
  ...props
}) => {
  // Combine all classes
  const cardClasses = [
    'content-card',
    `content-card--${variant}`,
    `content-card--${size}`,
    fullWidth && 'content-card--full-width',
    elevated && 'content-card--elevated',
    bordered && 'content-card--bordered',
    clickable && 'content-card--clickable',
    featured && 'content-card--featured',
    className
  ].filter(Boolean).join(' ');

  // Determine if we should render as a link
  const isLink = Boolean(link && clickable);
  
  // Card content
  const cardContent = (
    <>
      {(imageUrl || useGradient) && (
        <div className="content-card__media">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="content-card__image" />
          ) : (
            <div className="content-card__gradient"></div>
          )}
          {featured && <span className="content-card__featured-badge">Featured</span>}
        </div>
      )}
      
      {headerContent && (
        <div className="content-card__header">
          {headerContent}
        </div>
      )}
      
      <div className="content-card__content">
        <div className="content-card__title-row">
          {icon && <span className="content-card__icon">{icon}</span>}
          <h3 className="content-card__title">{title}</h3>
          {year && <span className="content-card__year">{year}</span>}
        </div>
        
        {subtitle && <h4 className="content-card__subtitle">{subtitle}</h4>}
        
        {meta && <div className="content-card__meta">{meta}</div>}
        
        {description && <p className="content-card__description">{description}</p>}
        
        {tags.length > 0 && (
          <div className="content-card__tags">
            {tags.map((tag, index) => (
              <span key={index} className="content-card__tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {metrics.length > 0 && (
          <div className="content-card__metrics">
            {metrics.map((metric, index) => (
              <div key={index} className="content-card__metric">
                <span className="content-card__metric-value">{metric.value}</span>
                <span className="content-card__metric-label">{metric.label}</span>
              </div>
            ))}
          </div>
        )}
        
        {actionButton && !clickable && (
          <div className="content-card__actions">
            {actionButton}
          </div>
        )}
      </div>
      
      {footerContent && (
        <div className="content-card__footer">
          {footerContent}
        </div>
      )}
    </>
  );

  // Render as link if clickable and has link
  if (isLink) {
    return (
      <a 
        href={link} 
        className={cardClasses}
        target={link?.startsWith('http') ? '_blank' : undefined}
        rel={link?.startsWith('http') ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {cardContent}
      </a>
    );
  }

  // Regular card
  return (
    <div className={cardClasses} {...props}>
      {cardContent}
      {link && !clickable && (
        <a 
          href={link}
          className="content-card__link"
          target={link.startsWith('http') ? '_blank' : undefined}
          rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          View {variant === 'publication' ? 'Publication' : 
                variant === 'article' ? 'Article' : 
                variant === 'report' ? 'Report' : 'Project'}
        </a>
      )}
    </div>
  );
};

export default ContentCard;
