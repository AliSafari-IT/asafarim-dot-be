import ResumeSectionItemsView, { type ResumeSectionItem } from "./ResumeSectionItemsView";
import { fetchProjects, deleteProject, type ProjectDto } from "../../../services/projectApi";
import { convertToResumeSectionItems } from "./utils";

const ProjectsManagement = () => {
  const getItemDisplayName = (item: ProjectDto) => item.name;
  
  const getItemSubtitle = (item: ProjectDto) => {
    const parts = [];
    if (item.startDate) {
      const start = new Date(item.startDate).getFullYear();
      const end = item.endDate ? new Date(item.endDate).getFullYear() : "Present";
      parts.push(`${start} - ${end}`);
    }
    return parts.join(" • ");
  };

  const renderItemDetails = (item: ProjectDto) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {item.technologies && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
          {item.technologies.map((tech, idx) => (
            <span
              key={idx}
              style={{
                padding: "0.25rem 0.5rem",
                background: "#eff6ff",
                color: "#1e40af",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              {tech.name.trim()}
            </span>
          ))}
        </div>
      )}
      {item.description && (
        <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.25rem" }}>
          {item.description.length > 100
            ? `${item.description.substring(0, 100)}...`
            : item.description}
        </div>
      )}
      {item.link && (
        <div style={{ fontSize: "0.85rem" }}>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#4f46e5", textDecoration: "none" }}
          >
            View Project →
          </a>
        </div>
      )}
    </div>
  );

  // Use helper function to make fetchProjects compatible with ResumeSectionItemsView
  const fetchItemsWithTypeAssertion = async (resumeId: string) => {
    const projects = await fetchProjects(resumeId);
    return convertToResumeSectionItems(projects);
  };

  // Type assertions for callback functions
  const getItemDisplayNameWrapper = (item: ResumeSectionItem) => getItemDisplayName(item as unknown as ProjectDto);
  const getItemSubtitleWrapper = (item: ResumeSectionItem) => getItemSubtitle(item as unknown as ProjectDto);
  const renderItemDetailsWrapper = (item: ResumeSectionItem) => renderItemDetails(item as unknown as ProjectDto);

  return (
    <ResumeSectionItemsView
      sectionType="projects"
      fetchItems={fetchItemsWithTypeAssertion}
      deleteItem={deleteProject}
      getItemDisplayName={getItemDisplayNameWrapper}
      getItemSubtitle={getItemSubtitleWrapper}
      renderItemDetails={renderItemDetailsWrapper}
    />
  );
};

export default ProjectsManagement;
