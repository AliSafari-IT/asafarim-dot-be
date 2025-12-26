import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import Root from "./theme/Root";
import { ThemeProvider } from "@asafarim/shared-ui-react";
import { initI18n } from "@asafarim/shared-i18n";
import { ToastProvider, Toaster } from "@asafarim/toast";
import "@asafarim/toast/styles.css";

// Initialize i18n before rendering
initI18n();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <Root>
          <ToastProvider>
            <Toaster key="top-right" />
            <App />
          </ToastProvider>
        </Root>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
