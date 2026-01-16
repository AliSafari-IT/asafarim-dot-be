import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Github,
  Google,
  Linkedin,
  NotFound,
  ORCID,
  StackOverflow,
} from "@asafarim/shared-ui-react";
import {
  fetchPublicResumeBySlug,
  type PublicResumeDto,
  type PublicSkillDto,
} from "../../../services/resumeApi";
import { LayoutSelector } from "../../admin/resume/layouts/LayoutSelector";
import { type LayoutType } from "../../admin/resume/layouts/types";
import { PrintLayout } from "../../admin/resume/layouts/PrintLayout";
import { useTranslation } from "@asafarim/shared-i18n";
import "./public-resume.css";

const PublicResumeView = () => {
  const { publicSlug } = useParams<{ publicSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [resume, setResume] = useState<PublicResumeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLayout, setCurrentLayout] = useState<LayoutType>(
    (searchParams.get("layout") as LayoutType) || "online"
  );
  const { t } = useTranslation('web');

  const handleLayoutChange = (layout: LayoutType) => {
    setCurrentLayout(layout);
    setSearchParams({ layout });
  };

  useEffect(() => {
    const loadPublicResume = async () => {
      if (!publicSlug) {
        setError(t('resume.messages.invalidLink'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchPublicResumeBySlug(publicSlug);
        setResume(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load public resume:", err);
        setError(err instanceof Error ? err.message : t('resume.error'));
        setResume(null);
      } finally {
        setLoading(false);
      }
    };

    loadPublicResume();
  }, [publicSlug, t]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const handleExportPDF = async () => {
    if (!resume) return;

    // Dynamically import html2pdf
    const html2pdf = (await import("html2pdf.js")).default;

    // Get the print layout container
    const element = document.querySelector(
      ".print-layout-container"
    ) as HTMLElement;

    if (!element) {
      console.error("Print layout not found");
      return;
    }

    const opt = {
      margin: 15,
      filename: `${resume.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${
        new Date().toISOString().split("T")[0]
      }.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const,
      },
    };

    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <div className="public-resume-page">
        <div className="public-resume-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t('resume.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="public-resume-page">
        <div className="public-resume-container">
          <NotFound
            title="Resume Not Found"
            message={
              error || t('resume.messages.notAvailable')
            }
          />
        </div>
      </div>
    );
  }

  // Render print layout if selected
  if (currentLayout === "print") {
    return (
      <div className="resume-view-page" data-layout="print">
        <div className="resume-view-container">
          <LayoutSelector
            currentLayout={currentLayout}
            onLayoutChange={handleLayoutChange}
            onExportPDF={handleExportPDF}
          />
          <PrintLayout resume={resume} onExportPDF={handleExportPDF} />
        </div>
      </div>
    );
  }

  return (
    <div className="public-resume-page" data-layout="public">
      <div className="public-resume-container">
        {/* Layout Selector */}
        <div className="public-resume-actions no-print">
          <LayoutSelector
            currentLayout={currentLayout}
            onLayoutChange={handleLayoutChange}
          />
        </div>

        {/* Header */}
        <header className="public-resume-header">
          <h1 className="resume-title">{resume.title}</h1>
          {resume.publishedAt && (
            <p className="published-date">
              {t('resume.published')}: {formatDate(resume.publishedAt)}
            </p>
          )}
        </header>

        {/* Main Content */}
        <div className="public-resume-content">
          {/* Professional Summary */}
          {resume.summary && (
            <section className="resume-section">
              <h2 className="section-title">{t('resume.sections.summary.title')}</h2>
              <div className="section-content">
                <p className="summary-text">{resume.summary}</p>
              </div>
            </section>
          )}

          {/* Work Experience */}
          {resume.workExperiences && resume.workExperiences.length > 0 && (
            <section className="resume-section">
              <div className="section-header">
                <h2 className="section-title">{t('resume.sections.experience.title')}</h2>
                <span className="section-count">
                  {resume.workExperiences.length}
                </span>
              </div>
              <div className="section-content">
                <div className="timeline">
                  {resume.workExperiences.map((exp, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="item-header">
                          <h3 className="item-title">{exp.jobTitle}</h3>
                          <span className="item-date">
                            {formatDate(exp.startDate)} -{" "}
                            {exp.endDate ? formatDate(exp.endDate) : t('resume.sections.experience.present')}
                          </span>
                        </div>
                        <div className="item-subtitle">
                          <span className="company-name">
                            {exp.companyName}
                          </span>
                          {exp.location && (
                            <span className="location">• {exp.location}</span>
                          )}
                        </div>
                        {exp.description && (
                          <p className="item-description">{exp.description}</p>
                        )}

                        {exp.achievements && exp.achievements.length > 0 && (
                          <div className="achievements-section">
                            <ul className="achievements-list">
                              {exp.achievements.map((ach, idx) => (
                                <li key={idx}>{ach}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {exp.technologies && exp.technologies.length > 0 && (
                          <div className="tech-tags">
                            {exp.technologies.map((tech, idx) => (
                              <span key={idx} className="tech-tag">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Skills */}
          {resume.skills && resume.skills.length > 0 && (
            <section className="resume-section">
              <h2 className="section-title">{t('resume.sections.skills.title')}</h2>
              <div className="section-content">
                <div className="skills-grid">
                  {resume.skills.map((skill: PublicSkillDto, index: number) => (
                    <div key={index} className="skill-card">
                      <div className="skill-header">
                        <h3 className="skill-name">{skill.name}</h3>
                      </div>
                      <div className="skill-meta">
                        <span className="skill-category">
                          {skill.category}
                        </span>
                        <span className="skill-level">{skill.level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Education */}
          {resume.educationItems && resume.educationItems.length > 0 && (
            <section className="resume-section">
              <h2 className="section-title">{t('resume.sections.education.title')}</h2>
              <div className="section-content">
                <div className="education-grid">
                  {resume.educationItems.map((edu, index) => (
                    <div key={index} className="education-card">
                      <h3 className="education-degree">{t('resume.sections.education.degree', { degree: edu.degree })}</h3>
                      <div className="education-institution">
                        {edu.institution}
                      </div>
                      {edu.fieldOfStudy && (
                        <div className="education-field">
                          {t('resume.sections.education.field', { field: edu.fieldOfStudy })}
                        </div>
                      )}
                      <div className="education-dates">
                        {formatDate(edu.startDate)} -{" "}
                        {edu.endDate ? formatDate(edu.endDate) : t('resume.sections.education.present')}
                      </div>
                      {edu.description && (
                        <p className="education-description">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Certificates */}
          {resume.certificates && resume.certificates.length > 0 && (
            <section className="resume-section">
              <h2 className="section-title">{t('resume.sections.certificates.title')}</h2>
              <div className="section-content">
                <div className="certificates-grid">
                  {resume.certificates.map((cert, index) => (
                    <div key={index} className="certificate-card">
                      <h3 className="certificate-name">{cert.name}</h3>
                      <div className="certificate-issuer">{cert.issuer}</div>
                      <div className="certificate-dates">
                        {t('resume.sections.certificates.issued', { date: formatDate(cert.issueDate) })}
                        {cert.expiryDate &&
                          ` • ${t('resume.sections.certificates.expires', { date: formatDate(cert.expiryDate) })}`}
                      </div>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="certificate-link"
                        >
                          {t('resume.sections.certificates.viewCertificate')}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Projects */}
          {resume.projects && resume.projects.length > 0 && (
            <section className="resume-section">
              <h2 className="section-title">{t('resume.sections.projects.title')}</h2>
              <div className="section-content">
                <div className="projects-grid">
                  {resume.projects.map((project, index) => (
                    <div key={index} className="project-card">
                      <div className="project-header">
                        <h3 className="project-name">{project.name}</h3>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-link"
                          >
                            {t('resume.sections.projects.visit')}
                          </a>
                        )}
                      </div>
                      <p className="project-description">
                        {project.description}
                      </p>
                      {project.technologies &&
                        project.technologies.length > 0 && (
                          <div className="tech-tags">
                            {project.technologies.map((tech, idx) => (
                              <span key={idx} className="tech-tag">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Languages */}
          {resume.languages && resume.languages.length > 0 && (
            <section className="resume-section">
              <h2 className="section-title">{t('resume.sections.languages.title')}</h2>
              <div className="section-content">
                <div className="languages-grid">
                  {resume.languages.map((lang, index) => (
                    <div
                      key={index}
                      className={`language-card ${
                        lang.level
                          ? `level-${lang.level
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`
                          : ""
                      } ${`name-${lang.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}`}
                    >
                      <h3 className="language-name">{lang.name}</h3>
                      <div className="language-level">{t('resume.sections.languages.level', { level: lang.level })}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Awards */}
          {resume.awards && resume.awards.length > 0 && (
            <section className="resume-section">
              <h2 className="section-title">{t('resume.sections.awards.title')}</h2>
              <div className="section-content">
                <div className="awards-grid">
                  {resume.awards.map((award, index) => (
                    <div key={index} className="award-card">
                      <div className="award-header">
                        <h3 className="award-title">{award.title}</h3>
                        <span className="award-date">
                          {t('resume.sections.awards.awarded', { date: formatDate(award.awardedDate) })}
                        </span>
                      </div>
                      <div className="award-issuer">{award.issuer}</div>
                      {award.description && (
                        <p className="award-description">{award.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Social Links */}
          {resume.socialLinks && resume.socialLinks.length > 0 && (
            <section className="resume-view-section">
              <div className="section-header">
                <h2 className="section-title">{t('resume.sections.socialLinks.title')}</h2>
                <span className="section-count">
                  {resume.socialLinks.length}
                </span>
              </div>
              <div className="section-content">
                <div className="social-links">
                  {resume.socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      {link.platform.toLowerCase() === "linkedin" ? (
                        <Linkedin />
                      ) : link.platform.toLowerCase() === "github" ? (
                        <Github />
                      ) : link.platform.toLowerCase() === "stackoverflow" ? (
                        <StackOverflow />
                      ) : link.platform.toLowerCase().includes("google") ? (
                        <Google />
                      ) : link.platform.toLowerCase().includes("orcid") ? (
                        <ORCID />
                      ) : (
                        <svg
                          className="text-phosphor"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          onClick={() => window.open(link.url, "_blank")}
                          width={32}
                          height={32}
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="m14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {link.platform}
                    </a>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* References */}
          {resume.references && resume.references.length > 0 && (
            <section className="resume-view-section">
              <div className="section-header">
                <h2 className="section-title">
                  {t('resume.sections.references.title')}
                </h2>
                <span className="section-count">
                  {resume.references.length}
                </span>
              </div>
              <div className="section-content">
                <div className="references-grid">
                  {resume.references.map((ref, index) => (
                    <div key={index} className="reference-card">
                      <h3 className="reference-name">{ref.name}</h3>
                      <div className="reference-position">
                        {ref.position} {ref.company && `at ${ref.company}`}
                      </div>
                      <div className="reference-relationship">
                        {ref.relationship}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="public-resume-footer no-print">
          <p className="privacy-notice">
            {t('resume.messages.privacyNotice')}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PublicResumeView;
