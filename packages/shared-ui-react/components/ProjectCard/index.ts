export { ProjectCard } from "./components/ProjectCard";

export type {
  ProjectCardProps,
  TechStackItem,
  ProjectLink,
  RelatedProject,
  ProjectStatus,
  ProjectCategory,
  ProjectPriority,
  Theme,
  ProjectImage,
  ProjectTag,
} from "./types";

export {
  mapProject,
  mapProjects,
  filterPublicProjects,
  sortProjects,
} from "./utils/projectMapper";

export {
  applyProjectCardTheme,
  getCurrentProjectCardTheme,
  watchProjectCardTheme,
  createProjectCardThemeContext,
  applyCustomProjectCardTheme,
  removeCustomProjectCardTheme,
  PROJECT_CARD_THEME_VARIABLES,
} from "./utils/themeUtils";

export type { ProjectCardTheme } from "./utils/themeUtils";
