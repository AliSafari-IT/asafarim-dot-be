import { useState } from "react";
import { Hero, ContentCard } from "@asafarim/shared-ui-react";
import type { ContentCardProps } from "@asafarim/shared-ui-react";
import { fetchPublications } from "../../../services/publicationService";
import "./publications.css";
import { useAuth } from "@asafarim/shared-ui-react";
import PublicationActionsBar from "./components/PublicationActionsBar";
import VariantItemsDisplay from "./VariantItemsDisplay";
import { PUBLICATION_VARIANTS } from "./data";

const Publications = () => {
  const { user } = useAuth();

  // Check if user is admin based on roles in the user object
  const isAdmin = user?.roles?.map((role: string) => role.toLowerCase()).includes("admin") || false;

  // Get query parameters
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const myPublications = searchParams.get("myPublications") === "true";

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

      <VariantItemsDisplay<ContentCardProps>
        variants={PUBLICATION_VARIANTS}
        fetchFunction={fetchPublications}
        filterByUser={myPublications || !isAdmin}
        heroProps={undefined} // Hero is handled separately above
        className="publications-container"
        showLoadingState={true}
        showEmptySections={false}
        renderSection={(variant, items) => {
          if (items.length === 0) return null;

          return (
            <section key={variant.id} className="publications-section">
              <h2 className="publications-section-title">{variant.title}</h2>
              <div className="publications-grid">
                {items.map((publication) => (
                  <ContentCard key={publication.id} {...publication} />
                ))}
              </div>
            </section>
          );
        }}
      />
    </div>
  );
};

export default Publications;
