import ResumeSectionItemsView, { type ResumeSectionItem } from "./ResumeSectionItemsView";
import { fetchAwards, deleteAward, type AwardDto } from "../../../services/awardApi";
import { convertToResumeSectionItems } from "./utils";

const AwardsManagement = () => {
  const getItemDisplayName = (item: AwardDto) => item.title;
  
  const getItemSubtitle = (item: AwardDto) => {
    const parts = [];
    if (item.issuer) parts.push(item.issuer);
    if (item.date) parts.push(new Date(item.date).getFullYear().toString());
    return parts.join(" • ");
  };

  const renderItemDetails = (item: AwardDto) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {item.date && (
        <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
          <strong>Date:</strong> {new Date(item.date).toLocaleDateString()}
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

  // Use helper function to make fetchAwards compatible with ResumeSectionItemsView
  const fetchItemsWithTypeAssertion = async (resumeId: string) => {
    const awards = await fetchAwards(resumeId);
    return convertToResumeSectionItems(awards);
  };

  // Type assertions for callback functions
  const getItemDisplayNameWrapper = (item: ResumeSectionItem) => getItemDisplayName(item as unknown as AwardDto);
  const getItemSubtitleWrapper = (item: ResumeSectionItem) => getItemSubtitle(item as unknown as AwardDto);
  const renderItemDetailsWrapper = (item: ResumeSectionItem) => renderItemDetails(item as unknown as AwardDto);

  return (
    <ResumeSectionItemsView
      sectionType="awards"
      fetchItems={fetchItemsWithTypeAssertion}
      deleteItem={deleteAward}
      getItemDisplayName={getItemDisplayNameWrapper}
      getItemSubtitle={getItemSubtitleWrapper}
      renderItemDetails={renderItemDetailsWrapper}
    />
  );
};

export default AwardsManagement;
