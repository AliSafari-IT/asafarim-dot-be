import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, Button, useAuth } from "@asafarim/shared-ui-react";
import { ENTITY_TYPES } from "../../services/entityService";
import {
  fetchWorkExperienceById,
  type WorkExperienceDto,
} from "../../services/workExperienceService";
import {
  fetchResumeById,
  type ResumeDetailDto,
} from "../../services/resumeApi";
import { fetchPublicationById } from "../../services/publicationService";
import type { ContentCardProps } from "@asafarim/shared-ui-react";
import "./entity-management.css";

// Extended ContentCardProps with publication-specific fields
interface ExtendedContentCardProps extends ContentCardProps {
  doi?: string;
  journalName?: string;
  conferenceName?: string;
  publicationType?: string;
  isPublished?: boolean;
  userId?: string;
}

const ViewEntity: React.FC = () => {
  const navigate = useNavigate();
  const { entityType, id } = useParams<{ entityType: string; id: string }>();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [entityData, setEntityData] = useState<
    WorkExperienceDto | ResumeDetailDto | ExtendedContentCardProps | null
  >(null);

  const entity = ENTITY_TYPES.find((e) => e.id === entityType);
  const isAdmin =
    user?.roles?.map((role: string) => role.toLowerCase()).includes("admin") ||
    false;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(
        window.location.href
      )}`;
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    const loadEntityData = async () => {
      if (!id || !isAuthenticated) return;

      try {
        setIsLoading(true);

        if (entityType === "work-experiences") {
          const data = await fetchWorkExperienceById(id);
          if (data) {
            setEntityData(data);
          } else {
            setError("Work experience not found");
          }
        } else if (entityType === "resumes") {
          const data = await fetchResumeById(id);
          if (data) {
            setEntityData(data);
          } else {
            setError("Resume not found");
          }
        } else if (entityType === "publications") {
          const data = await fetchPublicationById(id);
          if (data) {
            // Cast the data to ExtendedContentCardProps since we know it has these properties
            setEntityData(data as ExtendedContentCardProps);
          } else {
            setError("Publication not found");
          }
        }
      } catch (err) {
        console.error("Error loading entity:", err);
        setError("Failed to load entity data");
      } finally {
        setIsLoading(false);
      }
    };

    loadEntityData();
  }, [id, entityType, isAuthenticated]);

  if (!entity) {
    return <div>Entity type not found</div>;
  }

  if (isLoading) {
    return (
      <div className="entity-form-container">
        <header className="entity-view-header">
          <h1>View {entity.displayName}</h1>
        </header>
        <div className="entity-view-content">Loading...</div>
      </div>
    );
  }

  if (error || !entityData) {
    return (
      <div className="entity-form-container">
        <header className="entity-view-header">
          <h1>View {entity.displayName}</h1>
          <Button
            onClick={() => navigate(`/admin/entities/${entityType}`)}
            variant="secondary"
          >
            ← Back to {entity.displayName}
          </Button>
        </header>
        <div className="entity-view-content">
          <span className="error-message">{error || "Entity not found"}</span>
        </div>
      </div>
    );
  }

  const canEdit = isAdmin || entityData.userId === user?.id;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="entity-form-container">
      <header className="entity-view-header">
        <h1>View {entity.displayName}</h1>
        <div className="entity-view-actions">
          <Button
            onClick={() => navigate(`/admin/entities/${entityType}`)}
            variant="link"
            aria-label="Back to {entity.displayName}"
            size="sm"
            rightIcon={<ArrowLeftIcon />}
            children={"Back to " + entity.displayName}
          />
          {canEdit && (
            <Button
              onClick={() =>
                navigate(`/admin/entities/${entityType}/${id}/edit`)
              }
              variant="ghost"
              size="sm"
              rightIcon="✏️"
              aria-label="Edit"
              children={""}
            />
          )}
        </div>
      </header>

      <div className="entity-view-content">
        {entityType === "work-experiences" && (
          <WorkExperienceView
            data={entityData as WorkExperienceDto}
            formatDate={formatDate}
          />
        )}
        {entityType === "resumes" && (
          <ResumeView
            data={entityData as ResumeDetailDto}
            formatDate={formatDate}
          />
        )}
        {entityType === "publications" && (
          <PublicationView data={entityData as ExtendedContentCardProps} />
        )}
      </div>
    </div>
  );
};

// Work Experience View Component
const WorkExperienceView: React.FC<{
  data: WorkExperienceDto;
  formatDate: (date: string) => string;
}> = ({ data, formatDate }) => (
  <div className="entity-view-content">
    <section className="entity-view-section">
      <h2 className="entity-view-section-title">Job Details</h2>
      <div className="entity-view-section-content">
        <div className="entity-view-section-content-item-label">
          <strong>Job Title:</strong>
        </div>
        <div className="entity-view-section-content-item-value">
          {data.jobTitle}
        </div>

        <div className="entity-view-section-content-item-label">
          <strong>Company:</strong>
        </div>
        <div className="entity-view-section-content-item-value">
          {data.companyName}
        </div>

        {data.location && (
          <>
            <div className="entity-view-section-content-item-label">
              <strong>Location:</strong>
            </div>
            <div className="entity-view-section-content-item-value">
              {data.location}
            </div>
          </>
        )}

        <div className="entity-view-section-content-item-label">
          <strong>Start Date:</strong>
        </div>
        <div className="entity-view-section-content-item-value">
          {formatDate(data.startDate)}
        </div>

        <div className="entity-view-section-content-item-label">
          <strong>End Date:</strong>
        </div>
        <div className="entity-view-section-content-item-value">
          {data.isCurrent
            ? "Present"
            : data.endDate
            ? formatDate(data.endDate)
            : "N/A"}
        </div>

        <div className="entity-view-section-content-item-label">
          <strong>Status:</strong>
        </div>
        <div className="entity-view-section-content-item-value">
          {data.isCurrent ? "🟢 Currently Working" : "⚪ Past Position"}
        </div>
      </div>
    </section>

    {data.description && (
      <section className="entity-view-section">
        <h2 className="entity-view-section-title">Description</h2>
        <p className="entity-view-section-content-item-value">
          {data.description}
        </p>
      </section>
    )}

    {data.achievements && data.achievements.length > 0 && (
      <section className="entity-view-section">
        <h2 className="entity-view-section-title">Achievements</h2>
        <ul style={{ listStyle: "disc", paddingLeft: "2rem" }}>
          {data.achievements.map((achievement, index) => (
            <li key={index} style={{ marginBottom: "0.5rem" }}>
              {achievement.text}
            </li>
          ))}
        </ul>
      </section>
    )}

    <section className="entity-view-section">
      <h2 className="entity-view-section-title">Display Settings</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: "1rem",
        }}
      >
        <div>
          <strong>Sort Order:</strong>
        </div>
        <div>{data.sortOrder}</div>

        <div>
          <strong>Highlighted:</strong>
        </div>
        <div>{data.highlighted ? "⭐ Yes" : "No"}</div>

        <div>
          <strong>Published:</strong>
        </div>
        <div>{data.isPublished ? "✅ Published" : "❌ Unpublished"}</div>
      </div>
    </section>

    {data.createdAt && (
      <section className="entity-view-section">
        <h2 className="entity-view-section-title">Metadata</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            gap: "1rem",
          }}
        >
          <div className="entity-view-section-content-item-label">
            <strong>Created:</strong>
          </div>
          <div className="entity-view-section-content-item-value">
            {formatDate(data.createdAt)}
          </div>

          {data.updatedAt && (
            <>
              <div className="entity-view-section-content-item-label">
                <strong>Last Updated:</strong>
              </div>
              <div className="entity-view-section-content-item-value">
                {formatDate(data.updatedAt)}
              </div>
            </>
          )}

          {data.userId && (
            <>
              <div className="entity-view-section-content-item-label">
                <strong>User ID:</strong>
              </div>
              <div className="entity-view-section-content-item-value">
                <code>{data.userId}</code>
              </div>
            </>
          )}
        </div>
      </section>
    )}
  </div>
);

// Resume View Component
const ResumeView: React.FC<{
  data: ResumeDetailDto;
  formatDate: (date: string) => string;
}> = ({ data, formatDate }) => (
  <div>
    <section className="entity-view-section">
      <h2 className="entity-view-section-title">Resume Information</h2>
      <div className="entity-view-section-content">
        <div className="entity-view-section-content-item-label">
          <strong>Title:</strong>
        </div>
        <div className="entity-view-section-content-item-value">
          {data.title}
        </div>

        <div className="entity-view-section-content-item-label">
          <strong>Created:</strong>
        </div>
        <div className="entity-view-section-content-item-value">
          {formatDate(data.createdAt)}
        </div>

        <div className="entity-view-section-content-item-label">
          <strong>Last Updated:</strong>
        </div>
        <div className="entity-view-section-content-item-value">
          {formatDate(data.updatedAt)}
        </div>
      </div>
    </section>

    {data.contact && (
      <section className="entity-view-section">
        <h2 className="entity-view-section-title">Contact Information</h2>
        <div className="entity-view-section-content">
          <div className="entity-view-section-content-item-label">
            <strong>Name:</strong>
          </div>
          <div className="entity-view-section-content-item-value">
            {data.contact.fullName}
          </div>

          <div className="entity-view-section-content-item-label">
            <strong>Email:</strong>
          </div>
          <div className="entity-view-section-content-item-value">
            {data.contact.email}
          </div>

          <div className="entity-view-section-content-item-label">
            <strong>Phone:</strong>
          </div>
          <div className="entity-view-section-content-item-value">
            {data.contact.phone || "N/A"}
          </div>
        </div>
        <div className="entity-view-section-content-item-label">
          <strong>Location:</strong>
        </div>
        <div className="entity-view-section-content-item-value">
          {data.contact.location || "N/A"}
        </div>
      </section>
    )}

    {data.summary && (
      <section className="entity-view-section">
        <h2 className="entity-view-section-title">Professional Summary</h2>
        <p
          className="entity-view-section-content-item-value"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {data.summary}
        </p>
      </section>
    )}

    <section className="entity-view-section">
      <h2 className="entity-view-section-title">Resume Sections</h2>
      <div className="entity-view-section-content">
        <div className="entity-view-section-content-item-label">
          📄 <strong>Work Experiences:</strong>{" "}
          {data.workExperiences?.length || 0}
        </div>
        <div className="entity-view-section-content-item-value">
          🎓 <strong>Education:</strong> {data.educationItems?.length || 0}
        </div>
        <div className="entity-view-section-content-item-value">
          💡 <strong>Skills:</strong> {data.skills?.length || 0}
        </div>
        <div className="entity-view-section-content-item-value">
          📜 <strong>Certificates:</strong> {data.certificates?.length || 0}
        </div>
        <div className="entity-view-section-content-item-value">
          🚀 <strong>Projects:</strong> {data.projects?.length || 0}
        </div>
        <div className="entity-view-section-content-item-value">
          🌐 <strong>Languages:</strong> {data.languages?.length || 0}
        </div>
        <div className="entity-view-section-content-item-value">
          🏆 <strong>Awards:</strong> {data.awards?.length || 0}
        </div>
        <div className="entity-view-section-content-item-value">
          👥 <strong>References:</strong> {data.references?.length || 0}
        </div>
      </div>
    </section>

    {data.workExperiences && (
      <section className="resume-section">
        <div className="resume-section-title">Experiences</div>
        {data.workExperiences?.map((experience, index) => (
          <div key={index} className="resume-work-experience-item">
            <div className="resume-work-experience-title">
              {experience.jobTitle}
            </div>
            <div className="resume-work-experience-company">
              {experience.companyName}
            </div>
            <div className="resume-work-experience-location">
              {experience.location}
            </div>
            <div className="resume-work-experience-start-date">
              {experience.startDate}
            </div>
            <div className="resume-work-experience-end-date">
              {experience.endDate}
            </div>
            <div className="resume-work-experience-is-current">
              {experience.isCurrent}
            </div>
            <div className="resume-work-experience-description">
              {experience.description}
            </div>
          </div>
        ))}
      </section>
    )}
    {data.educationItems?.length > 0 && (
      <section className="resume-section">
        <div className="resume-section-title">Education</div>
        {data.educationItems?.map((education, index) => (
          <div key={index} className="resume-education-item">
            <div className="resume-education-title">{education.degree}</div>
            <div className="resume-education-institution">
              {education.institution}
            </div>
            <div className="resume-education-location">
              {education.fieldOfStudy}
            </div>
            <div className="resume-education-start-date">
              {education.startDate}
            </div>
            <div className="resume-education-end-date">{education.endDate}</div>
            <div className="resume-education-description">
              {education.description}
            </div>
          </div>
        ))}
      </section>
    )}
    {data.skills?.length > 0 && (
      <section className="resume-section">
        <div className="resume-section-title">Skills</div>
        {data.skills?.map((skill, index) => (
          <div key={index} className="resume-skill-item">
            <div className="resume-skill-name">{skill.name}</div>
            <div className="resume-skill-level">{skill.level}</div>
          </div>
        ))}
      </section>
    )}
    {data.certificates?.length > 0 && (
      <section className="resume-section">
        <div className="resume-section-title">Certificates</div>
        {data.certificates?.map((certificate, index) => (
          <div key={index} className="resume-certificate-item">
            <div className="resume-certificate-name">{certificate.name}</div>
            <div className="resume-certificate-issuer">
              {certificate.issuer}
            </div>
            <div className="resume-certificate-start-date">
              {certificate.issueDate}
            </div>
            <div className="resume-certificate-end-date">
              {certificate.expiryDate}
            </div>
            <div className="resume-certificate-credential">
              {certificate.credentialId}: {certificate.credentialUrl}
            </div>
          </div>
        ))}
      </section>
    )}
    {data.projects?.length > 0 && (
      <section className="resume-section">
        <div className="resume-section-title">Projects</div>
        {data.projects?.map((project, index) => (
          <div key={index} className="resume-project-item">
            <div className="resume-project-name">{project.name}</div>
            <div className="resume-project-description">
              {project.description}
            </div>
          </div>
        ))}
      </section>
    )}
    {data.languages?.length > 0 && (
      <section className="resume-section">
        <div className="resume-section-title">Languages</div>
        {data.languages?.map((language, index) => (
          <div key={index} className="resume-language-item">
            <div className="resume-language-name">{language.name}</div>
            <div className="resume-language-level">{language.level}</div>
          </div>
        ))}
      </section>
    )}
    {data.awards?.length > 0 && (
      <section className="resume-section">
        <div className="resume-section-title">Awards</div>
        {data.awards?.map((award, index) => (
          <div key={index} className="resume-award-item">
            <div className="resume-award-title">{award.title}</div>
            <div className="resume-award-description">{award.description}</div>
          </div>
        ))}
      </section>
    )}
    {data.references?.length > 0 && (
      <section className="resume-section">
        <div className="resume-section-title">References</div>
        {data.references?.map((reference, index) => (
          <div key={index} className="resume-reference-item">
            <div className="resume-reference-name">{reference.name}</div>
            <div className="resume-reference-relationship">
              {reference.relationship}
            </div>
            <div className="resume-reference-contact-info">
              {reference.contactInfo}
            </div>
          </div>
        ))}
      </section>
    )}
  </div>
);

// Publication View Component
const PublicationView: React.FC<{ data: ExtendedContentCardProps }> = ({
  data,
}) => (
  <div className="entity-view">
    <section className="entity-view-section">
      <h2 className="entity-view-section-title">Publication Details</h2>
      <div className="entity-view-section-content">
        <div className="entity-view-section-content-item">
          <strong>Title:</strong>
        </div>
        <div className="entity-view-section-content-item-value">
          {data.title}
        </div>

        {data.subtitle && (
          <div className="entity-view-section-content-item">
            <div className="entity-view-section-content-item-label">
              <strong>Subtitle:</strong>
            </div>
            <div className="entity-view-section-content-item-value">
              {data.subtitle}
            </div>
          </div>
        )}

        {data.year && (
          <div className="entity-view-section-content-item">
            <div className="entity-view-section-content-item-label">
              <strong>Year:</strong>
            </div>
            <div className="entity-view-section-content-item-value">
              {data.year}
            </div>
          </div>
        )}

        {data.doi && (
          <div className="entity-view-section-content-item">
            <div className="entity-view-section-content-item-label">
              <strong>DOI:</strong>
            </div>
            <div className="entity-view-section-content-item-value">
              <code>{data.doi}</code>
            </div>
          </div>
        )}

        {data.journalName && (
          <div className="entity-view-section-content-item">
            <div className="entity-view-section-content-item-label">
              <strong>Journal:</strong>
            </div>
            <div className="entity-view-section-content-item-value">
              {data.journalName}
            </div>
          </div>
        )}

        {data.conferenceName && (
          <div className="entity-view-section-content-item">
            <div className="entity-view-section-content-item-label">
              <strong>Conference:</strong>
            </div>
            <div className="entity-view-section-content-item-value">
              {data.conferenceName}
            </div>
          </div>
        )}

        {data.link && (
          <div className="entity-view-section-content-item">
            <div className="entity-view-section-content-item-label">
              <strong>Link:</strong>
            </div>
            <div className="entity-view-section-content-item-value">
              <a href={data.link} target="_blank" rel="noopener noreferrer">
                {data.link}
              </a>
            </div>
          </div>
        )}
      </div>
    </section>

    {data.description && (
      <section className="entity-view-section">
        <h2 className="entity-view-section-title">Description</h2>
        <p
          className="entity-view-section-content-item-value"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {data.description}
        </p>
      </section>
    )}

    {data.imageUrl && (
      <section className="entity-view-section">
        <h2 className="entity-view-section-title">Image</h2>
        <img
          src={data.imageUrl}
          alt={data.title}
          style={{ maxWidth: "100%", borderRadius: "8px" }}
        />
      </section>
    )}

    <section className="entity-view-section">
      <h2 className="entity-view-section-title">Display Settings</h2>
      <div className="entity-view-section-content">
        <div className="entity-view-section-content-item">
          <div className="entity-view-section-content-item-label">
            <strong>Variant:</strong>
          </div>
          <div className="entity-view-section-content-item-value">
            {data.variant || "default"}
          </div>
        </div>

        <div className="entity-view-section-content-item">
          <div className="entity-view-section-content-item-label">
            <strong>Size:</strong>
          </div>
          <div className="entity-view-section-content-item-value">
            {data.size || "md"}
          </div>
        </div>

        <div className="entity-view-section-content-item">
          <div className="entity-view-section-content-item-label">
            <strong>Featured:</strong>
          </div>
          <div className="entity-view-section-content-item-value">
            {data.featured ? "⭐ Yes" : "No"}
          </div>
        </div>

        <div className="entity-view-section-content-item">
          <div className="entity-view-section-content-item-label">
            <strong>Full Width:</strong>
          </div>
          <div className="entity-view-section-content-item-value">
            {data.fullWidth ? "Yes" : "No"}
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default ViewEntity;
