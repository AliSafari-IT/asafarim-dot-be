import ResumeSectionItemsView, { type ResumeSectionItem } from "./ResumeSectionItemsView";
import { fetchReferences, deleteReference, type ReferenceDto } from "../../../services/referenceApi";
import { convertToResumeSectionItems } from "./utils";

const ReferencesManagement = () => {
  const getItemDisplayName = (item: ReferenceDto) => item.name;
  
  const getItemSubtitle = (item: ReferenceDto) => {
    const parts = [];
    if (item.position) parts.push(item.position);
    if (item.company) parts.push(item.company);
    return parts.join(" at ");
  };

  const renderItemDetails = (item: ReferenceDto) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {item.email && (
        <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
          <strong>Email:</strong>{" "}
          <a href={`mailto:${item.email}`} style={{ color: "#4f46e5", textDecoration: "none" }}>
            {item.email}
          </a>
        </div>
      )}
      {item.phone && (
        <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
          <strong>Phone:</strong> {item.phone}
        </div>
      )}
      {item.relationship && (
        <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
          <strong>Relationship:</strong> {item.relationship}
        </div>
      )}
    </div>
  );

  // Use helper function to make fetchReferences compatible with ResumeSectionItemsView
  const fetchItemsWithTypeAssertion = async (resumeId: string) => {
    const references = await fetchReferences(resumeId);
    return convertToResumeSectionItems(references);
  };

  // Type assertions for callback functions
  const getItemDisplayNameWrapper = (item: ResumeSectionItem) => getItemDisplayName(item as unknown as ReferenceDto);
  const getItemSubtitleWrapper = (item: ResumeSectionItem) => getItemSubtitle(item as unknown as ReferenceDto);
  const renderItemDetailsWrapper = (item: ResumeSectionItem) => renderItemDetails(item as unknown as ReferenceDto);

  return (
    <ResumeSectionItemsView
      sectionType="references"
      fetchItems={fetchItemsWithTypeAssertion}
      deleteItem={deleteReference}
      getItemDisplayName={getItemDisplayNameWrapper}
      getItemSubtitle={getItemSubtitleWrapper}
      renderItemDetails={renderItemDetailsWrapper}
    />
  );
};

export default ReferencesManagement;
