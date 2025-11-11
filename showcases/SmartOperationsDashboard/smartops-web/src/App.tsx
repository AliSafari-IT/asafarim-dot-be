import { Outlet } from "react-router-dom";
import {
  FooterContainer,
  LayoutContainer,
  NotificationContainer,
  NotificationProvider,
} from "@asafarim/shared-ui-react";
import { ToastProvider, Toaster } from "@asafarim/toast";
import Navbar from "./components/Navbar";
import { PrelaunchNoticeBanner } from "@asafarim/shared-ui-react";

export default function App() {
  return (
    <NotificationProvider>
      <ToastProvider>
        <Toaster />
        <NotificationContainer position="top-right" />
        <PrelaunchNoticeBanner />
        <LayoutContainer
          footer={<FooterContainer key={"smartops-main-footer"} />}
          header={<Navbar key={"smartops-main-header"} />}
          title="SmartOps"
        >
          <Outlet />
        </LayoutContainer>
      </ToastProvider>
    </NotificationProvider>
  );
}
