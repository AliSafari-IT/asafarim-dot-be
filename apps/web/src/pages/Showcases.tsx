import { isProduction } from "@asafarim/shared-ui-react";
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
      url: isProduction
        ? "https://taskmanagement.asafarim.be/"
        : "http://taskmanagement.asafarim.local:5176/"
    },
    {
      title: t("showcases.projects.smartops.title"),
      description: t("showcases.projects.smartops.description"),
      url: isProduction
        ? "https://smartops.asafarim.be/"
        : "http://smartops.asafarim.local:5175/"
    },
    {
      title: t("showcases.projects.identityPortal.title"),
      description: t("showcases.projects.identityPortal.description"),
      url: isProduction
        ? "https://identity.asafarim.be/"
        : "http://identity.asafarim.local:5177/"
    },
    {
      title: t("showcases.projects.coreApp.title"),
      description: t("showcases.projects.coreApp.description"),
      url: isProduction
        ? "https://core.asafarim.be/"
        : "http://core.asafarim.local:5174/"
    },
    {
      title: t("showcases.projects.aiPlatform.title"),
      description: t("showcases.projects.aiPlatform.description"),
      url: isProduction
        ? "https://ai.asafarim.be/"
        : "http://ai.asafarim.local:5173/"
    },
    {
      title: t("showcases.projects.jobsPortal.title"),
      description: t("showcases.projects.jobsPortal.description"),
      url: isProduction
        ? "https://core.asafarim.be/jobs"
        : "http://core.asafarim.local:5174/jobs"
    },
    {
      title: t("showcases.projects.blog.title"),
      description: t("showcases.projects.blog.description"),
      url: isProduction
        ? "https://blog.asafarim.be/"
        : "http://blog.asafarim.local:3000/"
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
