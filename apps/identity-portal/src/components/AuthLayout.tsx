import { FooterContainer } from "@asafarim/shared-ui-react";
import { type ReactNode } from "react";
import "./auth-layout.css";

interface AuthLayoutProps {
  children: ReactNode;
    title?: string;
}

export const AuthLayout = ({ children, title }: AuthLayoutProps) => {

  // page title
  document.title = title || "Identity Portal";

  return (
    <div
      className={`auth-container ${title ? "auth-container--with-title" : ""}`}
      data-testid="auth-layout"
    >
      {children}
      <FooterContainer />
    </div>
  );
};

export default AuthLayout;
