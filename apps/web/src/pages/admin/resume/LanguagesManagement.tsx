import ResumeSectionItemsView, { type ResumeSectionItem } from "./ResumeSectionItemsView";
import { fetchLanguages, deleteLanguage, type LanguageDto } from "../../../services/languageApi";
import { convertToResumeSectionItems } from "./utils";

const LanguagesManagement = () => {
  const getItemDisplayName = (item: LanguageDto) => item.name;
  
  const getItemSubtitle = (item: LanguageDto) => item.level;

  const getProficiencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "native":
        return { bg: "#dcfce7", text: "#166534" };
      case "advanced":
        return { bg: "#dbeafe", text: "#1e40af" };
      case "intermediate":
        return { bg: "#fef3c7", text: "#92400e" };
      case "beginner":
        return { bg: "#fee2e2", text: "#991b1b" };
      default:
        return { bg: "#f3f4f6", text: "#374151" };
    }
  };

  const renderItemDetails = (item: LanguageDto) => {
    const colors = getProficiencyColor(item.level);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span
          style={{
            padding: "0.375rem 0.75rem",
            background: colors.bg,
            color: colors.text,
            borderRadius: "6px",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          {item.level}
        </span>
      </div>
    );
  };

  // Use helper function to make fetchLanguages compatible with ResumeSectionItemsView
  const fetchItemsWithTypeAssertion = async (resumeId: string) => {
    const languages = await fetchLanguages(resumeId);
    return convertToResumeSectionItems(languages);
  };

  // Type assertions for callback functions
  const getItemDisplayNameWrapper = (item: ResumeSectionItem) => getItemDisplayName(item as unknown as LanguageDto);
  const getItemSubtitleWrapper = (item: ResumeSectionItem) => getItemSubtitle(item as unknown as LanguageDto);
  const renderItemDetailsWrapper = (item: ResumeSectionItem) => renderItemDetails(item as unknown as LanguageDto);

  return (
    <ResumeSectionItemsView
      sectionType="languages"
      fetchItems={fetchItemsWithTypeAssertion}
      deleteItem={deleteLanguage}
      getItemDisplayName={getItemDisplayNameWrapper}
      getItemSubtitle={getItemSubtitleWrapper}
      renderItemDetails={renderItemDetailsWrapper}
    />
  );
};

export default LanguagesManagement;
