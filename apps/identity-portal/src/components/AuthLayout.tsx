import { FooterContainer, HeaderContainer } from "@asafarim/shared-ui-react";
import { type ReactNode } from "react";
import "./auth-layout.css";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {

  return (
    <div className="auth-container">     
      <div className="auth-card">
        <HeaderContainer>
          <div className="auth-card-header">
            <h1 className="auth-title">{title}</h1>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          </div>
        </HeaderContainer>

        <div className="auth-card-content">{children}</div>
      </div>

      <FooterContainer />
    </div>
  );
};

export default AuthLayout;
