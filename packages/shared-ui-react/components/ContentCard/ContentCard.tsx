import React from 'react';
import './ContentCard.css';

export interface ContentCardProps {
  /** 
   * publication id
   */
  id?: string;
  /** 
   * Title of the content card
   */
  title: string;
  /** 
   * Subtitle or author information
   */
  subtitle?: string;
  /** 
   * Publication date, journal name, or other secondary information
   */
  meta?: string;
  /** 
   * Main content or abstract
   */
  description?: string;
  /** 
   * URL for the content, if clickable
   */
  link?: string;
  /** 
   * Image URL for thumbnail
   */
  imageUrl?: string;
  /** 
   * Alternative to imageUrl, shows a colored gradient background
   */
  useGradient?: boolean;
  /** 
   * Tags or categories for the content
   */
  tags?: string[];
  /** 
   * Citation count or other metrics
   */
  metrics?: {
    label: string;
    value: string | number;
  }[];
  /** 
   * Content type: project, article, publication, report
   */
  variant?: 'project' | 'article' | 'publication' | 'report' | 'default';
  /** 
   * Card size
   */
  size?: 'sm' | 'md' | 'lg';
  /** 
   * Additional CSS classes
   */
  className?: string;
  /** 
   * Whether the card should take full width
   */
  fullWidth?: boolean;
  /** 
   * Whether the card should be elevated
   */
  elevated?: boolean;
  /** 
   * Whether to show a border
   */
  bordered?: boolean;
  /** 
   * Custom action button
   */
  actionButton?: React.ReactNode;
  /** 
   * Icon to display next to title
   */
  icon?: React.ReactNode;
  /** 
   * Year of publication or creation
   */
  year?: string | number;
  /** 
   * Whether the card is clickable as a whole
   */
  clickable?: boolean;
  /** 
   * Whether the card is featured
   */
  featured?: boolean;
  /** 
   * Custom header content
   */
  headerContent?: React.ReactNode;
  /** 
   * Custom footer content
   */
  footerContent?: React.ReactNode;
  /** 
   * userId of the user who created the publication
   */
  userId?: string;
  /** 
   * Whether to show the image
   */
  showImage?: boolean;
  /** 
   * Additional props
   */
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
  userId,
  showImage = false,
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

  // Determine if we should show the View Publication button
  const hasViewRoute = Boolean(userId && props.id);
  const viewPublicationUrl = hasViewRoute ? `/portfolio/${userId}/publications/view/${props.id}` : undefined;
  
  // Card content
  const cardContent = (
    <>
      {showImage && (imageUrl || useGradient) && (
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
        
        {/* External link (if available) - display as hyperlink under description */}
        {link && (
          <div className="content-card__external-link">
            <a 
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="content-card__link"
            >
              {link}
            </a>
          </div>
        )}
        
        {/* View Publication button - placed before tags */}
        {hasViewRoute && (
          <div className="content-card__view-action">
            <a 
              href={viewPublicationUrl}
              className="content-card__view-button"
            >
              View Publication
            </a>
          </div>
        )}
        
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

  // Always render as regular card (no clickable wrapper)
  return (
    <div className={cardClasses} {...props}>
      {cardContent}
    </div>
  );
};

export default ContentCard;
