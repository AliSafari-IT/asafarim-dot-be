import { Outlet } from "react-router-dom";
import {
  FooterContainer,
  ThemeProvider,
  LayoutContainer,
  NotificationContainer,
  NotificationProvider,
} from "@asafarim/shared-ui-react";
import { ToastProvider, Toaster } from "@asafarim/toast";
import Navbar from "./components/Navbar";
import Root from "./theme/Root";

export default function App() {
  return (
    <ThemeProvider defaultMode="dark">
      <NotificationProvider>
        <ToastProvider>
          <Toaster />
          <Root>
            <NotificationContainer position="top-right" />
            <LayoutContainer
              footer={<FooterContainer key={"main footer"} />}
              header={<Navbar key={"main header"} />}
              title="Web Portal"
            >
              <Outlet />
            </LayoutContainer>
          </Root>
        </ToastProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
