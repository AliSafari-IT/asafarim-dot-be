import type { PropsWithChildren } from 'react';
import './footer.css';

const socialLinks = [
  { 
    name: 'GitHub', 
    url: 'https://github.com/AliSafari-IT',
    icon: 'github'
  },
  { 
    name: 'Twitter', 
    url: 'https://twitter.com/ASafariM',
    icon: 'twitter'
  },
  { 
    name: 'LinkedIn', 
    url: 'https://linkedin.com/in/ali-safari',
    icon: 'linkedin'
  },
  { 
    name: 'Email', 
    url: 'mailto:contact@asafarim.be',
    icon: 'mail'
  },
];

const footerLinks = [
  {
    title: 'Navigation',
    items: [
      { label: 'Home', to: '/' },
      { label: 'About', to: '/about' },
      { label: 'Blog', to: 'http://blog.asafarim.local:3000/' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Cookie Policy', to: '/cookies' },
    ],
  },
  {
    title: 'Connect',
    items: [
      { label: 'GitHub', to: 'https://github.com/AliSafari-IT' },
      { label: 'Twitter', to: 'https://twitter.com/ASafariM' },
      { label: 'LinkedIn', to: 'https://linkedin.com/in/ali-safari' },
    ],
  },
];

export default function FooterContainer({ children }: PropsWithChildren) {
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
                        target={item.to.startsWith('http') ? '_blank' : '_self'}
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
                  <i className={`icon-${link.icon}`} aria-hidden="true" />
                  <span className="sr-only">{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}