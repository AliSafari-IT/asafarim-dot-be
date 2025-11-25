import type { ResumeLayoutProps } from "./types.tsx";
import { formatDate, renderDots } from "./types.tsx";
import type { SkillDto, PublicSkillDto } from "../../../../services/resumeApi";
import {
  Github,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Dribbble,
  Globe2,
  Link2,
} from "lucide-react";
import "./print-layout.css";

type AnySkill = SkillDto | PublicSkillDto;

export const PrintLayout = ({ resume }: ResumeLayoutProps) => {
  const skillsByCategory = (resume.skills ?? []).reduce<
    Record<string, AnySkill[]>
  >((acc, skill) => {
    const key = skill.category || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(skill as AnySkill);
    return acc;
  }, {});

  return (
    <div className="print-layout-container">
      {/* Export PDF Button - completely removed for print layout */}
      {/* The PDF export is handled by the parent component */}

      {/* Header */}
      <header className="print-header">
        <h1 className="print-name">
          {/* For public resumes, don't show contact info */}
          {"publicSlug" in resume
            ? resume.title
            : resume.contact?.fullName || resume.title}
        </h1>
        <h2 className="print-title">{resume.title}</h2>
        {/* Only show contact bar for private resumes */}
        {!("publicSlug" in resume) && resume.contact && (
          <div className="print-contact-bar">
            {resume.contact.email && <span>📧 {resume.contact.email}</span>}
            {resume.contact.phone && <span>📱 {resume.contact.phone}</span>}
            {resume.contact.location && (
              <span>📍 {resume.contact.location}</span>
            )}
          </div>
        )}
      </header>

      {/* Summary */}
      {resume.summary && (
        <section className="print-section">
          <h3 className="print-section-title">PROFESSIONAL SUMMARY</h3>
          <p className="print-summary">{resume.summary}</p>
        </section>
      )}

      <div className="print-two-column">
        {/* Left Column */}
        <div className="print-left">
          {/* Experience */}
          {resume.workExperiences && resume.workExperiences.length > 0 && (
            <section className="print-section">
              <h3 className="print-section-title">EXPERIENCE</h3>
              {resume.workExperiences.map((exp, index) => (
                <div key={index} className="print-exp-item">
                  <div className="print-exp-header">
                    <strong>{exp.jobTitle}</strong>
                    <span className="print-date">
                      {formatDate(exp.startDate)} -{" "}
                      {exp.endDate ? formatDate(exp.endDate) : "Present"}
                    </span>
                  </div>
                  <div className="print-company">{exp.companyName}</div>
                  {exp.description && (
                    <p className="print-desc">{exp.description}</p>
                  )}
                  {/* Handle achievements for public resumes (string array) vs private (object array) */}
                  {"achievements" in exp &&
                    Array.isArray(exp.achievements) &&
                    exp.achievements.length > 0 && (
                      <ul className="print-achievements">
                        {exp.achievements.map((achievement, idx: number) => (
                          <li key={idx}>
                            {typeof achievement === "string"
                              ? achievement
                              : (achievement as { text: string }).text}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {resume.educationItems && resume.educationItems.length > 0 && (
            <section className="print-section">
              <h3 className="print-section-title">EDUCATION</h3>
              {resume.educationItems.map((edu, index) => (
                <div key={index} className="print-edu-item">
                  <strong>{edu.degree}</strong>
                  <div>{edu.institution}</div>
                  <div className="print-date">
                    {formatDate(edu.startDate)} -{" "}
                    {edu.endDate ? formatDate(edu.endDate) : "Present"}
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="print-right">
          {/* Skills */}
          {resume.skills && resume.skills.length > 0 && (
            <section className="print-section">
              <h3 className="print-section-title">SKILLS</h3>
              <div className="print-skills">
                {Object.entries(skillsByCategory).map(([category, skills]) => (
                  <div
                    key={category}
                    className="print-skill-category"
                    data-testid="print-skill-category"
                  >
                    <div
                      className="print-skill-category-title"
                      data-testid="print-skill-category-title"
                    >
                      {category}
                    </div>
                    {skills.map((skill, index) => (
                      <div key={index} className="print-skill">
                        <span className="print-skill-name">{skill.name}</span>
                        {renderDots(skill.rating)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {resume.languages && resume.languages.length > 0 && (
            <section className="print-section">
              <h3 className="print-section-title">LANGUAGES</h3>
              {resume.languages.map((lang, index) => (
                <div key={index} className="print-lang">
                  <span>{lang.name}</span>
                  <span>{lang.level}</span>
                </div>
              ))}
            </section>
          )}

          {/* Certificates */}
          {resume.certificates && resume.certificates.length > 0 && (
            <section className="print-section">
              <h3 className="print-section-title">CERTIFICATES</h3>
              {resume.certificates.slice(0, 5).map((cert, index) => (
                <div key={index} className="print-cert">
                  <strong>{cert.name}</strong>
                  <div>{cert.issuer}</div>
                  {"issueDate" in cert && (
                    <div className="print-date">
                      {formatDate(cert.issueDate)}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>

      {/* Projects Section - Full Width */}
      {resume.projects && resume.projects.length > 0 && (
        <section className="print-section">
          <h3 className="print-section-title">PROJECTS</h3>
          <div className="print-projects">
            {resume.projects.slice(0, 3).map((project, index) => (
              <div key={index} className="print-project">
                <strong>{project.name}</strong>
                {project.description && (
                  <div className="print-desc">{project.description}</div>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="print-tech-tags">
                    {(
                      project.technologies as (
                        | string
                        | { id: string; name: string; category: string }
                      )[]
                    ).map((tech, index) => (
                      <span key={index}>
                        {typeof tech === "string" ? tech : tech.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Awards Section - Full Width */}
      {resume.awards && resume.awards.length > 0 && (
        <section className="print-section">
          <h3 className="print-section-title">AWARDS & HONORS</h3>
          <div className="print-awards">
            {resume.awards.slice(0, 3).map((award, index) => (
              <div key={index} className="print-award">
                <div className="print-exp-header">
                  <strong>{award.title}</strong>
                  {"awardedDate" in award && (
                    <span className="print-date">
                      {formatDate(award.awardedDate)}
                    </span>
                  )}
                </div>
                <div className="print-company">{award.issuer}</div>
                {award.description && (
                  <div className="print-desc">{award.description}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Social links - Full Width */}
      {resume.socialLinks && resume.socialLinks.length > 0 && (
        <section className="print-section">
          <h3 className="print-section-title">SOCIAL LINKS</h3>
          <div className="print-social-links">
            {resume.socialLinks.slice(0, 9).map((link, index) => {
              const platform = link.platform || "";

              const Icon = (() => {
                const normalized = platform.toLowerCase();
                if (normalized === "github") return Github;
                if (normalized === "linkedin") return Linkedin;
                if (normalized === "x" || normalized === "twitter")
                  return Twitter;
                if (normalized === "facebook") return Facebook;
                if (normalized === "instagram") return Instagram;
                if (normalized === "youtube") return Youtube;
                if (normalized === "dribbble") return Dribbble;
                if (
                  normalized === "website" ||
                  normalized === "portfolio" ||
                  normalized === "asafarim"
                )
                  return Globe2;
                return Link2;
              })();

              return (
                <div key={index} className="print-social-link">
                  <div className="print-social-content">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="print-social-url"
                    >
                      <span className="print-social-icon">
                        <Icon size={16} />
                      </span>
                      <strong>{platform}</strong>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
