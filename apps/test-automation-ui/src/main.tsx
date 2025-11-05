import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import Root from "./theme/Root";
import { ThemeProvider } from "@asafarim/shared-ui-react";
import "./index.css";

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
