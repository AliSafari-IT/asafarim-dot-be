import ResumeSectionItemsView, { type ResumeSectionItem } from "./ResumeSectionItemsView";
import { fetchEducations, deleteEducation, type EducationDto } from "../../../services/educationApi";
import { convertToResumeSectionItems } from "./utils";

const EducationsManagement = () => {
  const getItemDisplayName = (item: EducationDto) => item.degree;
  
  const getItemSubtitle = (item: EducationDto) => {
    const parts = [];
    if (item.institution) parts.push(item.institution);
    if (item.fieldOfStudy) parts.push(item.fieldOfStudy);
    return parts.join(" • ");
  };

  const renderItemDetails = (item: EducationDto) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {(item.startDate || item.endDate) && (
        <div>
          <strong>Period:</strong>{" "}
          {item.startDate && new Date(item.startDate).getFullYear()}
          {" - "}
          {item.endDate ? new Date(item.endDate).getFullYear() : "Present"}
        </div>
      )}
      {item.description && (
        <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.25rem" }}>
          {item.description.length > 100
            ? `${item.description.substring(0, 100)}...`
            : item.description}
        </div>
      )}
    </div>
  );

  // Use helper function to make fetchEducations compatible with ResumeSectionItemsView
  const fetchItemsWithTypeAssertion = async (resumeId: string) => {
    const educations = await fetchEducations(resumeId);
    return convertToResumeSectionItems(educations);
  };

  // Type assertions for callback functions
  const getItemDisplayNameWrapper = (item: ResumeSectionItem) => getItemDisplayName(item as unknown as EducationDto);
  const getItemSubtitleWrapper = (item: ResumeSectionItem) => getItemSubtitle(item as unknown as EducationDto);
  const renderItemDetailsWrapper = (item: ResumeSectionItem) => renderItemDetails(item as unknown as EducationDto);

  return (
    <ResumeSectionItemsView
      sectionType="educations"
      fetchItems={fetchItemsWithTypeAssertion}
      deleteItem={deleteEducation}
      getItemDisplayName={getItemDisplayNameWrapper}
      getItemSubtitle={getItemSubtitleWrapper}
      renderItemDetails={renderItemDetailsWrapper}
    />
  );
};

export default EducationsManagement;
