import "@asafarim/design-tokens/css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@asafarim/react-themes";
import Root from "./theme/Root";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root>
      <ThemeProvider defaultMode="auto" persistMode={true}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Root>
  </React.StrictMode>
);
