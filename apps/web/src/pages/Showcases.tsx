import { useTranslation } from "@asafarim/shared-i18n";
import './Showcases.css';

interface Project {
  title: string;
  description: string;
  url: string;
}

export default function Showcases() {
  const { t } = useTranslation("web");

  const projects: Project[] = [
    {
      title: t("showcases.projects.taskManagement.title"),
      description: t("showcases.projects.taskManagement.description"),
      url: "http://taskmanagement.asafarim.local:5176/"
    },
    {
      title: t("showcases.projects.identityPortal.title"),
      description: t("showcases.projects.identityPortal.description"),
      url: "http://identity.asafarim.local:5177/"
    },
    {
      title: t("showcases.projects.coreApp.title"),
      description: t("showcases.projects.coreApp.description"),
      url: "http://core.asafarim.local:5174/"
    },
    {
      title: t("showcases.projects.aiPlatform.title"),
      description: t("showcases.projects.aiPlatform.description"),
      url: "http://ai.asafarim.local:5173/"
    },
    {
      title: t("showcases.projects.jobsPortal.title"),
      description: t("showcases.projects.jobsPortal.description"),
      url: "http://core.asafarim.local:5174/jobs"
    },
    {
      title: t("showcases.projects.blog.title"),
      description: t("showcases.projects.blog.description"),
      url: "http://blog.asafarim.local:3000/"
    }
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="showcases-header">
          <h1 className="showcases-title">{t("showcases.title")}</h1>
          <p className="showcases-intro">
            {t("showcases.intro")}
          </p>
        </div>

        <div className="showcases-grid">
          {projects.map((project, index) => (
            <a
              key={index}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="showcase-card"
            >
              <div className="showcase-card-content">
                <h3 className="showcase-card-title">{project.title}</h3>
                <p className="showcase-card-description">{project.description}</p>
              </div>
              <button className="visit-button" aria-label={`Visit ${project.title}`}>
                {t("showcases.visitButton")}
                <svg
                  className="visit-button-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </button>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
