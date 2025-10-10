import { Outlet } from "react-router-dom";
import { 
  LayoutContainer, 
  FooterContainer, 
  NotificationContainer 
} from "@asafarim/shared-ui-react";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <>
      <NotificationContainer position="top-right" />
      <LayoutContainer
        footer={<FooterContainer key={"main footer"} />}
        header={<Navbar key={"main header"} />}
        title="AI Tools"
      >
        <Outlet />
      </LayoutContainer>
    </>
  );
}


