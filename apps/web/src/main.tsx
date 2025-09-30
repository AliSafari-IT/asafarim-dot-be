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
import Resume from "./pages/portfolio/Resume";
import Publications from "./pages/portfolio/publications/Publications";
import Research from "./pages/portfolio/Research";
import Projects from "./pages/Projects";
import NewPublication from "./pages/portfolio/publications/new";
import ManagePublications from "./pages/portfolio/publications/manage";
import EditPublication from "./pages/portfolio/publications/edit";
import ViewPublication from "./pages/portfolio/publications/view";
import ManageWorkExperience from "./pages/portfolio/work-experiences/ManageWorkExperience";

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
      { path: "portfolio/research", element: <Research /> },
      { path: "portfolio/work-experiences", element: <ManageWorkExperience /> },

      // dynamic routes
      { path: "portfolio/:userId/publications/view/:id", element: <ViewPublication /> },
      
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
