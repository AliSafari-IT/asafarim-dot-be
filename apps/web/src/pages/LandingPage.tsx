import { useEffect, useState, type FormEvent } from "react";
import "./LandingPage.css";
import { Link } from "react-router-dom";
import {
  ButtonComponent,
  Github,
  Linkedin,
  Location,
  useAuth,
  useNotifications,
} from "@asafarim/shared-ui-react";
import { sendEmail } from "../api/emailService";
import { useTranslation } from "@asafarim/shared-i18n";

// Types
interface Project {
  id: string;
  name: string;
  description: string;
  tags: string[];
  achievements: string[];
  githubUrl: string;
  demoUrl?: string;
}

interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface CaseStudy {
  id: string;
  title: string;
  problem: string;
  solution: string;
  result: string;
  technologies: string;
}

// Data
const projects: Project[] = [
  {
    id: "asafarim-dot-be",
    name: "ASafariM Platform",
    description:
      "A comprehensive monorepo powering multiple web applications with shared design tokens, authentication, and microservices architecture. Built with React, .NET 8, and MySQL.",
    tags: [
      "React",
      ".NET 8",
      "PostgreSQL",
      "Microservices",
      "CICD",
      "Java Spring Boot",
      "Python",
    ],
    achievements: [
      "Unified 10+ apps with shared authentication and consistent UI across all platforms",
    ],
    githubUrl: "https://github.com/AliSafari-IT/asafarim-dot-be",
    demoUrl: "https://asafarim.be",
  },
  {
    id: "smartops",
    name: "Smart Operations Dashboard",
    description:
      "Real-time IoT dashboard for monitoring devices and operations with live data updates and role-based access control. Built with React, .NET 8, and SignalR.",
    tags: ["React", ".NET 8", "IoT", "Real-time", "SignalR"],
    achievements: [
      "Implemented real-time updates with SignalR serving 100+ concurrent connections",
    ],
    githubUrl:
      "https://github.com/AliSafari-IT/asafarim-dot-be/tree/main-dev/showcases/SmartOperationsDashboard",
    demoUrl: "https://smartops.asafarim.be",
  },
  {
    id: "testora",
    name: "Test Automation Platform",
    description:
      "Full E2E test automation suite with TestCafe generators, GitHub Actions integration, and real-time test reporting. Built with React, .NET 8, and Node.js.",
    tags: ["TestCafe", "Node.js", ".NET 8", "React", "PostgreSQL"],
    achievements: [
      "Reduced manual testing time by 80% with automated test generation",
    ],
    githubUrl:
      "https://github.com/AliSafari-IT/asafarim-dot-be/tree/main-dev/apps/test-automation-ui",
    demoUrl: "https://testora.asafarim.be",
  },
  {
    id: "studynotes",
    name: "Learn Java Notes",
    description:
      "Academic-style note editor with bibliography management, built with Java Spring Boot and React. Features rich text editing, citation management, and export capabilities.",
    tags: ["Java", "Spring Boot", "React", "PostgreSQL"],
    achievements: [
      "Implemented rich text editing with citation management and export features",
    ],
    githubUrl:
      "https://github.com/AliSafari-IT/asafarim-dot-be/tree/main-dev/learn/learn-java-notes",
    demoUrl: "https://studynotes.asafarim.be",
  },
  {
    id: "hydrology-lab",
    name: "Hydrology Python Lab",
    description:
      "Scientific modeling toolkit for hydrological analysis with visual outputs and data processing pipelines. Processes environmental data for research publications.",
    tags: ["Python", "Scientific", "Data Visualization", "NumPy"],
    achievements: [
      "Processed 10+ years of environmental data for research publications",
    ],
    githubUrl:
      "https://github.com/AliSafari-IT/asafarim-dot-be/tree/main-dev/learn/hydrology-python",
  },
];

const services: Service[] = [
  {
    id: "fullstack",
    icon: "🚀",
    title: "Full-Stack Web Development",
    description:
      "End-to-end web applications using React, TypeScript, .NET, and Node.js with modern best practices.",
  },
  {
    id: "api",
    icon: "🔗",
    title: "API & Microservices",
    description:
      "RESTful APIs, GraphQL endpoints, and microservices architecture with proper documentation.",
  },
  {
    id: "devops",
    icon: "⚙️",
    title: "DevOps & Automation",
    description:
      "CI/CD pipelines, Linux server management, systemd services, and deployment automation.",
  },
  {
    id: "testing",
    icon: "🧪",
    title: "Test Automation",
    description:
      "E2E testing with TestCafe, unit testing, and automated test generation for reliable deployments.",
  },
  {
    id: "dashboard",
    icon: "📊",
    title: "Dashboard Development",
    description:
      "Interactive data visualizations, real-time dashboards, and business intelligence tools.",
  },
  {
    id: "scientific",
    icon: "🔬",
    title: "Scientific Software",
    description:
      "Python-based tools for data analysis, modeling, and scientific computing applications.",
  },
  {
    id: "refactor",
    icon: "🛠️",
    title: "Code Cleanup & Refactoring",
    description:
      "Technical debt reduction, performance optimization, and codebase modernization.",
  },
];

const caseStudies: CaseStudy[] = [
  {
    id: "testora",
    title: "Test Automation Platform",
    problem:
      "Manual E2E testing was time-consuming and error-prone, causing delayed releases and missed bugs.",
    solution:
      "Built a platform that generates TestCafe tests from UI, integrates with GitHub Actions, and provides real-time reporting.",
    result:
      "80% reduction in manual testing time, faster release cycles, and improved test coverage.",
    technologies: "React, .NET 8, TestCafe, Node.js, PostgreSQL, SignalR",
  },
  {
    id: "smartops",
    title: "SmartOps Dashboard",
    problem:
      "Operations team needed real-time visibility into IoT devices with role-based access control.",
    solution:
      "Developed a real-time dashboard with SignalR for live updates, RBAC, and device management features.",
    result:
      "100+ concurrent users supported, instant device status updates, and improved operational efficiency.",
    technologies: "React, .NET 8, SignalR, PostgreSQL, JWT Authentication",
  },
  {
    id: "studynotes",
    title: "Learn Java Notes",
    problem:
      "Students needed a modern note-taking app with academic features like citations and bibliography management.",
    solution:
      "Created a rich text editor with bibliography support, tagging, and export capabilities using Spring Boot.",
    result:
      "Streamlined academic note-taking with proper citation management and multiple export formats.",
    technologies: "Java Spring Boot, React, MySQL, Rich Text Editor",
  },
];

const skills = [
  "React",
  "TypeScript",
  ".NET 8",
  "Node.js",
  "PostgreSQL",
  "Linux",
  "CI/CD",
  "TestCafe",
  "Python",
  "Java Spring Boot",
];

const ONLINE_CV = import.meta.env?.VITE_PORTFOLIO_URL;

interface Attachment {
  file: File;
  previewUrl?: string;
  type: "document" | "image";
}
interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
  attachments: Attachment[];
  links: string[];
  referenceNumber?: string; // Auto-generated for new conversations
  referingToConversation?: string; // Reference to another conversation
}

interface FormStatus {
  submitting: boolean;
  submitted: boolean;
  error: string | null;
  success: boolean;
}

export default function LandingPage() {
  const { user, token } = useAuth();
  const { addNotification } = useNotifications();
  const { t } = useTranslation("web");

  const [status, setStatus] = useState<FormStatus>({
    submitting: false,
    submitted: false,
    error: null,
    success: false,
  });

  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    subject: "Website Contact",
    message: "",
    attachments: [],
    links: [],
  });

  // Pre-fill form with user data if authenticated
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user?.name || user?.userName || prev.name,
        email: user?.email || prev.email,
      }));
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({
      submitting: true,
      submitted: false,
      error: null,
      success: false,
    });

    try {
      const emailResponse = await sendEmail(
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          attachments: formData.attachments,
          links: formData.links,
          referenceNumber: formData.referenceNumber,
          referingToConversation: formData.referingToConversation,
        },
        token
      );

      if (emailResponse.success) {
        // Show success notification
        addNotification("success", t("landing.contact.form.success"));

        setStatus({
          submitting: false,
          submitted: true,
          error: null,
          success: true,
        });

        // Reset form after successful submission
        setFormData({
          name: user?.name || user?.userName || "",
          email: user?.email || "",
          subject: "Website Contact",
          message: "",
          attachments: [],
          links: [],
        });
      } else {
        throw new Error(emailResponse.message || "Failed to send message");
      }
    } catch (error) {
      // Show error notification
      addNotification(
        "error",
        error instanceof Error ? error.message : "An unexpected error occurred"
      );

      setStatus({
        submitting: false,
        submitted: true,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        success: false,
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value,
    }));
  };

  return (
    <main className="landing">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="landing-hero-content">
            <h1 className="landing-hero-title">{t("landing.hero.title")}</h1>
            <p className="landing-hero-subtitle">
              {t("landing.hero.subtitle")}
            </p>
            <div className="landing-hero-cta">
              <ButtonComponent to="#projects" variant="brand">
                {t("landing.hero.primaryCta")}
              </ButtonComponent>
              <ButtonComponent to="#contact" variant="secondary">
                {t("landing.hero.secondaryCta")}
              </ButtonComponent>
            </div>
            <div className="landing-hero-social">
              <Link
                to="https://github.com/AliSafari-IT"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github title="Github" />
              </Link>
              <Link
                to="https://www.linkedin.com/in/ali-safari-m/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin title="LinkedIn" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="landing-section landing-about">
        <div className="landing-container">
          <div className="landing-about-content">
            <div className="landing-about-text">
              <h2 className="landing-section-title">
                {t("landing.about.title")}
              </h2>
              <p className="landing-about-intro">{t("landing.about.intro")}</p>
              <div className="landing-about-stats">
                <div className="landing-stat">
                  <span className="landing-stat-value">3+</span>
                  <span className="landing-stat-label">
                    {t("landing.about.yearsExperience")}
                  </span>
                </div>
                <div className="landing-stat">
                  <span className="landing-stat-value">10+</span>
                  <span className="landing-stat-label">
                    {t("landing.about.projectsDelivered")}
                  </span>
                </div>
                <div className="landing-stat">
                  <span className="landing-stat-value">5+</span>
                  <span className="landing-stat-label">
                    {t("landing.about.techStacks")}
                  </span>
                </div>
              </div>
              <div className="landing-about-location">
                <Location title="Location" />
                <span>{t("landing.about.location")}</span>
              </div>
            </div>
            <div className="landing-about-avatar">
              <img
                className="landing-avatar"
                width={140}
                src="https://avatars.githubusercontent.com/u/58768873?v=4"
                alt="Ali-Safari-Photo"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="landing-section landing-projects">
        <div className="landing-container">
          <header className="landing-section-header">
            <span className="landing-section-kicker">
              {t("landing.projects.kicker")}
            </span>
            <h2 className="landing-section-title">
              {t("landing.projects.title")}
            </h2>
            <p className="landing-section-subtitle">
              {t("landing.projects.subtitle")}
            </p>
          </header>
          <div className="landing-projects-grid">
            {projects.map((project) => (
              <article key={project.id} className="landing-project-card">
                <div className="landing-project-image" />
                <div className="landing-project-content">
                  <h3 className="landing-project-title">
                    {t(`landing.projects.items.${project.id}.title`)}
                  </h3>
                  <p className="landing-project-description">
                    {t(`landing.projects.items.${project.id}.description`)}
                  </p>
                  <div className="landing-project-tags">
                    {project.tags.map((tag) => (
                      <span key={tag} className="landing-tag">
                        {tag} 
                      </span>
                    ))}
                  </div>
                  <div className="landing-project-achievement">
                    <strong>{t("landing.projects.achievement")}:</strong>{" "}
                    {project.achievements[0]}
                  </div>
                  <div className="landing-project-links">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="landing-project-link"
                    >
                      GitHub →
                    </a>
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="landing-project-link landing-project-link-primary"
                      >
                        {t("landing.projects.liveDemo")} →
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="landing-section landing-services">
        <div className="landing-container">
          <header className="landing-section-header">
            <span className="landing-section-kicker">
              {t("landing.services.kicker")}
            </span>
            <h2 className="landing-section-title">
              {t("landing.services.title")}
            </h2>
            <p className="landing-section-subtitle">
              {t("landing.services.subtitle")}
            </p>
          </header>
          <div className="landing-services-grid">
            {services.map((service) => (
              <article key={service.id} className="landing-service-card">
                <span className="landing-service-icon">{service.icon}</span>
                <h3 className="landing-service-title"> {t(`landing.services.items.${service.id}.title`)}</h3>
                <p className="landing-service-description">
                  {t(`landing.services.items.${service.id}.description`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section
        id="case-studies"
        className="landing-section landing-case-studies"
      >
        <div className="landing-container">
          <header className="landing-section-header">
            <span className="landing-section-kicker">
              {t("landing.caseStudies.kicker")}
            </span>
            <h2 className="landing-section-title">
              {t("landing.caseStudies.title")}
            </h2>
          </header>
          <div className="landing-case-studies-grid">
            {caseStudies.map((study) => (
              <article key={study.id} className="landing-case-study">
                <h3 className="landing-case-study-title">{study.title}</h3>
                <div className="landing-case-study-flow">
                  <div className="landing-case-study-step">
                    <span className="landing-case-study-label">
                      {t("landing.caseStudies.problem")}
                    </span>
                    <p>{t(`landing.caseStudies.items.${study.id}.problem`)}</p>
                  </div>
                  <div className="landing-case-study-arrow">→</div>
                  <div className="landing-case-study-step">
                    <span className="landing-case-study-label">
                      {t("landing.caseStudies.solution")}
                    </span>
                    <p>{t(`landing.caseStudies.items.${study.id}.solution`)}</p>
                  </div>
                  <div className="landing-case-study-arrow">→</div>
                  <div className="landing-case-study-step">
                    <span className="landing-case-study-label">
                      {t("landing.caseStudies.result")}
                    </span>
                    <p>{t(`landing.caseStudies.items.${study.id}.result`)}</p>
                  </div>
                </div>
                <div className="landing-case-study-tech">
                  <strong>{t("landing.caseStudies.technologies")}:</strong>
                  {study.technologies}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CV Section */}
      <section id="cv" className="landing-section landing-cv">
        <div className="landing-container">
          <div className="landing-cv-card">
            <div className="landing-cv-content">
              <h2 className="landing-cv-title">{t("landing.cv.title")}</h2>
              <p className="landing-cv-subtitle">{t("landing.cv.subtitle")}</p>
              <div className="landing-cv-skills">
                {skills.map((skill) => (
                  <span key={skill} className="landing-tag">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="landing-cv-actions">
                <a
                  href="/CV_Dec2025_AliSafari.pdf"
                  download
                  className="landing-btn landing-btn-primary"
                  target="_blank"
                >
                  {t("landing.cv.downloadPdf")}
                </a>
                <a
                  href={ONLINE_CV || "/resume"}
                  className="landing-btn landing-btn-secondary"
                >
                  {t("landing.cv.viewOnline")} →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="landing-section landing-contact">
        <div className="landing-container">
          <header className="landing-section-header">
            <span className="landing-section-kicker">
              {t("landing.contact.kicker")}
            </span>
            <h2 className="landing-section-title">
              {t("landing.contact.title")}
            </h2>
            <p className="landing-section-subtitle">
              {t("landing.contact.subtitle")}
            </p>
          </header>
          <div className="landing-contact-layout">
            <form className="landing-contact-form" onSubmit={handleSubmit}>
              {status.error && (
                <div className="landing-form-error">❌ {status.error}</div>
              )}
              {status.success && (
                <div className="landing-form-success">
                  ✅ {t("landing.contact.form.success")}
                </div>
              )}
              <div className="landing-form-group">
                <label htmlFor="name" className="landing-form-label">
                  {t("landing.contact.form.name")}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="landing-form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="landing-form-group">
                <label htmlFor="email" className="landing-form-label">
                  {t("landing.contact.form.email")}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="landing-form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="landing-form-group">
                <label htmlFor="subject" className="landing-form-label">
                  {t("landing.contact.form.subject")}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="landing-form-input"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="landing-form-group">
                <label htmlFor="message" className="landing-form-label">
                  {t("landing.contact.form.message")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="landing-form-textarea"
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="landing-btn landing-btn-primary landing-btn-full"
                disabled={status.submitting}
              >
                {status.submitting
                  ? t("landing.contact.form.sending")
                  : t("landing.contact.form.submit")}
              </button>
              <p className="landing-form-reassurance">
                {t("landing.contact.form.reassurance")}
              </p>
            </form>
            <aside className="landing-contact-info">
              <div className="landing-contact-info-item">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <a href="mailto:contact@asafarim.com">contact@asafarim.com</a>
              </div>
              <div className="landing-contact-info-item">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>{t("contact.info.location")}</span>
              </div>
              <div className="landing-contact-availability">
                <span className="landing-availability-dot" />
                {t("landing.contact.availability")}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-content">
            <div className="landing-footer-brand">
              <strong>ASafariM</strong>
              <p>{t("landing.footer.tagline")}</p>
            </div>
            <nav className="landing-footer-nav">
              <a href="#about">{t("landing.footer.about")}</a>
              <a href="#projects">{t("landing.footer.projects")}</a>
              <a href="#services">{t("landing.footer.services")}</a>
              <a href="#contact">{t("landing.footer.contact")}</a>
            </nav>
            <div className="landing-footer-social">
              <Link
                to="https://github.com/AliSafari-IT"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github />
              </Link>
              <Link
                to="https://linkedin.com/in/ali-safari-m/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin />
              </Link>
            </div>
          </div>
          <div className="landing-footer-bottom">
            <p>
              &copy; {new Date().getFullYear()} Ali Safari.{" "}
              {t("landing.footer.rights")}
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
