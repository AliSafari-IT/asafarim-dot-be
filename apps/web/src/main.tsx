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
import ManageWorkExperience from "./pages/portfolio/work-experiences/ManageWorkExperience";
import {NewWorkExperience} from "./pages/portfolio/work-experiences";
import {EditWorkExperience} from "./pages/portfolio/work-experiences";
import {ViewWorkExperience} from "./pages/portfolio/work-experiences";
import {EntityManagement, EntityTableView, AddNewEntity, EditEntity, ViewEntity} from "./pages/admin";
import {ResumeList, ViewResume, EditResume, NewResume} from "./pages/admin/resume";

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
      { path: "portfolio/publications/manage", element: <ManagePublications /> },
      { path: "portfolio/publications/edit/:id", element: <EditPublication /> },
       { path: "portfolio/publications/view/:id", element: <ViewPublication /> },
      { path: "portfolio/research", element: <Research /> },
      { path: "portfolio/work-experiences", element: <ManageWorkExperience /> },
      { path: "portfolio/work-experiences/new", element: <NewWorkExperience /> },
      { path: "portfolio/work-experiences/edit/:id", element: <EditWorkExperience /> },
      { path: "portfolio/work-experiences/view/:id", element: <ViewWorkExperience /> },

      // Admin routes
      { path: "admin/entities", element: <EntityManagement /> },
      { path: "admin/entities/:entityType", element: <EntityTableView /> },
      { path: "admin/entities/:entityType/new", element: <AddNewEntity /> },
      { path: "admin/entities/:entityType/:id/edit", element: <EditEntity /> },
      { path: "admin/entities/:entityType/:id", element: <ViewEntity /> },
      
      // Resume-specific routes
      { path: "admin/resume", element: <ResumeList /> },
      { path: "admin/resume/new", element: <NewResume /> },
      { path: "admin/resume/:id", element: <ViewResume /> },
      { path: "admin/resume/:id/edit", element: <EditResume /> },

      // dynamic routes
      { path: "portfolio/:userId/publications/view/:id", element: <ViewPublication /> },
      { path: "portfolio/:userId/work-experiences/view/:id", element: <ViewWorkExperience /> },
      
      { path: "*", element: <NotFound /> },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  </React.StrictMode>
);
