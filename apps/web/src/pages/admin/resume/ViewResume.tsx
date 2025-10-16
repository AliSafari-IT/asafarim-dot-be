import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ButtonComponent as Button,
  Edit,
  Github,
  Google,
  // isProduction,
  Linkedin,
  ORCID,
  StackOverflow,
  useNotifications,
} from "@asafarim/shared-ui-react";
import {
  fetchResumeById,
  publishResume,
  unpublishResume,
  type ResumeDetailDto,
} from "../../../services/resumeApi";
import { LayoutSelector } from "./layouts/LayoutSelector";
import { type LayoutType } from "./layouts/types.tsx";
import { PrintLayout } from "./layouts/PrintLayout";
import PublishResumeModal from "./components/PublishResumeModal";
import { useTranslation } from "@asafarim/shared-i18n";
import "./resume-styles.css";
import "./view-resume.css";

const ViewResume = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addNotification } = useNotifications();
  const { t } = useTranslation("web");
  const [resume, setResume] = useState<ResumeDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLayout, setCurrentLayout] = useState<LayoutType>(
    (searchParams.get("layout") as LayoutType) || "online"
  );
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  const handleLayoutChange = (layout: LayoutType) => {
    setCurrentLayout(layout);
    setSearchParams({ layout });
  };

  useEffect(() => {
    const loadResume = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await fetchResumeById(id);
        setResume(data);
        // Initialize published slug if resume is already published
        if (data.isPublic && data.publicSlug) {
          setPublishedSlug(data.publicSlug);
        }
      } catch (err) {
        console.error("Failed to load resume:", err);
        setError(t("resume.error"));
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [id, t]);

  if (loading) {
    return (
      <div className="resume-view-page">
        <div className="resume-view-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t("resume.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="resume-view-page">
        <div className="resume-view-container">
          <div className="error-message">{error || t("resume.notFound")}</div>
          <Button onClick={() => navigate("/admin/entities/resumes")}>
            {t("resume.backToResumes")}
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    console.log("rating", rating);
    return (
      <div className="skill-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? "star filled" : "star"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const handleExportPDF = async () => {
    // Dynamically import html2pdf
    const html2pdf = (await import("html2pdf.js")).default;

    // Create a temporary container with print layout
    const element = document.createElement("div");
    element.innerHTML =
      document.querySelector(".print-layout-container")?.outerHTML || "";

    const opt = {
      margin: 15,
      filename: `${resume.contact?.fullName || "resume"}_${
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

  const handlePublish = async (customSlug?: string) => {
    if (!id) return;

    const response = await publishResume(id, {
      generateSlug: !customSlug,
      customSlug,
    });

    setPublishedSlug(response.slug);
    setShowPublishModal(false);

    addNotification("success", "Resume published successfully!");

    // Show share link in a separate notification
    const shareUrl = `${window.location.origin}${response.shareUrl}`;
    addNotification("info", `Share link: ${shareUrl}`);

    // Reload resume to get updated publication status
    const updatedResume = await fetchResumeById(id);
    setResume(updatedResume);
  };

  const handleUnpublish = async () => {
    if (!id) return;

    const confirmed = window.confirm(
      t("resume.messages.unpublishConfirm", {
        defaultValue:
          "Are you sure you want to unpublish this resume? The public link will no longer work.",
      })
    );

    if (!confirmed) return;

    try {
      await unpublishResume(id);
      setPublishedSlug(null);

      addNotification("success", t("resume.messages.unpublishedSuccess"));

      // Reload resume to get updated publication status
      const updatedResume = await fetchResumeById(id);
      setResume(updatedResume);
    } catch {
      addNotification("error", t("resume.messages.unpublishedError"));
    }
  };

  const copyShareLink = async () => {
    if (!publishedSlug) return;

    const shareUrl = `${window.location.origin}/portfolio/${publishedSlug}/public`;

    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        addNotification("success", t("resume.messages.copySuccess"));
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
          addNotification("success", t("resume.messages.copySuccess"));
        } catch (err) {
          console.error("Fallback copy failed:", err);
          addNotification(
            "error",
            t("resume.messages.copyError", { url: shareUrl })
          );
        }

        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
      addNotification(
        "error",
        t("resume.messages.copyError", { url: shareUrl })
      );
    }
  };

  // Render layout-specific component
  if (currentLayout === "print") {
    return (
      <div className="resume-view-page" data-layout="print">
        <div className="resume-view-container">
          <LayoutSelector
            currentLayout={currentLayout}
            onLayoutChange={handleLayoutChange}
            onExportPDF={handleExportPDF}
          />
          <PrintLayout resume={resume} />
        </div>
      </div>
    );
  }

  // Default online/minimal/compact layouts use same structure with different CSS
  return (
    <div className="resume-view-page" data-layout={currentLayout}>
      <div className="resume-view-container">
        <LayoutSelector
          currentLayout={currentLayout}
          onLayoutChange={handleLayoutChange}
        />

        {/* Header Section */}
        <header className="resume-view-header">
          <div className="resume-hero">
            <div className="resume-hero-content">
              <h1 className="resume-main-title">{resume.title}</h1>
              {resume.contact && (
                <div className="resume-contact-quick">
                  <span className="contact-item">
                    <svg
                      className="icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {resume.contact.fullName}
                  </span>
                  <span className="contact-item">
                    <svg
                      className="icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {resume.contact.email}
                  </span>
                  {resume.contact.phone && (
                    <span className="contact-item">
                      <svg
                        className="icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      {resume.contact.phone}
                    </span>
                  )}
                  {resume.contact.location && (
                    <span className="contact-item">
                      <svg
                        className="icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {resume.contact.location}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="resume-hero-actions">
              <Button
                onClick={() => navigate("/admin/entities/resumes")}
                variant="secondary"
              >
                {t("resume.actions.backToResumes")}
              </Button>
              <Button
                onClick={() => navigate(`/admin/entities/resumes/${id}/edit`)}
                variant="primary"
              >
                {t("resume.actions.editResume")}
              </Button>
              {publishedSlug ? (
                <>
                  <Button onClick={copyShareLink} variant="success">
                    {t("resume.actions.copyShareLink")}
                  </Button>
                  <Button onClick={handleUnpublish} variant="danger">
                    {t("resume.actions.unpublish")}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setShowPublishModal(true)}
                  variant="primary"
                >
                  {t("resume.actions.publishResume")}
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="resume-view-content">
          {/* Professional Summary */}
          {resume.summary && (
            <section className="resume-view-section summary-section">
              <div className="section-header">
                <h2 className="section-title">
                  {t("resume.sections.summary.title")}
                  <Edit
                    onClick={() =>
                      navigate(`/admin/entities/resumes/${id}/details`)
                    }
                    style={{ cursor: "pointer" }}
                  />
                </h2>
              </div>
              <div className="section-content">
                <p className="summary-text">{resume.summary}</p>
              </div>
            </section>
          )}

          {/* Work Experience */}
          {resume.workExperiences && resume.workExperiences.length > 0 && (
            <section className="resume-view-section">
              <div className="section-header">
                <h2 className="section-title">
                  {t("resume.sections.experience.title")}
                  <Edit
                    onClick={() =>
                      navigate(`/admin/entities/resumes/${id}/work-experiences`)
                    }
                    style={{ cursor: "pointer" }}
                  />
                </h2>
                <span className="section-count">
                  {resume.workExperiences.length}
                </span>
              </div>
              <div className="section-content">
                <div className="timeline">
                  {resume.workExperiences.map((exp, index) => (
                    <div key={exp.id || index} className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="item-header">
                          <h3 className="item-title">{exp.jobTitle}</h3>
                          <span className="item-date">
                            {formatDate(exp.startDate)} -{" "}
                            {exp.endDate
                              ? formatDate(exp.endDate)
                              : t("resume.sections.experience.present")}
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
                              {exp.achievements.map((ach) => (
                                <li key={ach.id}>{ach.text}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {exp.technologies && exp.technologies.length > 0 && (
                          <div className="tech-tags">
                            {exp.technologies.map((tech, idx) => (
                              <span
                                key={idx}
                                className="tech-tag"
                                title={tech.category || ""}
                              >
                                {tech.name}
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
            <section className="resume-view-section">
              <div className="section-header">
                <h2 className="section-title">
                  {t("resume.sections.skills.title")}
                  <Edit
                    onClick={() =>
                      navigate(`/admin/entities/resumes/${id}/skills`)
                    }
                    style={{ cursor: "pointer" }}
                  />
                </h2>
                <span className="section-count">{resume.skills.length}</span>
              </div>
              <div className="section-content">
                <div className="skills-grid">
                  {resume.skills.map((skill, index) => (
                    <div key={skill.id || index} className="skill-card">
                      <div className="skill-header">
                        <h3 className="skill-name">{skill.name}</h3>
                        {renderStars(skill.rating)}
                      </div>
                      <div className="skill-meta">
                        <span className="skill-category">
                          {t("resume.sections.skills.categories.category", {
                            category: skill.category,
                          })}
                        </span>
                        <span className="skill-level">
                          {t("resume.sections.skills.categories.level", {
                            level: skill.level,
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Education */}
          {resume.educationItems && resume.educationItems.length > 0 && (
            <section className="resume-view-section">
              <div className="section-header">
                <h2 className="section-title">
                  {t("resume.sections.education.title")}
                  <Edit
                    onClick={() =>
                      navigate(`/admin/entities/resumes/${id}/educations`)
                    }
                    style={{ cursor: "pointer" }}
                  />
                </h2>
                <span className="section-count">
                  {resume.educationItems.length}
                </span>
              </div>
              <div className="section-content">
                <div className="education-grid">
                  {resume.educationItems.map((edu, index) => (
                    <div key={edu.id || index} className="education-card">
                      <h3 className="education-degree">
                        {t("resume.sections.education.degree", {
                          degree: edu.degree,
                        })}
                      </h3>
                      <div className="education-institution">
                        {edu.institution}
                      </div>
                      {edu.fieldOfStudy && (
                        <div className="education-field">
                          {t("resume.sections.education.field", {
                            field: edu.fieldOfStudy,
                          })}
                        </div>
                      )}
                      <div className="education-dates">
                        {formatDate(edu.startDate)} -{" "}
                        {edu.endDate
                          ? formatDate(edu.endDate)
                          : t("resume.sections.education.present")}
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
            <section className="resume-view-section">
              <div className="section-header">
                <h2 className="section-title">
                  {t("resume.sections.certificates.title")}
                  <Edit
                    onClick={() =>
                      navigate(`/admin/entities/resumes/${id}/certificates`)
                    }
                    style={{ cursor: "pointer" }}
                  />
                </h2>
                <span className="section-count">
                  {resume.certificates.length}
                </span>
              </div>
              <div className="section-content">
                <div className="certificates-grid">
                  {resume.certificates.map((cert, index) => (
                    <div key={cert.id || index} className="certificate-card">
                      <h3 className="certificate-name">{cert.name}</h3>
                      <div className="certificate-issuer">{cert.issuer}</div>
                      <div className="certificate-dates">
                        {t("resume.sections.certificates.issued", {
                          date: formatDate(cert.issueDate),
                        })}
                        {cert.expiryDate &&
                          ` • ${t("resume.sections.certificates.expires", {
                            date: formatDate(cert.expiryDate),
                          })}`}
                      </div>
                      {(cert.credentialId || cert.credentialUrl) && (
                        <div className="certificate-credentials">
                          {cert.credentialId && (
                            <div>
                              {t("resume.sections.certificates.credentialId", {
                                id: cert.credentialId,
                              })}
                            </div>
                          )}
                          {cert.credentialUrl && (
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {t(
                                "resume.sections.certificates.viewCertificate"
                              )}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Projects */}
          {resume.projects && resume.projects.length > 0 && (
            <section className="resume-view-section">
              <div className="section-header">
                <h2 className="section-title">
                  {t("resume.sections.projects.title")}
                  <Edit
                    onClick={() =>
                      navigate(`/admin/entities/resumes/${id}/projects`)
                    }
                    style={{ cursor: "pointer" }}
                  />
                </h2>
                <span className="section-count">{resume.projects.length}</span>
              </div>
              <div className="section-content">
                <div className="projects-grid">
                  {resume.projects.map((project, index) => (
                    <div key={project.id || index} className="project-card">
                      <div className="project-header">
                        <h3 className="project-name">{project.name}</h3>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-link"
                          >
                            {t("resume.sections.projects.visit")}
                          </a>
                        )}
                      </div>
                      <p className="project-description">
                        {project.description}
                      </p>
                      {project.technologies &&
                        project.technologies.length > 0 && (
                          <div className="tech-tags">
                            {project.technologies.map((tech) => (
                              <span key={tech.id} className="tech-tag">
                                {tech.name}
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
            <section className="resume-view-section">
              <div className="section-header">
                <h2 className="section-title">
                  {t("resume.sections.languages.title")}
                  <Edit
                    onClick={() =>
                      navigate(`/admin/entities/resumes/${id}/languages`)
                    }
                    style={{ cursor: "pointer" }}
                  />
                </h2>
                <span className="section-count">{resume.languages.length}</span>
              </div>
              <div className="section-content">
                <div className="languages-grid">
                  {resume.languages.map((lang, index) => (
                    <div
                      key={lang.id || index}
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
                      <div className="language-level">
                        {t("resume.sections.languages.level", {
                          level: lang.level,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Awards */}
          {resume.awards && resume.awards.length > 0 && (
            <section className="resume-view-section">
              <div className="section-header">
                <h2 className="section-title">
                  {t("resume.sections.awards.title")}
                  <Edit
                    onClick={() =>
                      navigate(`/admin/entities/resumes/${id}/awards`)
                    }
                    style={{ cursor: "pointer" }}
                  />
                </h2>
                <span className="section-count">{resume.awards.length}</span>
              </div>
              <div className="section-content">
                <div className="awards-grid">
                  {resume.awards.map((award, index) => (
                    <div key={award.id || index} className="award-card">
                      <div className="award-header">
                        <h3 className="award-title">{award.title}</h3>
                        <span className="award-date">
                          {t("resume.sections.awards.awarded", {
                            date: formatDate(award.awardedDate),
                          })}
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

          {/* References */}
          {resume.references && resume.references.length > 0 && (
            <section className="resume-view-section">
              <div className="section-header">
                <h2 className="section-title">
                  {t("resume.sections.references.title")}
                  <Edit
                    onClick={() =>
                      navigate(`/admin/entities/resumes/${id}/references`)
                    }
                    style={{ cursor: "pointer" }}
                  />
                </h2>
                <span className="section-count">
                  {resume.references.length}
                </span>
              </div>
              <div className="section-content">
                <div className="references-grid">
                  {resume.references.map((ref, index) => (
                    <div key={ref.id || index} className="reference-card">
                      <h3 className="reference-name">{ref.name}</h3>
                      <div className="reference-relationship">
                        {ref.relationship}
                      </div>
                      <div className="reference-contact">{ref.contactInfo}</div>
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
                <h2 className="section-title">
                  {t("resume.sections.socialLinks.title")}
                  <Edit
                    onClick={() =>
                      navigate(`/admin/entities/resumes/${id}/social-links`)
                    }
                    style={{ cursor: "pointer" }}
                  />
                </h2>
                <span className="section-count">
                  {resume.socialLinks.length}
                </span>
              </div>
              <div className="section-content">
                <div className="social-links">
                  {resume.socialLinks.map((link, index) => (
                    <a
                      key={link.id || index}
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
        </div>

        {/* Publish Resume Modal */}
        <PublishResumeModal
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
          onConfirm={handlePublish}
          resumeTitle={resume.title}
        />
      </div>
    </div>
  );
};

export default ViewResume;
