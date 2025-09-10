import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";
import JobTools from "./pages/JobTools";
import ResumeMaker from "./pages/ResumeMaker";
import { NotFound } from "@asafarim/shared-ui-react";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "chat", element: <ChatPage /> },
      { path: "job-tools", element: <JobTools /> },
      { path: "resume-maker", element: <ResumeMaker /> },
      { path: "*", element: <NotFound /> },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
