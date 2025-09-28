import React from 'react';
import { Hero } from '@asafarim/shared-ui-react';

const Resume: React.FC = () => {
  // Resume sections
  const skills = [
    { category: 'Frontend', items: ['React', 'Angular', 'TypeScript', 'HTML/CSS', 'Tailwind CSS'] },
    { category: 'Backend', items: ['.NET Core', 'C#', 'Node.js', 'Express', 'ASP.NET'] },
    { category: 'Database', items: ['SQL Server', 'MongoDB', 'PostgreSQL', 'Redis'] },
    { category: 'DevOps', items: ['Docker', 'Kubernetes', 'CI/CD', 'Azure', 'AWS'] },
  ];

  const experience = [
    {
      company: 'Tech Company',
      position: 'Senior Full Stack Developer',
      period: '2020 - Present',
      description: 'Leading development of enterprise web applications using React and .NET Core. Implemented CI/CD pipelines and containerized deployments.',
      achievements: [
        'Reduced application load time by 40% through code optimization',
        'Implemented microservices architecture for improved scalability',
        'Mentored junior developers and led technical interviews'
      ]
    },
    {
      company: 'Software Solutions Inc.',
      position: 'Full Stack Developer',
      period: '2017 - 2020',
      description: 'Developed and maintained web applications using Angular and ASP.NET. Collaborated with UX designers to implement responsive interfaces.',
      achievements: [
        'Built RESTful APIs consumed by mobile and web applications',
        'Implemented authentication and authorization using OAuth 2.0',
        'Optimized database queries resulting in 30% performance improvement'
      ]
    },
    {
      company: 'Web Development Studio',
      position: 'Frontend Developer',
      period: '2015 - 2017',
      description: 'Created responsive web interfaces using React and Redux. Worked closely with backend developers to integrate APIs.',
      achievements: [
        'Developed reusable component library used across multiple projects',
        'Implemented state management solutions for complex applications',
        'Contributed to open source projects and internal tools'
      ]
    }
  ];

  const education = [
    {
      institution: 'University of Technology',
      degree: 'Master of Computer Science',
      period: '2013 - 2015',
      description: 'Specialized in Software Engineering with focus on web technologies and distributed systems.'
    },
    {
      institution: 'State University',
      degree: 'Bachelor of Science in Computer Science',
      period: '2009 - 2013',
      description: 'Graduated with honors. Coursework included algorithms, data structures, and software development.'
    }
  ];

  return (
    <div className="resume-page">
      <Hero
        kicker="Resume"
        title="Professional Experience"
        subtitle="A summary of my skills, work experience, and education"
        bullets={[
          "Over 8 years of professional software development experience",
          "Expertise in full-stack development with React and .NET",
          "Strong background in building scalable web applications"
        ]}
        primaryCta={{
          label: "Download PDF",
          href: "#", // Replace with actual PDF link
        }}
        secondaryCta={{
          label: "Contact Me",
          to: "/contact",
        }}
      />

      <div className="container mx-auto py-12 px-4">
        {/* Skills Section */}
        <section>
          <h2>Skills</h2>
          <div className="skills-grid">
            {skills.map((skillGroup, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 skill-card shadow-md">
                <h3>{skillGroup.category}</h3>
                <ul>
                  {skillGroup.items.map((skill, skillIndex) => (
                    <li key={skillIndex}>{skill}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <section>
          <h2>Work Experience</h2>
          <div className="space-y-8">
            {experience.map((job, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 experience-item shadow-md">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <div>
                    <h3 className="position">{job.position}</h3>
                    <p className="text-lg text-blue-600 dark:text-blue-400">{job.company}</p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 md:mt-0">{job.period}</p>
                </div>
                <p className="mb-4">{job.description}</p>
                <h4 className="font-bold mb-2">Key Achievements:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {job.achievements.map((achievement, achievementIndex) => (
                    <li key={achievementIndex}>{achievement}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Education Section */}
        <section>
          <h2>Education</h2>
          <div className="space-y-8">
            {education.map((edu, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 experience-item shadow-md">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <div>
                    <h3 className="degree">{edu.degree}</h3>
                    <p className="text-lg text-blue-600 dark:text-blue-400">{edu.institution}</p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 md:mt-0">{edu.period}</p>
                </div>
                <p>{edu.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Resume;
