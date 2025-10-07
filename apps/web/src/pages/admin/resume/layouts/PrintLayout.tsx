import React from 'react';
import type { ResumeLayoutProps } from './types.tsx';
import { formatDate, renderDots } from './types.tsx';
import './print-layout.css';

export const PrintLayout: React.FC<ResumeLayoutProps> = ({ resume }) => {
  return (
    <div className="print-layout-container">
      {/* Export PDF Button - completely removed for print layout */}
      {/* The PDF export is handled by the parent component */}

      {/* Header */}
      <header className="print-header">
        <h1 className="print-name">
          {/* For public resumes, don't show contact info */}
          {'publicSlug' in resume ? resume.title : (resume.contact?.fullName || resume.title)}
        </h1>
        <h2 className="print-title">{resume.title}</h2>
        {/* Only show contact bar for private resumes */}
        {!('publicSlug' in resume) && resume.contact && (
          <div className="print-contact-bar">
            {resume.contact.email && <span>📧 {resume.contact.email}</span>}
            {resume.contact.phone && <span>📱 {resume.contact.phone}</span>}
            {resume.contact.location && <span>📍 {resume.contact.location}</span>}
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
                      {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                    </span>
                  </div>
                  <div className="print-company">{exp.companyName}</div>
                  {exp.description && <p className="print-desc">{exp.description}</p>}
                  {/* Handle achievements for public resumes (string array) vs private (object array) */}
                  {'achievements' in exp && Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
                    <ul className="print-achievements">
                      {exp.achievements.map((achievement, idx: number) => (
                        <li key={idx}>{typeof achievement === 'string' ? achievement : (achievement as { text: string }).text}</li>
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
                    {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
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
                {resume.skills.map((skill, index) => (
                  <div key={index} className="print-skill">
                    <span className="print-skill-name">{skill.name}</span>
                    {renderDots(skill.rating)}
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
              {resume.certificates.slice(0, 4).map((cert, index) => (
                <div key={index} className="print-cert">
                  <strong>{cert.name}</strong>
                  <div>{cert.issuer}</div>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
