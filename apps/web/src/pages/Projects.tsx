import React from 'react';
import { Hero } from '@asafarim/shared-ui-react';

const Projects: React.FC = () => {
  // Project data
  const projects = [
    {
      title: "ASafariM Monorepo",
      description: "A comprehensive monorepo architecture featuring multiple frontend applications and backend APIs built with React and .NET Core.",
      image: "/images/projects/monorepo.jpg",
      technologies: ["React", ".NET Core", "TypeScript", "Monorepo", "PNPM"],
      link: "https://github.com/AliSafari-IT/asafarim-dot-be",
      featured: true
    },
    {
      title: "NPM Package Collection",
      description: "A collection of reusable React components and utilities published to NPM, including dropdown menus, theme switchers, and more.",
      image: "/images/projects/npm-packages.jpg",
      technologies: ["React", "TypeScript", "NPM", "CSS-in-JS"],
      link: "https://www.npmjs.com/~asafarim",
      featured: true
    },
    {
      title: "Pharmacy Management System",
      description: "A comprehensive pharmacy management system with inventory tracking, prescription management, and reporting features.",
      image: "/images/projects/pharmacy.jpg",
      technologies: ["React", ".NET Core", "SQL Server", "Azure"],
      link: "https://github.com/AliSafari-IT/igs-pharma",
      featured: false
    },
    {
      title: "ASafariM Bibliography",
      description: "A digital bibliography system for managing research papers, citations, and academic references.",
      image: "/images/projects/bibliography.jpg",
      technologies: ["React", "Node.js", "MongoDB", "Express"],
      link: "https://github.com/AliSafari-IT/asafarim-bibliography",
      featured: false
    },
    {
      title: "React Themes",
      description: "A flexible theming system for React applications with support for light and dark modes, custom color schemes, and more.",
      image: "/images/projects/react-themes.jpg",
      technologies: ["React", "TypeScript", "CSS Variables"],
      link: "https://www.npmjs.com/package/@asafarim/react-themes",
      featured: false
    },
    {
      title: "Markdown Explorer Viewer",
      description: "A React component for exploring and viewing markdown files with syntax highlighting and navigation features.",
      image: "/images/projects/markdown-explorer.jpg",
      technologies: ["React", "TypeScript", "Markdown"],
      link: "https://www.npmjs.com/package/@asafarim/markdown-explorer-viewer",
      featured: false
    }
  ];

  // Filter featured projects
  const featuredProjects = projects.filter(project => project.featured);
  const otherProjects = projects.filter(project => !project.featured);

  return (
    <div className="projects-page">
      <Hero
        kicker="Projects"
        title="My Development Projects"
        subtitle="Explore my personal and professional software development projects"
        bullets={[
          "Full-stack applications built with React and .NET Core",
          "Open source libraries and components published to NPM",
          "Research and experimental projects"
        ]}
        primaryCta={{
          label: "View on GitHub",
          href: "https://github.com/AliSafari-IT"
        }}
        secondaryCta={{
          label: "Contact Me",
          to: "/contact",
        }}
      />

      <div className="container mx-auto py-12 px-4">
        {/* Featured Projects */}
        <section>
          <h2>Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredProjects.map((project, index) => (
              <div key={index} className="featured-project bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, techIndex) => (
                      <span 
                        key={techIndex}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 dark:text-blue-400 font-medium"
                  >
                    View Project →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Other Projects */}
        <section>
          <h2>More Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherProjects.map((project, index) => (
              <div key={index} className="project-card bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
                <div className="h-40 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2">{project.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.technologies.slice(0, 3).map((tech, techIndex) => (
                      <span 
                        key={techIndex}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                        +{project.technologies.length - 3} more
                      </span>
                    )}
                  </div>
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 dark:text-blue-400 text-sm font-medium"
                  >
                    View Project →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Projects;
