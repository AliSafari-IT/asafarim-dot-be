import type { VariantConfig } from "./VariantItemsDisplay";

// contentType: projects or publications
export const contentType = window.location.pathname.includes("projects") ? "projects" : "publications";

export const PUBLICATION_VARIANTS: VariantConfig[] = [
    {
        id: "publication",
        title: "Journal Publications",
        description: "Published in peer-reviewed journals",
    },
    {
        id: "project",
        title: "Conference Presentations",
        description: "Presented at conferences and symposiums",
    },
    {
        id: "article",
        title: "Articles",
        description: "Technical articles and blog posts",
    },
    {
        id: "report",
        title: "Reports",
        description: "Technical reports and white papers",
    },
    {
        id: "certificate",
        title: "Certificates",
        description: "Certificates of attendance and other certificates",
    },
    {
        id: "default",
        title: "Other Publications",
        description: "Miscellaneous publications and documents",
    },
];

export const PROJECT_VARIANTS: VariantConfig[] = [
    {
        id: "featured",
        title: "Featured Projects",
        description: "My most important and successful projects",
    },
    {
        id: "opensource",
        title: "Open Source",
        description: "Projects published on GitHub and NPM",
    },
    {
        id: "commercial",
        title: "Commercial Projects",
        description: "Professional applications built for clients",
    },
    {
        id: "research",
        title: "Research Projects",
        description: "Experimental and research-oriented projects",
    },
    {
        id: "tools",
        title: "Tools & Libraries",
        description: "Reusable components and developer tools",
    },
];

export const BASE_PORTFOLIO_PATH = "/portfolio";
export const BASE_PORTFOLIO_DOC_PATH = contentType === "projects" ? "/portfolio/projects" : "/portfolio/publications";
export const defaultContentType = contentType === "projects" ? "opensource" : "publication";
export const DOCUMENT_VARIANTS = contentType === "projects" ? PROJECT_VARIANTS : PUBLICATION_VARIANTS;
