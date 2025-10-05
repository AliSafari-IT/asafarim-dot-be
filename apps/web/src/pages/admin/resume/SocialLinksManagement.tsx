import React from "react";
import ResumeSectionItemsView, { type ResumeSectionItem } from "./ResumeSectionItemsView";
import { fetchSocialLinks, deleteSocialLink, type SocialLinkDto } from "../../../services/socialLinkApi";
import { convertToResumeSectionItems } from "./utils";

const SocialLinksManagement: React.FC = () => {
  const getItemDisplayName = (item: SocialLinkDto) => item.platform;

  const getItemSubtitle = (item: SocialLinkDto) => {
    const parts = [];
    if (item.url) parts.push(item.url);
    return parts.join(" • ");
  };

  const renderItemDetails = (item: SocialLinkDto) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {item.url && (
        <div style={{ fontSize: "0.85rem" }}>
          <strong>URL:</strong> {item.url}
        </div>
      )}
      {item.url && (
        <div style={{ fontSize: "0.85rem" }}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#4f46e5", textDecoration: "none" }}
          >
            Visit Profile →
          </a>
        </div>
      )}
    </div>
  );

  // Use helper function to make fetchSocialLinks compatible with ResumeSectionItemsView
  const fetchItemsWithTypeAssertion = async (resumeId: string) => {
    const socialLinks = await fetchSocialLinks(resumeId);
    return convertToResumeSectionItems(socialLinks);
  };

  // Type assertions for callback functions
  const getItemDisplayNameWrapper = (item: ResumeSectionItem) => getItemDisplayName(item as unknown as SocialLinkDto);
  const getItemSubtitleWrapper = (item: ResumeSectionItem) => getItemSubtitle(item as unknown as SocialLinkDto);
  const renderItemDetailsWrapper = (item: ResumeSectionItem) => renderItemDetails(item as unknown as SocialLinkDto);

  return (
    <ResumeSectionItemsView
      sectionType="social-links"
      fetchItems={fetchItemsWithTypeAssertion}
      deleteItem={deleteSocialLink}
      getItemDisplayName={getItemDisplayNameWrapper}
      getItemSubtitle={getItemSubtitleWrapper}
      renderItemDetails={renderItemDetailsWrapper}
    />
  );
};

export default SocialLinksManagement;
