import { FooterContainer } from "@asafarim/shared-ui-react";
import { type ReactNode } from "react";
import "./auth-layout.css";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {

  return (
    <div className="auth-container">     
      {children}

      <FooterContainer />
    </div>
  );
};

export default AuthLayout;
