import { useEffect, useState } from "react";
import { Hero, useAuth } from "@asafarim/shared-ui-react";
import {
  fetchCurrentUsersWorkExperiences,
  type WorkExperienceDto,
} from "../../../services/workExperienceService";

const Resume = () => {
  // Resume sections
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceDto[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is admin based on roles in the user object
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Only redirect if not authenticated after loading is complete
  useEffect(() => {
    // Only check authentication after the loading state is complete
    if (!authLoading && !isAuthenticated) {
      console.log(
        "Authentication check complete, not authenticated. Redirecting to login."
      );
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(
        window.location.href
      )}`;
    }
  }, [authLoading, isAuthenticated]);

  const skills = [
    {
      category: "Frontend",
      items: ["React", "Angular", "TypeScript", "HTML/CSS", "Tailwind CSS"],
    },
    {
      category: "Backend",
      items: [".NET Core", "C#", "Node.js", "Express", "ASP.NET"],
    },
    {
      category: "Database",
      items: ["SQL Server", "MongoDB", "PostgreSQL", "Redis"],
    },
    {
      category: "DevOps",
      items: ["Docker", "Kubernetes", "CI/CD", "Azure", "AWS"],
    },
  ];

  // Load work experiences based on user role
  useEffect(() => {
    const loadUserWorkExperiences = async () => {
      try {
        setLoading(true);
        console.log(
          "Fetching work experiences for the current user: isAuthenticated= " +
            isAuthenticated
        );
        // Fetch only the current user's work experiences
        const data = await fetchCurrentUsersWorkExperiences();
        console.log("Work experiences fetched:", data.length);
        setWorkExperiences(data);
      } catch (err) {
        console.error("Failed to load work experiences:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadUserWorkExperiences();
    }
  }, [isAuthenticated]);

  const education = [
    {
      institution: "University of Technology",
      degree: "Master of Computer Science",
      period: "2013 - 2015",
      description:
        "Specialized in Software Engineering with focus on web technologies and distributed systems.",
    },
    {
      institution: "State University",
      degree: "Bachelor of Science in Computer Science",
      period: "2009 - 2013",
      description:
        "Graduated with honors. Coursework included algorithms, data structures, and software development.",
    },
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
          "Strong background in building scalable web applications",
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
              <div
                key={index}
                className="bg-white dark:bg-gray-800 skill-card shadow-md"
              >
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
            {loading && <p>Loading work experiences...</p>}
            {workExperiences.map((job, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 experience-item shadow-md"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <div>
                    <h3 className="position">{job.jobTitle}</h3>
                    <p className="text-lg text-blue-600 dark:text-blue-400">
                      {job.companyName}
                    </p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 md:mt-0">
                    {job.startDate} - {job.endDate}
                  </p>
                </div>
                <p className="mb-4">{job.description}</p>
                <h4 className="font-bold mb-2">Key Achievements:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {job?.achievements?.map((achievement, achievementIndex) => (
                    <li key={achievementIndex}>{achievement.text}</li>
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
              <div
                key={index}
                className="bg-white dark:bg-gray-800 experience-item shadow-md"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <div>
                    <h3 className="degree">{edu.degree}</h3>
                    <p className="text-lg text-blue-600 dark:text-blue-400">
                      {edu.institution}
                    </p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 md:mt-0">
                    {edu.period}
                  </p>
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
