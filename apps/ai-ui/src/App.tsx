import { Outlet } from "react-router-dom";
import { 
  LayoutContainer, 
  FooterContainer, 
  ThemeProvider, 
  NotificationContainer 
} from "@asafarim/shared-ui-react";
import Navbar from "./components/Navbar";
import Root from "./theme/Root";

export default function App() {
  return (
    <ThemeProvider>
      <Root>
        <NotificationContainer position="top-right" />
        <LayoutContainer
          footer={<FooterContainer key={"main footer"} />}
          header={<Navbar key={"main header"} />}
          title="AI Tools"
        >
          <Outlet />
        </LayoutContainer>
      </Root>
    </ThemeProvider>
  );
}


