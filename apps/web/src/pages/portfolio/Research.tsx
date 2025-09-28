import React from 'react';
import { Hero } from '@asafarim/shared-ui-react';

const Research: React.FC = () => {
  // Research areas
  const researchAreas = [
    {
      title: "Web Technologies",
      description: "Research focused on modern web development frameworks, performance optimization, and best practices for building scalable web applications.",
      topics: [
        "React performance optimization techniques",
        "Server-side rendering vs. client-side rendering",
        "Progressive Web Applications (PWAs)",
        "Web Components and micro-frontends"
      ]
    },
    {
      title: "Software Architecture",
      description: "Exploration of architectural patterns for building maintainable, scalable, and resilient software systems.",
      topics: [
        "Microservices architecture",
        "Domain-Driven Design (DDD)",
        "Event-driven architecture",
        "Serverless computing"
      ]
    },
    {
      title: "Developer Experience",
      description: "Research on tools, practices, and methodologies that improve developer productivity and satisfaction.",
      topics: [
        "Monorepo management",
        "Developer tooling and automation",
        "Code quality and maintainability metrics",
        "Team collaboration and knowledge sharing"
      ]
    }
  ];

  // Current projects
  const currentProjects = [
    {
      title: "Performance Optimization in React Applications",
      status: "In Progress",
      description: "Investigating advanced techniques for optimizing React application performance, including code splitting, lazy loading, and memoization strategies.",
      collaborators: ["University of Technology", "React Performance Group"]
    },
    {
      title: "Microservices Communication Patterns",
      status: "In Progress",
      description: "Researching effective communication patterns between microservices, with a focus on reliability, scalability, and maintainability.",
      collaborators: ["Software Architecture Institute", "Enterprise Solutions Inc."]
    },
    {
      title: "Developer Experience in Monorepo Environments",
      status: "Planning Phase",
      description: "Studying the impact of monorepo architecture on developer experience, productivity, and code quality in large-scale projects.",
      collaborators: ["Developer Productivity Research Group"]
    }
  ];

  return (
    <div className="research-page">
      <Hero
        kicker="Research"
        title="Research Interests & Projects"
        subtitle="Exploring the frontiers of web technologies and software architecture"
        bullets={[
          "Focus on web technologies and software architecture",
          "Collaboration with academic and industry partners",
          "Practical applications of research findings"
        ]}
        primaryCta={{
          label: "View Publications",
          to: "/portfolio/publications",
        }}
        secondaryCta={{
          label: "Contact Me",
          to: "/contact",
        }}
      />

      <div className="container mx-auto py-12 px-4">
        {/* Research Areas */}
        <section>
          <h2>Research Areas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {researchAreas.map((area, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 skill-card shadow-md">
                <h3>{area.title}</h3>
                <p className="mb-4">{area.description}</p>
                <h4 className="font-bold mb-2">Key Topics:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {area.topics.map((topic, topicIndex) => (
                    <li key={topicIndex}>{topic}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Current Projects */}
        <section>
          <h2>Current Research Projects</h2>
          <div className="space-y-8">
            {currentProjects.map((project, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 research-item shadow-md">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <h3 className="text-xl font-bold">{project.title}</h3>
                  <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm mt-2 md:mt-0">
                    {project.status}
                  </span>
                </div>
                <p className="mb-4">{project.description}</p>
                <div>
                  <h4 className="font-bold mb-2">Collaborators:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.collaborators.map((collaborator, collabIndex) => (
                      <span 
                        key={collabIndex}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                      >
                        {collaborator}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Research Methodology */}
        <section>
          <h2>Research Methodology</h2>
          <div className="bg-white dark:bg-gray-800 research-item shadow-md">
            <p className="mb-4">
              My research follows a practical, application-oriented methodology that combines academic rigor with 
              real-world implementation. I believe in the importance of bridging the gap between theoretical 
              research and practical applications in the software development industry.
            </p>
            
            <h3 className="text-xl font-bold mb-4">My approach includes:</h3>
            
            <ol className="list-decimal pl-5 space-y-4">
              <li>
                <strong>Literature Review:</strong> Comprehensive analysis of existing research and industry best practices.
              </li>
              <li>
                <strong>Experimental Implementation:</strong> Development of proof-of-concept implementations to validate research hypotheses.
              </li>
              <li>
                <strong>Performance Benchmarking:</strong> Rigorous testing and measurement of performance metrics.
              </li>
              <li>
                <strong>Case Studies:</strong> Application of research findings to real-world projects to evaluate practical benefits.
              </li>
              <li>
                <strong>Knowledge Sharing:</strong> Publication of findings in academic journals and presentation at industry conferences.
              </li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Research;
