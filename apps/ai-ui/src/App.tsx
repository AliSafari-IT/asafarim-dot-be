import { Routes, Route } from "react-router-dom";
import { 
  NotFound,
  NotificationContainer,
  NotificationProvider
} from "@asafarim/shared-ui-react";
import Navbar from "./components/Navbar";
import { ToastProvider, Toaster } from "@asafarim/toast";
import ChatPage from "./pages/ChatPage";
import Home from "./pages/Home";
import JobTools from "./pages/JobTools";
import ResumeMaker from "./pages/ResumeMaker";
import { PrelaunchNoticeBanner } from "@asafarim/shared-ui-react";

export default function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <NotificationContainer />
        <Toaster />
        <Navbar />
        <PrelaunchNoticeBanner />
        <Routes>
          <Route index element={<Home />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="ai-ui-job-tools" element={<JobTools />} />
          <Route path="resume-maker" element={<ResumeMaker />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </NotificationProvider>
    </ToastProvider>
  );
}
