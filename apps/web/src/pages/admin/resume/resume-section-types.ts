export interface ResumeSectionType {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  endpoint: string;
  color: string;
}

// Define all resume sections based on the Resume model
export const RESUME_SECTION_TYPES: ResumeSectionType[] = [
  {
    id: "work-experiences",
    name: "work-experiences",
    displayName: "Work Experiences",
    description: "Professional work history and achievements",
    icon: "💼",
    endpoint: "/work-experiences",
    color: "#4F46E5",
  },
  {
    id: "educations",
    name: "educations",
    displayName: "Education",
    description: "Academic background and qualifications",
    icon: "🎓",
    endpoint: "/educations",
    color: "#059669",
  },
  {
    id: "skills",
    name: "skills",
    displayName: "Skills",
    description: "Technical and professional skills",
    icon: "⚡",
    endpoint: "/skills",
    color: "#DC2626",
  },
  {
    id: "projects",
    name: "projects",
    displayName: "Projects",
    description: "Notable projects and portfolio work",
    icon: "🚀",
    endpoint: "/projects",
    color: "#7C3AED",
  },
  {
    id: "certificates",
    name: "certificates",
    displayName: "Certificates",
    description: "Professional certifications and credentials",
    icon: "🏆",
    endpoint: "/certificates",
    color: "#EA580C",
  },
  {
    id: "languages",
    name: "languages",
    displayName: "Languages",
    description: "Language proficiencies",
    icon: "🌐",
    endpoint: "/languages",
    color: "#0891B2",
  },
  {
    id: "awards",
    name: "awards",
    displayName: "Awards",
    description: "Recognition and awards",
    icon: "🏅",
    endpoint: "/awards",
    color: "#CA8A04",
  },
  {
    id: "references",
    name: "references",
    displayName: "References",
    description: "Professional references",
    icon: "👥",
    endpoint: "/references",
    color: "#BE123C",
  },
  {
    id: "social-links",
    name: "social-links",
    displayName: "Social Links",
    description: "Social media and online presence",
    icon: "🔗",
    endpoint: "/social-links",
    color: "#4338CA",
  },
];
