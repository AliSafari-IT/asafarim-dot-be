import React from 'react';
import { ProjectCardProps, ProjectBudget, ProjectImage } from '../types';
import styles from './ProjectCard.module.css';

export const ProjectCard: React.FC<ProjectCardProps> = ({
  // Core properties
  title,
  description,
  image,
  techStacks,
  links,
  repo,

  // Theming and appearance
  currentTheme = 'light',
  className = '',
  showTechStackIcons = false,
  maxDescriptionLength = 150,
  isFeatured = false,

  // Behavior
  onCardClick,
  isLoading = false,

  // Status and metadata
  status = 'active',
  lastUpdated,

  // Additional properties from DB model
  priority,
  category,
  progress,
  tags,
  startDate,
  endDate,
  dueDate,
  createdAt,
  updatedAt,
  createdBy,
  updatedBy,
  budget,
  isPublic = true,
  relatedProjects,

  // Database specific
  id,
  userId,
}) => {
  const isDark = currentTheme === 'dark';

  // Helper functions
  const getLastUpdated = () => {
    if (lastUpdated) {
      return new Date(lastUpdated).toLocaleDateString();
    }
    if (updatedAt) {
      return new Date(updatedAt).toLocaleDateString();
    }
    return '';
  };

  const getDueDate = () => {
    if (dueDate) {
      return new Date(dueDate).toLocaleDateString();
    }
    return '';
  };

  const getStartDate = () => {
    if (startDate) {
      return new Date(startDate).toLocaleDateString();
    }
    return '';
  };

  const getEndDate = () => {
    if (endDate) {
      return new Date(endDate).toLocaleDateString();
    }
    return '';
  };

  const getBudgetDisplay = () => {
    if (!budget) return '';

    if (typeof budget === 'number') {
      return `$${budget.toLocaleString()}`;
    }

    if (typeof budget === 'object') {
      const { amount, currencySymbol = '$', currencyCode, currencyFormatOptions } = budget;

      // Create options object without spread operator
      const options: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: currencyCode || 'USD'
      };

      // Manually add currencyFormatOptions properties if they exist
      if (currencyFormatOptions) {
        if (currencyFormatOptions.minimumFractionDigits !== undefined) {
          options.minimumFractionDigits = currencyFormatOptions.minimumFractionDigits;
        }
        if (currencyFormatOptions.maximumFractionDigits !== undefined) {
          options.maximumFractionDigits = currencyFormatOptions.maximumFractionDigits;
        }
        if (currencyFormatOptions.useGrouping !== undefined) {
          options.useGrouping = currencyFormatOptions.useGrouping;
        }
      }

      const formatter = new Intl.NumberFormat('en-US', options);
      return formatter.format(amount);
    }

    return '';
  };

  const truncatedDescription = maxDescriptionLength && description.length > maxDescriptionLength
    ? `${description.substring(0, maxDescriptionLength)}...`
    : description;

  const getLinkIcon = (type: string) => {
    switch (type) {
      case 'demo':
        return '🚀';
      case 'repo':
        return '🐙';
      case 'documentation':
        return '📁';
      default:
        return '🔗';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'archived':
        return 'Archived';
      case 'in-progress':
        return 'In Progress';
      case 'draft':
        return 'Draft';
      case 'completed':
        return 'Completed';
      case 'coming-soon':
        return 'Coming Soon';
      case 'planning':
        return 'Planning';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'web':
        return '🌐';
      case 'mobile':
        return '📱';
      case 'desktop':
        return '💻';
      case 'backend':
        return '⚙️';
      case 'frontend':
        return '🎨';
      case 'fullstack':
        return '🔄';
      case 'database':
        return '🗄️';
      case 'devops':
        return '🐳';
      case 'design':
        return '🎨';
      case 'marketing':
        return '📢';
      case 'seo':
        return '🔍';
      case 'social':
        return '📱';
      case 'content':
        return '📝';
      case 'analytics':
        return '📊';
      case 'security':
        return '🔒';
      case 'testing':
        return '🧪';
      default:
        return '📁';
    }
  };

  const cardClasses = [
    styles.card,
    isDark ? styles.cardDark : '',
    isFeatured ? (isDark ? styles.featuredDark : styles.featured) : '',
    isLoading ? styles.loading : '',
    isPublic === false ? styles.private : '',
    status === 'archived' ? styles.archived : '',
    status === 'completed' ? styles.completed : '',
    status === 'draft' ? styles.draft : '',
    status === 'in-progress' ? styles.inProgress : '',
    status === 'coming-soon' ? styles.comingSoon : '',
    status === 'active' ? styles.active : '',
    status === 'planning' ? styles.planning : '',
    className
  ].filter(Boolean).join(' ');

  // Loading state
  if (isLoading) {
    return (
      <div className={cardClasses} style={{ width: '100%' }}>
        <div
          className={`${styles.loadingPlaceholder} ${isDark ? styles.loadingPlaceholderDark : ''}`}
          style={{
            height: '200px',
            marginBottom: '1rem',
            width: '100%',
            display: 'block'
          }}
        />
        <div
          className={`${styles.loadingPlaceholder} ${isDark ? styles.loadingPlaceholderDark : ''}`}
          style={{
            height: '1.5rem',
            marginBottom: '0.75rem',
            width: '100%',
            display: 'block'
          }}
        />
        <div
          className={`${styles.loadingPlaceholder} ${isDark ? styles.loadingPlaceholderDark : ''}`}
          style={{
            height: '3rem',
            marginBottom: '1rem',
            width: '100%',
            display: 'block'
          }}
        />
        <div
          className={`${styles.loadingPlaceholder} ${isDark ? styles.loadingPlaceholderDark : ''}`}
          style={{
            height: '2rem',
            width: '100%',
            display: 'block'
          }}
        />
      </div>
    );
  }

  return (
    <div className={cardClasses}>
      <div onClick={onCardClick} style={{ cursor: onCardClick ? 'pointer' : 'default' }}>
        {/* Image with Status Badge */}
        {image && (
          <div className={styles.imageContainer}>
            <img
              src={typeof image === 'string' ? image : image.src}
              alt={typeof image === 'string' ? title : image.alt || title}
              className={styles.image}
              loading="lazy"
              width={typeof image === 'object' ? image?.width : undefined}
              height={typeof image === 'object' ? image?.height : undefined}
            />
            {/* Status Badge positioned relative to image */}
            {status && (
              <div className={`${styles.status} ${styles[`status${status.charAt(0).toUpperCase() + status.slice(1).replace('-', '')}${isDark ? 'Dark' : ''}`]}`}>
                {getStatusLabel(status)}
              </div>
            )}
          </div>
        )}

        {/* Status Badge for cards without images */}
        {!image && status && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            marginBottom: '1rem',
            alignItems: 'center'
          }}>
            <div 
              className={`${styles.status} ${styles[`status${status.charAt(0).toUpperCase() + status.slice(1).replace('-', '')}${isDark ? 'Dark' : ''}`]}`}
              style={{ 
                position: 'static',
                margin: '0'
              }}
            >
              {getStatusLabel(status)}
            </div>
          </div>
        )}

        {/* Title */}
        <h3 className={`${styles.title} ${isDark ? styles.titleDark : ''}`}>
          {title}
        </h3>

        {/* Description */}
        <p className={`${styles.description} ${isDark ? styles.descriptionDark : ''}`}>
          {truncatedDescription}
        </p>
      </div>

      {/* Tech Stack */}
      {techStacks && techStacks.length > 0 && (
        <div className={styles.techStack}>
          {techStacks.map((tech, index) => (
            <span
              key={index}
              className={`${styles.techTag} ${isDark ? styles.techTagDark : ''}`}
              style={{ backgroundColor: tech.color }}
            >
              {showTechStackIcons && tech.icon && (
                <span className={styles.techIcon}>{tech.icon}</span>
              )}
              {tech.name}
            </span>
          ))}
        </div>
      )}

      {/* Links */}
      <div className={styles.links}>
        {/* Main links */}
        {links && links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target={link.target || '_blank'}
            rel="noopener noreferrer"
            className={`${styles.link} ${styles[`link${(link.type || 'custom').charAt(0).toUpperCase() + (link.type || 'custom').slice(1)}`]} ${isDark && link.type === 'repo' ? styles.linkRepoDark : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              link.onClick?.();
            }}
            style={link.style}
          >
            <span>{link.icon || getLinkIcon(link.type || 'custom')}</span>
            {link.label || (link.type || 'custom').charAt(0).toUpperCase() + (link.type || 'custom').slice(1)}
          </a>
        ))}

        {/* Repository link (if separate) */}
        {repo && (
          <a
            href={repo.url}
            target={repo.target || '_blank'}
            rel="noopener noreferrer"
            className={`${styles.link} ${styles.linkRepo} ${isDark ? styles.linkRepoDark : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              repo.onClick?.();
            }}
            style={repo.style}
          >
            <span>{repo.icon || getLinkIcon('repo')}</span>
            {repo.label || 'Repository'}
          </a>
        )}
      </div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className={styles.progressContainer}>
          <div className={styles.progressLabel}>
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className={styles.tagsContainer}>
          {tags.map((tag, index) => (
            tag.onClick ? (
              <span
                key={index}
                className={styles.tag}
                onClick={tag.onClick}
                style={{ cursor: 'pointer' }}
              >
                {tag.name}
              </span>
            ) : tag.navigateTo ? (
              <a
                key={index}
                className={styles.tag}
                href={tag.navigateTo}
                target="_blank"
                rel="noopener noreferrer"
              >
                {tag.name}
              </a>
            ) : (
              <span key={index} className={styles.tag}>
                {tag.name}
              </span>
            )
          ))}
        </div>
      )}

      {/* Metadata Section */}
      {(priority || budget || startDate || dueDate || category || createdBy || updatedBy) && (
        <div className={styles.metadataSection}>
          {priority && (
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Priority:</span>
              <span
                className={styles.metadataValue}
                style={{ color: getPriorityColor(priority) }}
              >
                {priority}
              </span>
            </div>
          )}

          {category && (
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Category:</span>
              <span className={styles.metadataValue}>
                {getCategoryIcon(category)} {category}
              </span>
            </div>
          )}

          {getBudgetDisplay() && (
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Budget:</span>
              <span className={styles.metadataValue}>{getBudgetDisplay()}</span>
            </div>
          )}

          {getStartDate() && (
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Start:</span>
              <span className={styles.metadataValue}>{getStartDate()}</span>
            </div>
          )}

          {getDueDate() && (
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Due:</span>
              <span className={styles.metadataValue}>{getDueDate()}</span>
            </div>
          )}

          {getEndDate() && (
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>End:</span>
              <span className={styles.metadataValue}>{getEndDate()}</span>
            </div>
          )}

          {createdBy && (
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Created by:</span>
              <span className={styles.metadataValue}>{createdBy}</span>
            </div>
          )}

          {updatedBy && (
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Updated by:</span>
              <span className={styles.metadataValue}>{updatedBy}</span>
            </div>
          )}
        </div>
      )}

      {/* Last Updated */}
      {getLastUpdated() && (
        <div className={`${styles.lastUpdated} ${isDark ? styles.lastUpdatedDark : ''}`}>
          Last updated: {getLastUpdated()}
        </div>
      )}

      {/* Related Projects */}
      {relatedProjects && relatedProjects.length > 0 && (
        <div className={styles.relatedProjects}>
          <h4 className={styles.relatedProjectsTitle}>Related Projects</h4>
          <div className={styles.relatedProjectsList}>
            {relatedProjects.map((project, index) => (
              <div
                key={index}
                className={styles.relatedProject}
                onClick={() => {
                  if (project.description || project.image || project.repo || project.link) {
                    // Create and show dialog
                    const dialog = document.createElement('div');
                    dialog.className = styles.relatedProjectDialog;

                    // Build links array from available link properties
                    const allLinks: any[] = [];
                    if (project.link) allLinks.push(project.link);
                    if (project.repo) allLinks.push(project.repo);


                    dialog.innerHTML = `
                      <div class="${styles.dialogOverlay}">
                        <div class="${styles.dialogContent}">
                          <div class="${styles.dialogHeader}">
                            <h3 class="${styles.dialogTitle}">${project.title}</h3>
                            <button class="${styles.dialogClose}" onclick="this.closest('.${styles.relatedProjectDialog}').remove()">×</button>
                          </div>
                          <div class="${styles.dialogBody}">
                          <div class="${styles.dialogImage}">
                            <img src="${typeof project.image === 'string' ? project.image : project.image?.src}" alt="${project.title}" />
                          </div>
                            ${project.description ? `<p class="${styles.dialogDescription}">${project.description}</p>` : ''}
                            ${allLinks.length > 0 ? `
                              <div class="${styles.dialogLinks}">
                                <h4>Links:</h4>
                                <div class="${styles.dialogLinksList}">
                                  ${allLinks.map((link: any) => `
                                    <a href="${link.url}" target="_blank" class="${styles.dialogLink} ${styles[`link${(link.type || 'custom').charAt(0).toUpperCase() + (link.type || 'custom').slice(1)}`]}">
                                      ${link.icon || ''} ${link.label || link.type || 'Link'}
                                    </a>
                                  `).join('')}
                                </div>
                              </div>
                            ` : ''}
                          </div>
                        </div>
                      </div>
                    `;
                    document.body.appendChild(dialog);

                    // Close dialog when clicking overlay
                    dialog.addEventListener('click', (e) => {
                      if (e.target === dialog.querySelector(`.${styles.dialogOverlay}`)) {
                        dialog.remove();
                      }
                    });
                  }
                }}
                style={{
                  cursor: (project.description || project.image || project.repo || project.link) ? 'pointer' : 'default'
                }}
              >
                <span className={styles.relatedProjectTitle}> -► {project.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};