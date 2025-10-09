import ResumeSectionItemsView, { type ResumeSectionItem } from "./ResumeSectionItemsView";
import { fetchSkills, deleteSkill, type SkillDto } from "../../../services/skillApi";
import { convertToResumeSectionItems } from "./utils";

const SkillsManagement = () => {
  const getItemDisplayName = (item: SkillDto) => item.name;
  
  const getItemSubtitle = (item: SkillDto) => {
    const parts = [];
    if (item.category) parts.push(item.category);
    if (item.level) parts.push(item.level);
    return parts.join(" • ");
  };

  const renderItemDetails = (item: SkillDto) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {item.rating > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <strong>Rating:</strong>
          <div style={{ display: "flex", gap: "2px" }}>
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                style={{
                  color: i < item.rating ? "#f59e0b" : "#d1d5db",
                  fontSize: "1.25rem",
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Use helper function to make fetchSkills compatible with ResumeSectionItemsView
  const fetchItemsWithTypeAssertion = async (resumeId: string) => {
    const skills = await fetchSkills(resumeId);
    return convertToResumeSectionItems(skills);
  };

  // Type assertions for callback functions
  const getItemDisplayNameWrapper = (item: ResumeSectionItem) => getItemDisplayName(item as unknown as SkillDto);
  const getItemSubtitleWrapper = (item: ResumeSectionItem) => getItemSubtitle(item as unknown as SkillDto);
  const renderItemDetailsWrapper = (item: ResumeSectionItem) => renderItemDetails(item as unknown as SkillDto);

  return (
    <ResumeSectionItemsView
      sectionType="skills"
      fetchItems={fetchItemsWithTypeAssertion}
      deleteItem={deleteSkill}
      getItemDisplayName={getItemDisplayNameWrapper}
      getItemSubtitle={getItemSubtitleWrapper}
      renderItemDetails={renderItemDetailsWrapper}
    />
  );
};

export default SkillsManagement;
