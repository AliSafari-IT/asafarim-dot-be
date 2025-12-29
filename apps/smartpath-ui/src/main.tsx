import "@asafarim/design-tokens/css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import Root from "./theme/Root";
import {
  NotificationContainer,
  NotificationProvider,
} from "@asafarim/shared-ui-react";
import { ThemeProvider } from "@asafarim/react-themes";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root>
      <ThemeProvider defaultMode="auto" persistMode={true}>

        <NotificationProvider>
          <NotificationContainer position="top-right" />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </NotificationProvider>
      </ThemeProvider>
    </Root>
  </React.StrictMode>
);
