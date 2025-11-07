import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import Root from "./theme/Root";
import { ThemeProvider } from "@asafarim/shared-ui-react";
import "./index.css";
import { initI18n } from "@asafarim/shared-i18n";

// Initialize i18n before rendering
initI18n();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <Root>
          <App />
        </Root>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
