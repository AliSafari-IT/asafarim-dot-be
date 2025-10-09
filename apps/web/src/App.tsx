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
    <ThemeProvider>
      <NotificationProvider>
        <ToastProvider>
          <Toaster />
            <NotificationContainer position="top-right" />
          <Root>
            <LayoutContainer
              footer={<FooterContainer key={"web-main-footer"} />}
              header={<Navbar key={"web-main-header"} />}
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
