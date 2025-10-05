import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { NotificationProvider, NotFound } from "@asafarim/shared-ui-react";
import WhatIsBuilding from "./pages/WhatIsBuilding";
import Portfolio from "./pages/Portfolio";
import Resume from "./pages/portfolio/resume/Resume";
import Publications from "./pages/portfolio/publications/Publications";
import Research from "./pages/portfolio/Research";
import Projects from "./pages/Projects";
import NewPublication from "./pages/portfolio/publications/new";
import ManagePublications from "./pages/portfolio/publications/manage";
import EditPublication from "./pages/portfolio/publications/edit";
import ViewPublication from "./pages/portfolio/publications/view";
import ResumeForm from './pages/admin/resume/ResumeForm';
import {
  EntityManagement,
} from "./pages/admin";
import { ResumeList, ViewResume } from "./pages/admin/resume";

// Resume section components
import ResumeSectionManagement from "./pages/admin/resume/ResumeSectionManagement";

// Skills components
import SkillsManagement from "./pages/admin/resume/SkillsManagement";
import SkillForm from "./pages/admin/resume/SkillForm";

// Education components
import EducationsManagement from "./pages/admin/resume/EducationsManagement";
import EducationForm from "./pages/admin/resume/EducationForm";

// Certificate components
import CertificatesManagement from "./pages/admin/resume/CertificatesManagement";
import CertificateForm from "./pages/admin/resume/CertificateForm";

// Project components
import ProjectsManagement from "./pages/admin/resume/ProjectsManagement";
import ProjectForm from "./pages/admin/resume/ProjectForm";

// Language components
import LanguagesManagement from "./pages/admin/resume/LanguagesManagement";
import LanguageForm from "./pages/admin/resume/LanguageForm";

// Award components
import AwardsManagement from "./pages/admin/resume/AwardsManagement";
import AwardForm from "./pages/admin/resume/AwardForm";

// Reference components
import ReferencesManagement from "./pages/admin/resume/ReferencesManagement";
import ReferenceForm from "./pages/admin/resume/ReferenceForm";
import ExperienceForm from "./pages/admin/resume/ExperienceForm";
import ExperiencesManagement from "./pages/admin/resume/ExperiencesManagement";
import SocialLinksManagement from "./pages/admin/resume/SocialLinksManagement";
import SocialLinkForm from "./pages/admin/resume/SocialLinkForm";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "what-is-building", element: <WhatIsBuilding /> },
      { path: "portfolio", element: <Portfolio /> },
      { path: "projects", element: <Projects /> },
      { path: "portfolio/resume", element: <Resume /> },
      { path: "portfolio/publications", element: <Publications /> },
      { path: "portfolio/publications/new", element: <NewPublication /> },
      {
        path: "portfolio/publications/manage",
        element: <ManagePublications />,
      },
      { path: "portfolio/publications/edit/:id", element: <EditPublication /> },
      { path: "portfolio/publications/view/:id", element: <ViewPublication /> },
      { path: "portfolio/research", element: <Research /> },

      // Admin routes
      { path: "/admin/entities", element: <EntityManagement /> },

      // http://web.asafarim.local:5175/admin/resumes
      { path: "/admin/entities/resumes", element: <ResumeList /> },
      { path: "/admin/entities/resumes/new", element: <ResumeForm /> },
      { path: "/admin/entities/resumes/:id/resume", element: <ViewResume /> },

      // Resume section hub - manages sections like work experience, skills, etc.
      {
        path: "/admin/entities/resumes/:id/edit",
        element: <ResumeSectionManagement />,
      },

      // Edit basic resume details (title, summary, contact)
      { path: "/admin/entities/resumes/:id/details", element: <ResumeForm /> },
      {
        path: "admin/entities/resumes/:resumeId/work-experiences",
        element: <ExperiencesManagement />,
      },
      {
        path: "admin/entities/resumes/:resumeId/skills",
        element: <SkillsManagement />,
      },
      {
        path: "admin/entities/resumes/:resumeId/educations",
        element: <EducationsManagement />,
      },
      {
        path: "admin/entities/resumes/:resumeId/certificates",
        element: <CertificatesManagement />,
      },
      {
        path: "admin/entities/resumes/:resumeId/projects",
        element: <ProjectsManagement />,
      },
      {
        path: "admin/entities/resumes/:resumeId/languages",
        element: <LanguagesManagement />,
      },
      {
        path: "admin/entities/resumes/:resumeId/awards",
        element: <AwardsManagement />,
      },
      {
        path: "admin/entities/resumes/:resumeId/references",
        element: <ReferencesManagement />,
      },

      {
        path: "/admin/resume-sections/:resumeId",
        element: <ResumeSectionManagement />,
      },

      // Work Experience routes
      {
        path: "/admin/entities/resumes/:resumeId/work-experiences",
        element: <ExperiencesManagement />,
      },
      {
        // Add mode
        path: "/admin/entities/resumes/:resumeId/work-experiences/new",
        element: <ExperienceForm />,
      },
      {
        // View mode
        path: "/admin/entities/resumes/:resumeId/work-experiences/:id",
        element: <ExperienceForm />,
      },
      {
        // Edit mode
        path: "/admin/entities/resumes/:resumeId/work-experiences/:id/:mode",
        element: <ExperienceForm />,
      },

      // Skills routes
      {
        path: "/admin/entities/resumes/:resumeId/skills",
        element: <SkillsManagement />,
      },
      { path: "/admin/entities/resumes/:resumeId/skills/new", element: <SkillForm /> },
      { path: "/admin/entities/resumes/:resumeId/skills/:id", element: <SkillForm /> },
      {
        path: "/admin/entities/resumes/:resumeId/skills/:id/edit",
        element: <SkillForm />,
      },

      // 🎓 Education routes
      {
        path: "/admin/entities/resumes/:resumeId/educations",
        element: <EducationsManagement />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/educations/new",
        element: <EducationForm />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/educations/:id",
        element: <EducationForm />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/educations/:id/edit",
        element: <EducationForm />,
      },

      // 📜 Certificates routes
      {
        path: "/admin/entities/resumes/:resumeId/certificates",
        element: <CertificatesManagement />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/certificates/new",
        element: <CertificateForm />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/certificates/:id",
        element: <CertificateForm />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/certificates/:id/edit",
        element: <CertificateForm />,
      },

      // 🚀 Projects routes
      {
        path: "/admin/entities/resumes/:resumeId/projects",
        element: <ProjectsManagement />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/projects/new",
        element: <ProjectForm />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/projects/:id",
        element: <ProjectForm />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/projects/:id/edit",
        element: <ProjectForm />,
      },

      // 🌐 Languages routes
      {
        path: "/admin/entities/resumes/:resumeId/languages",
        element: <LanguagesManagement />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/languages/new",
        element: <LanguageForm />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/languages/:id",
        element: <LanguageForm />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/languages/:id/edit",
        element: <LanguageForm />,
      },

      // 🏆 Awards routes
      {
        path: "/admin/entities/resumes/:resumeId/awards",
        element: <AwardsManagement />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/awards/new",
        element: <AwardForm />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/awards/:id",
        element: <AwardForm />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/awards/:id/edit",
        element: <AwardForm />,
      },

      // 🔗 Social Links routes
      {
        path: "/admin/entities/resumes/:resumeId/social-links",
        element: <SocialLinksManagement />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/social-links/new",
        element: <SocialLinkForm />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/social-links/:id",
        element: <SocialLinkForm />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/social-links/:id/edit",
        element: <SocialLinkForm />,
      },

      // 👥 References routes
      {
        path: "/admin/entities/resumes/:resumeId/references",
        element: <ReferencesManagement />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/references/new",
        element: <ReferenceForm />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/references/:id",
        element: <ReferenceForm />,
      },
      {
        path: "/admin/entities/resumes/:resumeId/references/:id/edit",
        element: <ReferenceForm />,
      },

      // dynamic routes
      {
        path: "portfolio/:userId/publications/view/:id",
        element: <ViewPublication />,
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  </React.StrictMode>
);
