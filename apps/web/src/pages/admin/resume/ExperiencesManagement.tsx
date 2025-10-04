import React from "react";
import ResumeSectionItemsView, { type ResumeSectionItem } from "./ResumeSectionItemsView";
import { fetchExperiences, deleteExperience, type ExperienceDto } from "../../../services/experienceApi";
import { convertToResumeSectionItems } from "./utils";

const ExperiencesManagement: React.FC = () => {
  const getItemDisplayName = (item: ExperienceDto) => item.jobTitle;
  
  const getItemSubtitle = (item: ExperienceDto) => {
    const parts = [];
    if (item.companyName) parts.push(item.companyName);
    if (item.location) parts.push(item.location);
    return parts.join(" • ");
  };

  const renderItemDetails = (item: ExperienceDto) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {(item.startDate || item.endDate) && (
        <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
          <strong>Period:</strong>{" "}
          {item.startDate && new Date(item.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
          {" - "}
          {item.endDate 
            ? new Date(item.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) 
            : "Present"}
        </div>
      )}
      {item.description && (
        <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.25rem" }}>
          {item.description.length > 100
            ? `${item.description.substring(0, 100)}...`
            : item.description}
        </div>
      )}
      {item.responsibilities && (
        <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.25rem" }}>
          <strong>Responsibilities:</strong>{" "}
          {item.responsibilities.length > 100
            ? `${item.responsibilities.substring(0, 100)}...`
            : item.responsibilities}
        </div>
      )}
      {item.achievements && item.achievements.length > 0 && (
        <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.25rem" }}>
          <strong>Achievements:</strong>
          <ul style={{ margin: "0.25rem 0 0 1.5rem", paddingLeft: 0 }}>
            {item.achievements.slice(0, 3).map((achievement) => (
              <li key={achievement.id} style={{ marginBottom: "0.25rem" }}>
                {achievement.text}
              </li>
            ))}
            {item.achievements.length > 3 && (
              <li style={{ fontStyle: "italic", color: "#9ca3af" }}>
                +{item.achievements.length - 3} more...
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );

  // Use helper function to make fetchExperiences compatible with ResumeSectionItemsView
  const fetchItemsWithTypeAssertion = async (resumeId: string) => {
    const experiences = await fetchExperiences(resumeId);
    return convertToResumeSectionItems(experiences);
  };

  // Type assertions for callback functions
  const getItemDisplayNameWrapper = (item: ResumeSectionItem) => getItemDisplayName(item as unknown as ExperienceDto);
  const getItemSubtitleWrapper = (item: ResumeSectionItem) => getItemSubtitle(item as unknown as ExperienceDto);
  const renderItemDetailsWrapper = (item: ResumeSectionItem) => renderItemDetails(item as unknown as ExperienceDto);

  return (
    <ResumeSectionItemsView
      sectionType="work-experiences"
      fetchItems={fetchItemsWithTypeAssertion}
      deleteItem={deleteExperience}
      getItemDisplayName={getItemDisplayNameWrapper}
      getItemSubtitle={getItemSubtitleWrapper}
      renderItemDetails={renderItemDetailsWrapper}
    />
  );
};

export default ExperiencesManagement;
