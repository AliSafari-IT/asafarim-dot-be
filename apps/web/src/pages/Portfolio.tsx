import { Hero, PaginatedProjectGrid, ContentCard } from '@asafarim/shared-ui-react';
import type { Project, ContentCardProps } from '@asafarim/shared-ui-react';
import './portfolio.css';
import { useTranslation } from '@asafarim/shared-i18n';

const Portfolio = () => {
  const {t} = useTranslation( 'web' );
  // Featured projects data
  const featuredProjects: Project[] = [
    {
      id: 'asafarim-dot-be',
      title: t( 'portfolio.projects.asafarim-dot-be.title' ),
      description: t( 'portfolio.projects.asafarim-dot-be.description' ),
      techStacks: [{ name: 'React' }, { name: '.NET 8' }, { name: 'PNPM Workspaces' }],
      links: [
        { label: 'GitHub', url: 'https://github.com/AliSafari-IT/asafarim-dot-be' },
        { label: 'Live Demo', url: 'https://asafarim.be' }
      ],
      category: 'fullstack',
      status: 'active' as const,
      isFeatured: true,
      isPublic: true,
    },
    {
      id: 'asafarim-clean-architecture',
      title: t( 'portfolio.projects.asafarim-clean-architecture.title' ),
      description: t( 'portfolio.projects.asafarim-clean-architecture.description' ),
      techStacks: [{ name: '.NET 8' }, { name: 'PostgreSQL' }, { name: 'CQRS' }],
      links: [
        { label: 'GitHub', url: 'https://github.com/AliSafari-IT/asafarim'},
        { label: 'Live Demo', url: 'https://asafarim.com'}
      ],
      category: 'backend',
      status: 'active' as const,
      isFeatured: true,
      isPublic: true,
    },
    {
      id: 'test-automation-platform',
      title: t( 'portfolio.projects.test-automation-platform.title' ),
      description: t( 'portfolio.projects.test-automation-platform.description' ),
      techStacks: [{ name: 'React' }, { name: 'Node.js' }, { name: 'TestCafe' }],
      links: [
        { label: 'GitHub', url: 'https://github.com/AliSafari-IT/asafarim-dot-be/tree/main/apps/test-automation-ui' },
         { label: 'Live Demo', url: 'https://testora.asafarim.be/run'}
      ],
      category: 'testing',
      status: 'active' as const,
      isFeatured: true,
      isPublic: true,
    },
    {
      id: 'task-operations-suite',
      title: t( 'portfolio.projects.task-operations-suite.title' ),
      description: t( 'portfolio.projects.task-operations-suite.description' ),
      techStacks: [{ name: 'React' }, { name: 'SignalR' }, { name: 'PostgreSQL' }],
      links: [
        { label: 'GitHub', url: 'https://github.com/AliSafari-IT/asafarim-dot-be/tree/main/showcases/SmartOperationsDashboard' },
                 { label: 'Live Demo', url: 'https://smartops.asafarim.be/devices'}
      ],
      category: 'analytics',
      status: 'in-progress' as const,
      isFeatured: true,
      isPublic: true,
    },
    {
      id: 'taskmanagement',
      title: t( 'portfolio.projects.taskmanagement.title' ),
      description: t( 'portfolio.projects.taskmanagement.description' ),
      techStacks: [{ name: 'React' }, { name: '.NET 8' }, { name: 'PostgreSQL' }],
      links: [
        { label: 'GitHub', url: 'https://github.com/AliSafari-IT/asafarim-dot-be/tree/main/showcases/TaskManagement' },
         { label: 'Live Demo', url: 'https://taskmanagement.asafarim.be/'}
      ],
      category: 'fullstack',
      status: 'active' as const,
      isFeatured: true,
      isPublic: true,
    },
    {
      id: 'paginated-project-grid',
      title: t( 'portfolio.projects.paginated-project-grid.title' ),
      description: t( 'portfolio.projects.paginated-project-grid.description' ),
      techStacks: [{ name: 'React' }, { name: 'TypeScript' }, { name: 'CSS Modules' }],
      links: [
        { label: 'GitHub', url: 'https://alisafari-it.github.io/paginated-project-grid/' }
      ],
      category: 'frontend',
      status: 'active' as const,
      isFeatured: true,
      isPublic: true,
    },
    {
      id: 'aquaflow',
      title: t( 'portfolio.projects.aquaflow.title' ),
      description: t( 'portfolio.projects.aquaflow.description' ),
      techStacks: [{ name: 'TypeScript' }, { name: 'Micro FE' }, { name: 'NX' }],
      links: [
        { label: 'GitHub', url: 'https://github.com/AliSafari-IT/AquaFlow' },
        {label: 'Live Demo', url: 'https://aquaflow.asafarim.com/'}
      ],
      category: 'fullstack',
      status: 'draft' as const,
      isFeatured: true,
      isPublic: true,
    },
    {
      id: 'react-privacy-consent',
      title: t( 'portfolio.projects.react-privacy-consent.title' ),
      description: t( 'portfolio.projects.react-privacy-consent.description' ),
      techStacks: [{ name: 'React' }, { name: 'TypeScript' }, { name: 'CSS' }],
      links: [
        { label: 'GitHub', url: 'https://github.com/AliSafari-IT/react-privacy-consent' },
        { label: 'Live Demo', url: 'https://alisafari-it.github.io/react-privacy-consent/' }
      ],
      category: 'web',
      status: 'active' as const,
      isFeatured: true,
      isPublic: true,
    },
    {
      id: 'toast-kit',
      title: t( 'portfolio.projects.toast-kit.title' ),
      description: t( 'portfolio.projects.toast-kit.description' ),
      techStacks: [{ name: 'React' }, { name: 'TypeScript' }, { name: 'CSS' }],
      links: [
        { label: 'GitHub', url: 'https://github.com/AliSafari-IT/toast' }
      ],
      category: 'frontend',
      status: 'in-progress' as const,
      isFeatured: true,
      isPublic: true,
    },
    {
      id: 'tsrdotnet',
      title: t( 'portfolio.projects.tsrdotnet.title' ),
      description: t( 'portfolio.projects.tsrdotnet.description' ),
      techStacks: [{ name: 'C#' }, { name: 'rDotNet' }, { name: 'Statistics' }],
      links: [
        { label: 'GitHub', url: 'https://github.com/AliSafari-IT/TSRdotNet' }
      ],
      category: 'analytics',
      status: 'completed' as const,
      isFeatured: true,
      isPublic: true,
    },
    {
      id: 'angular-project',
      title: t( 'portfolio.projects.angular-project.title' ),
      description: t( 'portfolio.projects.angular-project.description' ),
      techStacks: [{ name: 'Angular' }, { name: 'Nx' }, { name: 'Syncfusion' }],
      links: [
        { label: 'GitHub', url: 'https://github.com/AliSafari-IT/AngularProject' }
      ],
      category: 'frontend',
      status: 'completed' as const,
      isFeatured: true,
      isPublic: true,
    },
  ];

  const npmPackages: ContentCardProps[] = [
    {
      id: 'toast',
      title: 'asafarim/toast',
      description: 'A lightweight, theme-aware toast notification system for React applications with a simple programmatic API.',
      meta: 'Design System • React >=16.8.0 • Zero external dependencies',
      tags: ['React', 'Toast', 'Toast notifications', 'Auto-dismiss', 'closable'],
      icon: '🧩',
      link: 'https://www.npmjs.com/package/@asafarim/toast',
    },
    {
      id: 'shared-tokens',
      title: '@asafarim/shared-tokens',
      description: 'Central theme tokens (colors, spacing, typography) consumed by every FE app in the monorepo.',
      meta: 'CSS Custom Properties',
      tags: ['Theming', 'Dark mode', 'CSS'],
      icon: '🎨',
      link: 'https://www.npmjs.com/package/@asafarim/shared-tokens',
    },
    {
      id: 'shared-i18n',
      title: '@asafarim/shared-i18n',
      description: 'Lightweight, simple translation module for any React + TypeScript app, built on top of i18next and react-i18next. It ships with sensible defaults (English and Dutch) but can support any language by adding JSON files to your locales folder.',
      meta: 'Localization toolkit',
      tags: ['i18n', 'TypeScript'],
      icon: '🌐',
      link: 'https://www.npmjs.com/package/@asafarim/shared-i18n',
    },
    {
      id: 'react-themes',
      title: '@asafarim/react-themes',
      description: 'Preset theme bundles (light/dark/high-contrast) with runtime switching utilities.',
      meta: 'UI Utilities',
      tags: ['React', 'Themes'],
      icon: '🌓',
      link: 'https://alisafari-it.github.io/react-themes/',
    },
    {
      id: 'dd-menu',
      title: '@asafarim/dd-menu',
      description: 'Accessible dropdown menu primitives with keyboard support and portal-based rendering.',
      meta: 'Navigation widgets',
      tags: ['A11y', 'Menu', 'React'],
      icon: '📦',
      link: 'https://alisafari-it.github.io/dd-menu/',
    },
  ];

  // Portfolio sections
  const portfolioSections = [
    {
      id: 'resume',
      title: 'Resume',
      description: 'View my professional experience, skills, and education.',
      icon: '📄',
      link: '/portfolio/my-react-dotnet-cv-10-10-2025/public',
    },
    {
      id: 'publications',
      title: 'Publications',
      description: 'Explore my published articles, papers, and research contributions.',
      icon: '📚',
      link: '/portfolio/publications',
    },
    {
      id: 'research',
      title: 'Research',
      description: 'Learn about my research interests and ongoing projects.',
      icon: '🔬',
      link: '/portfolio/research',
    },
    {
      id: 'projects',
      title: 'Projects',
      description: 'Browse through my personal and professional projects.',
      icon: '💻',
      link: '/portfolio/projects',
    },
  ];

  return (
    <div className="portfolio-page">
      <Hero
        kicker="Portfolio"
        title="My Work & Contributions"
        subtitle="Explore my professional journey, publications, research, and projects"
        bullets={[
          "Full-stack developer specializing in .NET and React",
          "Published researcher with focus on web technologies",
          "Open source contributor and project maintainer"
        ]}
        primaryCta={{
          label: "View Resume",
          to: "/portfolio/my-react-dotnet-cv-10-10-2025/public",
        }}
        secondaryCta={{
          label: "Contact Me",
          to: "/contact",
        }}
      />

      <section className="portfolio-section">
        <div className="portfolio-container">
          <h2 className="section-title">Portfolio Sections</h2>

          <div className="portfolio-grid">
          {portfolioSections.map((section) => (
            <ContentCard
              key={section.id}
              {...section}
            />
          ))}
          </div>
        </div>
      </section>

      <section className="portfolio-section">
        <div className="portfolio-container">
          <h2 className="section-title">Featured Work</h2>
          <PaginatedProjectGrid
            projects={featuredProjects}
            cardsPerPage={3}
            currentTheme="dark"
            enableSearch={false}
            showLoadMore={true}
            responsive={{
              mobile: 1,
              tablet: 2,
              desktop: 3,
              largeDesktop: 3,
              extraLargeDesktop: 3
            }}
          />
        </div>
      </section>

      <section className="portfolio-section">
        <div className="portfolio-container">
          <h2 className="section-title">NPM Packages</h2>

          <div className="portfolio-grid">
            {npmPackages.map((pkg) => (
              <ContentCard
                key={pkg.id}
                {...pkg}
                subtitle={pkg.meta}
                clickable
                actionButton={
                  <a href={pkg.link} target="_blank" rel="noopener noreferrer" className="featured-link">
                    View on npm →
                  </a>
                }
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
