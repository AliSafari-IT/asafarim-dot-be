import React, { useState, useEffect } from "react";
import {
  Hero,
  ContentCard,
  LoginArrow,
  isProduction,
  Button,
} from "@asafarim/shared-ui-react";
import type { ContentCardProps } from "@asafarim/shared-ui-react";
import { fetchPublications } from "../../../services/publicationService";
import "./publications.css";
import { useAuth } from "@asafarim/shared-ui-react";

// Component for publication management actions bar
const PublicationActionsBar: React.FC = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  
  // Check if user is admin based on roles in the user object
  const isAdmin = user?.roles?.map((role: string) => role.toLowerCase()).includes('admin') || false;

  // Handle login redirect
  const handleLoginRedirect = () => {
    const baseUrl = isProduction
      ? "https://identity.asafarim.be/login"
      : "http://identity.asafarim.local:5177/login";
    window.location.href = `${baseUrl}?returnUrl=${encodeURIComponent(
      window.location.href
    )}`;
  };

  // Handle navigation actions
  const handleAddPublication = () => {
    window.location.href = "/portfolio/publications/new";
  };

  const handleMyPublications = () => {
    window.location.href = "/portfolio/publications?myPublications=true";
  };

  const handleManagePublications = () => {   
    // Navigate directly to the manage page
    // The manage page will handle authentication checks properly
    window.location.href = "/portfolio/publications/manage";
  };
  
  const handleAllPublications = () => {
    window.location.href = "/portfolio/publications";
  };

  // Determine alignment class based on authentication status
  const alignmentClass = isAuthenticated ? "actions-center" : "actions-right";

  return (
    <div className="publication-actions-bar">
      <div className={alignmentClass}>
        {!isAuthenticated || authLoading ? (
          // Show login button when not authenticated
          <div className="publication-actions tooltip">
            <Button
              onClick={handleLoginRedirect}
              aria-label="Login"
              variant="outline"
            >
              <LoginArrow />
            </Button>
            <span className="tooltip-text">Login to manage publications</span>
          </div>
        ) : (
          // Show direct action buttons when authenticated
          <div className="actions-buttons-group">
            <Button
              onClick={handleAddPublication}
              aria-label="Add new publication"
              variant="brand"
            >
              Add Publication
            </Button>
            <Button
              onClick={handleMyPublications}
              aria-label="View my publications"
              variant="info"
            >
              My Publications
            </Button>
            {isAdmin && (
              <Button
                onClick={handleAllPublications}
                aria-label="View all publications"
                variant="info"
              >
                All Publications
              </Button>
            )}
            <Button
              onClick={handleManagePublications}
              aria-label="Manage publications"
              variant="success"
            >
              Manage Publications
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Configuration for publication variants
const PUBLICATION_VARIANTS = [
  {
    variant: "publication",
    title: "Journal Publications",
    description: "Published in peer-reviewed journals",
  },
  {
    variant: "project",
    title: "Conference Presentations",
    description: "Presented at conferences and symposiums",
  },
  {
    variant: "article",
    title: "Articles",
    description: "Technical articles and blog posts",
  },
  {
    variant: "report",
    title: "Reports",
    description: "Technical reports and white papers",
  },
  {
    variant: "default",
    title: "Other Publications",
    description: "Miscellaneous publications and documents",
  },
] as const;

const Publications: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [publicationsByVariant, setPublicationsByVariant] = useState<
    Record<string, ContentCardProps[]>
  >({});
  const [loading, setLoading] = useState(true);

  // Check if user is admin based on roles in the user object
  const isAdmin = user?.roles?.map((role: string) => role.toLowerCase()).includes('admin') || false;
  
  // Get query parameters
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const myPublications = searchParams.get("myPublications") === "true";

  useEffect(() => {
    const loadPublications = async () => {
      try {
        setLoading(true);
        const publicationsData: Record<string, ContentCardProps[]> = {};

        // Fetch publications for each variant
        // If myPublications is true, always show only the user's publications
        // If user is admin, show all publications when not viewing myPublications
        // If user is not admin, show only public publications when not viewing myPublications
        const filterByUser = myPublications || !isAdmin;
        // When filterByUser is true:
        // - For admin: only when explicitly requesting myPublications
        // - For non-admin: always filter (either myPublications or public only)
        
        console.log("Loading publications, authLoading:", authLoading, "isAdmin:", isAdmin);
        
        await Promise.all(
          PUBLICATION_VARIANTS.map(async ({ variant }) => {
            const data = await fetchPublications(
              variant,
              undefined,
              filterByUser
            );
            publicationsData[variant] = data;
          })
        );

        setPublicationsByVariant(publicationsData);
      } catch (err) {
        console.error("Failed to load publications:", err);
      } finally {
        setLoading(false);
      }
    };

    // Only load publications once authentication loading is complete
    if (!authLoading) {
      loadPublications();
    }
  }, [myPublications, isAdmin, authLoading]);

  return (
    <div className="publications-page">
      <PublicationActionsBar />
      <Hero
        kicker="Publications"
        title="Academic & Technical Publications"
        subtitle="My research papers, articles, and conference presentations"
        bullets={[
          "Published in peer-reviewed journals and conferences",
          "Focus on web technologies, software architecture, and performance optimization",
          "Regular speaker at technical conferences and meetups",
        ]}
        primaryCta={{
          label: "View Research",
          to: "/portfolio/research",
        }}
        secondaryCta={{
          label: "Contact Me",
          to: "/contact",
        }}
      />

      <div className="publications-container">
        {loading ? (
          <div className="loading-state">Loading publications...</div>
        ) : (
          PUBLICATION_VARIANTS.map(({ variant, title }) => {
            const publications = publicationsByVariant[variant] || [];

            // Only render section if there are publications for this variant
            if (publications.length === 0) {
              return null;
            }

            return (
              <section key={variant} className="publications-section">
                <h2 className="publications-section-title">{title}</h2>
                <div className="publications-grid">
                  {publications.map((publication, index) => (
                    <div
                      key={`${variant}-${index}`}
                      className="publication-card"
                    >
                      <ContentCard
                        {...publication}
                        userId={publication.userId || "default"}
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Publications;
