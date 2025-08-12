import { Outlet } from "react-router-dom";
import { LayoutContainer, FooterContainer } from "@asafarim/shared-ui-react";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "@asafarim/react-themes";

export default function App() {
  return (
    <ThemeProvider
      defaultMode="dark"
      storageKey="asafarim-theme-v1"
      persistMode={true}
    >
      <LayoutContainer>
        <Navbar />
        <main className="container flex-1 overflow-x-hidden" >
          <Outlet />
        </main>
        <FooterContainer />
      </LayoutContainer>
    </ThemeProvider>
  );
}
