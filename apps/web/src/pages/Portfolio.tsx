import { Hero, PaginatedProjectGrid, ContentCard } from '@asafarim/shared-ui-react';
import type { Project, ContentCardProps } from '@asafarim/shared-ui-react';
import './portfolio.css';

const Portfolio = () => {
  // Featured projects data
  const featuredProjects: Project[] = [
    {
      id: 'asafarim-dot-be',
      title: 'ASafariM Monorepo',
      description:
        'Monorepo powering my public website, dashboards, and internal tooling with shared design tokens and UI kits.',
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
      title: 'ASafariM Clean Architecture',
      description:
        'Backend reference implementation showcasing Clean Architecture, CQRS, MediatR, and modular domain boundaries.',
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
      title: 'Test Automation Platform',
      description:
        'Full E2E automation suite with TestCafe generators, GitHub Actions integration, and real-time reporting.',
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
      title: 'Smart Operations Dashboard',
      description:
        'Operational analytics dashboard with real-time device telemetry, granular RBAC, and SignalR live charts.',
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
      title: 'TaskManagement Suite',
      description:
        'Project and task management platform featuring SSO, permissions, filters, and a responsive React SPA.',
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
      id: 'tko',
      title: 'DocSys (TKO)',
      description:
        'Documentation knowledge organizer built with .NET + React, featuring Redux state and Syncfusion UI.',
      techStacks: [{ name: '.NET 6' }, { name: 'React' }, { name: 'Redux' }],
      links: [
        { label: 'GitHub', url: 'https://github.com/AliSafari-IT/tko' }
      ],
      category: 'backend',
      status: 'active' as const,
      isFeatured: true,
      isPublic: true,
    },
    {
      id: 'aquaflow',
      title: 'AquaFlow',
      description:
        'Water utility workflow portal with TypeScript micro frontends and API orchestration.',
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
      id: 'training-platform',
      title: 'Training Platform',
      description:
        'Java + JSF learning portal with hundreds of curated exercises and a public Vercel deployment.',
      techStacks: [{ name: 'Java' }, { name: 'JSF' }, { name: 'Vercel' }],
      links: [
        { label: 'GitHub', url: 'https://github.com/AliSafari-IT/Training' },
        { label: 'Live Demo', url: 'https://training-self.vercel.app' }
      ],
      category: 'web',
      status: 'active' as const,
      isFeatured: true,
      isPublic: true,
    },
    {
      id: 'toast-kit',
      title: 'Toast Micro SaaS',
      description:
        'Composable toast/notification service with themeable React widgets and a Next.js marketing site.',
      techStacks: [{ name: 'React' }, { name: 'Next.js' }, { name: 'Tailwind' }],
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
      title: 'TSRdotNet',
      description:
        'Energy time-series modeling toolkit leveraging R from .NET for predictive analytics.',
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
      title: 'Angular Enterprise Starter',
      description:
        'Enterprise-ready Angular template with Nx, role-based routing, and Syncfusion integrations.',
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
