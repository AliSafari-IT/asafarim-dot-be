import type { PropsWithChildren } from "react";
import "./footer.css";
import { Github, Twitter, Linkedin, StackOverflow } from "../../svg-icons";
import { isPrelaunch, isProduction } from "../../configs";
import { PrelaunchNotice } from "../PrelaunchNotice/PrelaunchNotice";

const socialLinks = [
  {
    name: "GitHub",
    url: "https://github.com/AliSafari-IT",
    icon: <Github stroke="currentColor" />,
  },
  {
    name: "Twitter",
    url: "https://twitter.com/ASafariM",
    icon: <Twitter stroke="currentColor" />,
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/ali-safari",
    icon: <Linkedin stroke="currentColor" />,
  },
  {
    name: "StackOverflow",
    url: "https://stackoverflow.com/users/10703628/ali-safari",
    icon: <StackOverflow stroke="currentColor" />,
  },
];

const footerLinks = [
  {
    title: "Navigation",
    items: [
      { label: "Home", to: "/" },
      {
        label: "About",
        to: isProduction
          ? "https://asafarim.be/about"
          : "http://web.asafarim.local:5175/about",
      },
      {
        label: "Blog",
        to: isProduction
          ? "https://blog.asafarim.be"
          : "http://blog.asafarim.local:3000/",
      },
      {
        label: "Contact",
        to: isProduction
          ? "https://asafarim.be/contact"
          : "http://web.asafarim.local:5175/contact",
      },
    ],
  },
  {
    title: "Legal",
    items: [
      {
        label: "Privacy Policy",
        to: isProduction
          ? "https://blog.asafarim.be/docs/LegalDocs/privacy-policy"
          : "http://blog.asafarim.local:3000/docs/LegalDocs/privacy-policy",
      },
      {
        label: "Terms of Service",
        to: isProduction
          ? "https://blog.asafarim.be/docs/LegalDocs/terms-of-service"
          : "http://blog.asafarim.local:3000/docs/LegalDocs/terms-of-service",
      },
      {
        label: "Cookie Policy",
        to: isProduction
          ? "https://blog.asafarim.be/docs/LegalDocs/cookie-policy"
          : "http://blog.asafarim.local:3000/docs/LegalDocs/cookie-policy",
      },
      {
        label: "Disclaimer",
        to: isProduction
          ? "https://blog.asafarim.be/docs/LegalDocs/legal-disclaimer"
          : "http://blog.asafarim.local:3000/docs/LegalDocs/legal-disclaimer",
      },
    ],
  },
  {
    title: "Connect",
    items: [
      { label: "GitHub", to: "https://github.com/AliSafari-IT" },
      { label: "Twitter", to: "https://twitter.com/ASafariM" },
      { label: "LinkedIn", to: "https://linkedin.com/in/ali-safari" },
      {
        label: "StackOverflow",
        to: "https://stackoverflow.com/users/10703628/ali-safari",
      },
    ],
  },
];

export function FooterContainer({ children }: PropsWithChildren) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="theme-layout-footer footer">
      {children || (
        <div className="footer-container">
          <div className="footer-links">
            {footerLinks.map((section) => (
              <div key={section.title} className="footer-links-section">
                <h3 className="footer-links-title">{section.title}</h3>
                <ul className="footer-links-list">
                  {section.items.map((item) => (
                    <li key={item.label} className="footer-links-item">
                      <a
                        href={item.to}
                        className="footer-link"
                        target={item.to.startsWith("http") ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <div className="footer-copyright">
              © {currentYear} ASafariM. All rights reserved.
            </div>
            <div className="footer-social">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  className="footer-social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  title={link.name}
                >
                  {link.icon}
                  <span className="sr-only">{link.name}</span>
                </a>
              ))}
            </div>
          </div>
          {isPrelaunch && <PrelaunchNotice />}
        </div>
      )}
    </footer>
  );
}
