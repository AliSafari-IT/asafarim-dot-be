import React from "react";
import { ContentCard, Hero, Heading } from "@asafarim/shared-ui-react";
import VariantItemsDisplay from "./VariantItemsDisplay";
import {
  fetchProjects,
  fetchPublications,
} from "../../../services/publicationService";
import type { ContentCardProps } from "@asafarim/shared-ui-react";
import { useAuth } from "@asafarim/shared-ui-react";
import { DOCUMENT_VARIANTS } from "./data";
import PublicationActionsBar from "./components/PublicationActionsBar";
import { useParams } from "react-router-dom";
import "./documents.css";

import { useNavigate } from "react-router-dom";

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { contentType } = useParams();

  // Validate contentType - only allow 'projects' or 'publications'
  const validContentTypes = ['projects', 'publications'];
  if (!contentType || !validContentTypes.includes(contentType)) {
    // Redirect to publications if contentType is invalid
    navigate('/portfolio/publications', { replace: true });
    return null;
  }

  const ctaUrl = {
    path: contentType === "projects" ? "/portfolio/publications" : "/portfolio/projects",
    label: contentType === "projects" ? "Publications" : "Projects",
  };

  // Check if user is admin based on roles in the user object
  const isAdmin =
    user?.roles?.map((role: string) => role.toLowerCase()).includes("admin") ||
    false;

  // Get query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const myDocs =
    searchParams.get(
      contentType === "projects" ? "myProjects" : "myPublications"
    ) === "true";

  console.log(contentType);
  return (
    <div className="projects-page">
      <PublicationActionsBar />
      <Hero
        kicker={contentType === "projects" ? "Projects" : "Publications"}
        title="Featured Projects & Portfolio"
        subtitle={
          contentType === "projects"
            ? "A showcase of my technical projects, from web applications to open source contributions"
            : "A showcase of my academic publications, from research papers to conference presentations"
        }
        bullets={
          contentType === "projects"
            ? [
                "Full-stack web applications and APIs",
                "Open source libraries and tools",
                "Research prototypes and experiments",
                "Commercial software solutions",
              ]
            : [
                "Published in peer-reviewed journals and conferences",
                "Focus on web technologies, software architecture, and performance optimization",
                "Regular speaker at technical conferences and meetups",
              ]
        }
        primaryCta={{
          label: ctaUrl.label,
          to: ctaUrl.path,
        }}
        secondaryCta={{
          label: "Contact Me",
          to: "/contact",
        }}
      />

      <VariantItemsDisplay<ContentCardProps>
        variants={DOCUMENT_VARIANTS}
        fetchFunction={
          contentType === "projects" ? fetchProjects : fetchPublications
        }
        filterByUser={myDocs || !isAdmin}
        heroProps={undefined} // Hero is handled separately above
        className="documents-container"
        showLoadingState={true}
        showEmptySections={false}
        renderSection={(variantType, documents) => {
          if (documents.length === 0) return null;

          return (
            <section key={variantType.id} className="documents-section">
              <Heading
                level={1}
                variant="display"
                align="center"
                weight="bold"
                color="primary"
                size="3xl"
                marginBottom="lg"
                uppercase={false}
              >
                {variantType.title}
              </Heading>
              <div className="documents-grid">
                {documents.map((document) => (
                  <ContentCard key={document.id} {...document} />
                ))}
              </div>
            </section>
          );
        }}
      />
    </div>
  );
};

export default Documents;
