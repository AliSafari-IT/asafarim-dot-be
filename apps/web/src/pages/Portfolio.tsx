import React from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '@asafarim/shared-ui-react';

const Portfolio: React.FC = () => {
  // Portfolio sections
  const portfolioSections = [
    {
      id: 'resume',
      title: 'Resume',
      description: 'View my professional experience, skills, and education.',
      icon: '📄',
      link: '/portfolio/resume',
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
      link: '/projects',
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
          to: "/portfolio/resume",
        }}
        secondaryCta={{
          label: "Contact Me",
          to: "/contact",
        }}
      />

      <section className="portfolio-sections container mx-auto py-12 px-4">
        <h2>Portfolio Sections</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portfolioSections.map((section) => (
            <Link 
              to={section.link} 
              key={section.id}
              className="portfolio-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
            >
              <span className="text-4xl mb-4">{section.icon}</span>
              <h3 className="text-xl font-bold mb-2">{section.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{section.description}</p>
              <span className="text-blue-600 dark:text-blue-400 font-medium">View {section.title} →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-work container mx-auto py-12 px-4">
        <h2>Featured Work</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="featured-project bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
            <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">ASafariM Monorepo</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                A comprehensive monorepo architecture featuring multiple frontend applications and backend APIs.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">.NET Core</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">Monorepo</span>
              </div>
              <a href="https://github.com/AliSafari-IT/asafarim-dot-be" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-medium">View Project →</a>
            </div>
          </div>
          
          <div className="featured-project bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
            <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">NPM Packages</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Collection of reusable React components and utilities published to NPM.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">TypeScript</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">NPM</span>
              </div>
              <a href="https://www.npmjs.com/~asafarim" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-medium">View Packages →</a>
            </div>
          </div>
        </div>
      </section>

      <section className="import-notice container mx-auto py-12 px-4 text-center">
        <h2>Imported from PBK.ASafariM.com</h2>
        <div className="bg-white dark:bg-gray-800 research-item shadow-md max-w-3xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-300">
            This portfolio page is based on content from my personal website at 
            <a href="https://pbk.asafarim.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 mx-1">pbk.asafarim.com</a>. 
            Visit the original site to see more details about my work.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
