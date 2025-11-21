import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { initI18n } from "@asafarim/shared-i18n";
import App from "./App";
import "./index.css";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Showcases from "./pages/Showcases";
import { NotFound } from "@asafarim/shared-ui-react";
import Root from "./theme/Root";
import { ProtectedRoute } from "./components/ProtectedRoute";

import WhatIsBuilding from "./pages/WhatIsBuilding";
import Portfolio from "./pages/Portfolio";
import Resume from "./pages/portfolio/resume/Resume";
import PublicResumeView from "./pages/portfolio/resume/PublicResumeView";
import Research from "./pages/portfolio/Research";
import Documents from "./pages/portfolio/publications/Documents";
import NewDocument from "./pages/portfolio/publications/new";
import ManageDocuments from "./pages/portfolio/publications/manage";
import EditDocument from "./pages/portfolio/publications/edit";
import ViewDocument from "./pages/portfolio/publications/view";
import ResumeForm from "./pages/admin/resume/ResumeForm";
import { EntityManagement } from "./pages/admin";
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

// Initialize i18n before rendering
initI18n();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "showcases", element: <Showcases /> },
      { path: "what-is-building", element: <WhatIsBuilding /> },
      { path: "portfolio", element: <Portfolio /> },

      { path: "portfolio/:contentType", element: <Documents /> },
      {
        path: "portfolio/:contentType/manage",
        element: <ManageDocuments />,
      },
      { path: "portfolio/:contentType/new", element: <NewDocument /> },
      { path: "portfolio/:contentType/edit/:id", element: <EditDocument /> },
      { path: "portfolio/:contentType/view/:id", element: <ViewDocument /> },

      { path: "portfolio/resume", element: <Resume /> },
      
      { path: "portfolio/:publicSlug/public", element: <PublicResumeView /> },

      { path: "portfolio/research", element: <Research /> },

      // Admin routes (protected)
      { path: "/admin/entities", element: <ProtectedRoute><EntityManagement /></ProtectedRoute> },

      // http://web.asafarim.local:5175/admin/resumes
      { path: "/admin/entities/resumes", element: <ProtectedRoute><ResumeList /></ProtectedRoute> },
      { path: "/admin/entities/resumes/new", element: <ProtectedRoute><ResumeForm /></ProtectedRoute> },
      { path: "/admin/entities/resumes/:id/resume", element: <ProtectedRoute><ViewResume /></ProtectedRoute> },

      // Resume section hub - manages sections like work experience, skills, etc.
      {
        path: "/admin/entities/resumes/:id/edit",
        element: <ProtectedRoute><ResumeSectionManagement /></ProtectedRoute>,
      },

      // Edit basic resume details (title, summary, contact)
      { path: "/admin/entities/resumes/:id/details", element: <ProtectedRoute><ResumeForm /></ProtectedRoute> },
      {
        path: "admin/entities/resumes/:resumeId/work-experiences",
        element: <ProtectedRoute><ExperiencesManagement /></ProtectedRoute>,
      },
      {
        path: "admin/entities/resumes/:resumeId/skills",
        element: <ProtectedRoute><SkillsManagement /></ProtectedRoute>,
      },
      {
        path: "admin/entities/resumes/:resumeId/educations",
        element: <ProtectedRoute><EducationsManagement /></ProtectedRoute>,
      },
      {
        path: "admin/entities/resumes/:resumeId/certificates",
        element: <ProtectedRoute><CertificatesManagement /></ProtectedRoute>,
      },
      {
        path: "admin/entities/resumes/:resumeId/projects",
        element: <ProtectedRoute><ProjectsManagement /></ProtectedRoute>,
      },
      {
        path: "admin/entities/resumes/:resumeId/languages",
        element: <ProtectedRoute><LanguagesManagement /></ProtectedRoute>,
      },
      {
        path: "admin/entities/resumes/:resumeId/awards",
        element: <ProtectedRoute><AwardsManagement /></ProtectedRoute>,
      },
      {
        path: "admin/entities/resumes/:resumeId/references",
        element: <ProtectedRoute><ReferencesManagement /></ProtectedRoute>,
      },

      {
        path: "/admin/resume-sections/:resumeId",
        element: <ProtectedRoute><ResumeSectionManagement /></ProtectedRoute>,
      },

      // Work Experience routes
      {
        path: "/admin/entities/resumes/:resumeId/work-experiences",
        element: <ProtectedRoute><ExperiencesManagement /></ProtectedRoute>,
      },
      {
        // Add mode
        path: "/admin/entities/resumes/:resumeId/work-experiences/new",
        element: <ProtectedRoute><ExperienceForm /></ProtectedRoute>,
      },
      {
        // View mode
        path: "/admin/entities/resumes/:resumeId/work-experiences/:id",
        element: <ProtectedRoute><ExperienceForm /></ProtectedRoute>,
      },
      {
        // Edit mode
        path: "/admin/entities/resumes/:resumeId/work-experiences/:id/:mode",
        element: <ProtectedRoute><ExperienceForm /></ProtectedRoute>,
      },

      // Skills routes
      {
        path: "/admin/entities/resumes/:resumeId/skills",
        element: <ProtectedRoute><SkillsManagement /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/skills/new",
        element: <ProtectedRoute><SkillForm /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/skills/:id",
        element: <ProtectedRoute><SkillForm /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/skills/:id/edit",
        element: <ProtectedRoute><SkillForm /></ProtectedRoute>,
      },

      // 🎓 Education routes
      {
        path: "/admin/entities/resumes/:resumeId/educations",
        element: <ProtectedRoute><EducationsManagement /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/educations/new",
        element: <ProtectedRoute><EducationForm /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/educations/:id",
        element: <ProtectedRoute><EducationForm /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/educations/:id/edit",
        element: <ProtectedRoute><EducationForm /></ProtectedRoute>,
      },

      // 📜 Certificates routes
      {
        path: "/admin/entities/resumes/:resumeId/certificates",
        element: <ProtectedRoute><CertificatesManagement /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/certificates/new",
        element: <ProtectedRoute><CertificateForm /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/certificates/:id",
        element: <ProtectedRoute><CertificateForm /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/certificates/:id/edit",
        element: <ProtectedRoute><CertificateForm /></ProtectedRoute>,
      },

      // 🚀 Projects routes
      {
        path: "/admin/entities/resumes/:resumeId/projects",
        element: <ProtectedRoute><ProjectsManagement /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/projects/new",
        element: <ProtectedRoute><ProjectForm /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/projects/:id",
        element: <ProtectedRoute><ProjectForm /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/projects/:id/edit",
        element: <ProtectedRoute><ProjectForm /></ProtectedRoute>,
      },

      // 🌐 Languages routes
      {
        path: "/admin/entities/resumes/:resumeId/languages",
        element: <ProtectedRoute><LanguagesManagement /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/languages/new",
        element: <ProtectedRoute><LanguageForm /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/languages/:id",
        element: <ProtectedRoute><LanguageForm /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/languages/:id/edit",
        element: <ProtectedRoute><LanguageForm /></ProtectedRoute>,
      },

      // 🏆 Awards routes
      {
        path: "/admin/entities/resumes/:resumeId/awards",
        element: <ProtectedRoute><AwardsManagement /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/awards/new",
        element: <ProtectedRoute><AwardForm /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/awards/:id",
        element: <ProtectedRoute><AwardForm /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/awards/:id/edit",
        element: <ProtectedRoute><AwardForm /></ProtectedRoute>,
      },

      // 🔗 Social Links routes
      {
        path: "/admin/entities/resumes/:resumeId/social-links",
        element: <ProtectedRoute><SocialLinksManagement /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/social-links/new",
        element: <ProtectedRoute><SocialLinkForm /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/social-links/:id",
        element: <ProtectedRoute><SocialLinkForm /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/social-links/:id/edit",
        element: <ProtectedRoute><SocialLinkForm /></ProtectedRoute>,
      },

      // 👥 References routes
      {
        path: "/admin/entities/resumes/:resumeId/references",
        element: <ProtectedRoute><ReferencesManagement /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/references/new",
        element: <ProtectedRoute><ReferenceForm /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/references/:id",
        element: <ProtectedRoute><ReferenceForm /></ProtectedRoute>,
      },
      {
        path: "/admin/entities/resumes/:resumeId/references/:id/edit",
        element: <ProtectedRoute><ReferenceForm /></ProtectedRoute>,
      },

      // dynamic routes
      { path: "*", element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root>
      <RouterProvider router={router} />
    </Root>
  </StrictMode>
);
