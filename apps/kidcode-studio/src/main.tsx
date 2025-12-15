import "@asafarim/design-tokens/css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@asafarim/react-themes";
import Root from "./theme/Root";
import {
  NotificationContainer,
  NotificationProvider,
} from "@asafarim/shared-ui-react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root>
      <NotificationProvider>
        <NotificationContainer position="top-right" />
        <ThemeProvider defaultMode="auto" persistMode={true}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </NotificationProvider>
    </Root>
  </React.StrictMode>
);
