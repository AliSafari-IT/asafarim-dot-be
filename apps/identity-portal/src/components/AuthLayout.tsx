import { FooterContainer } from "@asafarim/shared-ui-react";
import { type ReactNode } from "react";
import "./auth-layout.css";

interface AuthLayoutProps {
  children: ReactNode;
  key?: string;
}

export const AuthLayout = ({ children, key }: AuthLayoutProps) => {

  return (
    <div className="auth-container" key={key}>     
      {children}

      <FooterContainer />
    </div>
  );
};

export default AuthLayout;
