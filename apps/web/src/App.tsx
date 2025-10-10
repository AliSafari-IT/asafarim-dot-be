import { Outlet } from "react-router-dom";
import {
  FooterContainer,
  LayoutContainer,
  NotificationContainer,
  NotificationProvider,
} from "@asafarim/shared-ui-react";
import { ToastProvider, Toaster } from "@asafarim/toast";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <NotificationProvider>
      <ToastProvider>
        <Toaster />
        <NotificationContainer position="top-right" />
        <LayoutContainer
          footer={<FooterContainer key={"web-main-footer"} />}
          header={<Navbar key={"web-main-header"} />}
          title="Web Portal"
        >
          <Outlet />
        </LayoutContainer>
      </ToastProvider>
    </NotificationProvider>
  );
}
