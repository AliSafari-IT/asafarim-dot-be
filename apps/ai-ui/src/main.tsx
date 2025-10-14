import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { initI18n } from "@asafarim/shared-i18n";
import App from "./App";
import "./index.css";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";
import JobTools from "./pages/JobTools";
import ResumeMaker from "./pages/ResumeMaker";
import { NotFound, NotificationProvider } from "@asafarim/shared-ui-react";
import Root from "./theme/Root";

// Initialize i18n before rendering
initI18n();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "chat", element: <ChatPage /> },
      { path: "ai-ui-job-tools", element: <JobTools /> },
      { path: "resume-maker", element: <ResumeMaker /> },
      { path: "*", element: <NotFound /> },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </Root>
  </React.StrictMode>
);
