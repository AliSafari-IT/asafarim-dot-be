import React from 'react';
import ContentCard from './ContentCard';

/**
 * Example component showing different ContentCard variants
 */
export const ContentCardExample: React.FC = () => {
  // Example publication card (like the one in the second image)
  const publicationExample = (
    <ContentCard
      variant="publication"
      title="WetSpa model application in the Distributed Model Intercomparison Project (DMIP2)"
      subtitle="Michael B. Smith, Alireza Safari, Florimond De Smedt, Fekadu Moreda, Mohsen Tavakoli"
      meta="Journal of Hydrology, 2012, Vol. 418-419, pp. 78-89"
      description="This paper describes the application of a spatially distributed hydrologic model (WetSpa) Water and Energy Transfer between Soil, Plants and Atmosphere, for the second phase of the Distributed Model Intercomparison Project (DMIP2) study."
      year="2012"
      metrics={[{ label: 'citations', value: 110 }]}
      link="https://example.com/publication"
      tags={['Hydrology', 'Modeling', 'DMIP2']}
      size="lg"
      elevated
    />
  );

  // Example project card (like the one in the first image)
  const projectExample = (
    <ContentCard
      variant="project"
      title="Professional Experience"
      subtitle="A summary of my skills, work experience, and education"
      description="Over 7 years of professional software development experience, expertise in full-stack development with React and .NET, strong background in building scalable web applications."
      tags={['React', '.NET Core', 'Full-Stack']}
      link="/resume"
      useGradient
      featured
      elevated
    />
  );

  // Example article card
  const articleExample = (
    <ContentCard
      variant="article"
      title="Modern Web Development Techniques"
      subtitle="Best practices for building scalable web applications"
      meta="Published on September 26, 2025"
      description="Learn about the latest techniques and best practices for developing modern web applications using React, TypeScript, and .NET Core."
      tags={['Web Development', 'React', 'TypeScript']}
      link="https://example.com/article"
      imageUrl="https://via.placeholder.com/400x200"
      size="md"
      elevated
    />
  );

  // Example report card
  const reportExample = (
    <ContentCard
      variant="report"
      title="Annual Performance Report"
      subtitle="2025 Technical Achievements"
      meta="Internal Report • Confidential"
      description="A comprehensive analysis of technical achievements and performance metrics for the 2025 fiscal year."
      year="2025"
      tags={['Annual Report', 'Performance', 'Metrics']}
      link="/reports/2025"
      size="md"
      bordered
    />
  );

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1>ContentCard Examples</h1>
      
      <div>
        <h2>Publication Card</h2>
        {publicationExample}
      </div>
      
      <div>
        <h2>Project Card</h2>
        {projectExample}
      </div>
      
      <div>
        <h2>Article Card</h2>
        {articleExample}
      </div>
      
      <div>
        <h2>Report Card</h2>
        {reportExample}
      </div>
      
      <div>
        <h2>Clickable Card</h2>
        <ContentCard
          title="Clickable Card Example"
          description="This entire card is clickable and will navigate to the specified link."
          link="https://example.com"
          clickable
          elevated
        />
      </div>
    </div>
  );
};

// Only using named export for consistency
