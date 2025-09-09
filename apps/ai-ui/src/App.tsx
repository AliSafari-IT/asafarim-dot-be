import { Outlet } from "react-router-dom";
import { LayoutContainer, FooterContainer, ThemeProvider } from "@asafarim/shared-ui-react";
import Navbar from "./components/Navbar";
import Root from "./theme/Root";

export default function App() {

  return (
    <ThemeProvider
      defaultMode="dark"
      storageKey="asafarim-theme"
      persistMode={true}
    >
      <Root>
        <LayoutContainer
          footer={<FooterContainer key={"main footer"} />}
          header={<Navbar key={"main header"} />}
          title="Generate Resume"
        >
          <Outlet />
        </LayoutContainer>
      </Root>
    </ThemeProvider>
  );
}


