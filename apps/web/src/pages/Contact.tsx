import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { submitContactForm, initEmailJS } from "../api/contactService";
import { useAuth, useNotifications } from "@asafarim/shared-ui-react";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormStatus {
  submitting: boolean;
  submitted: boolean;
  error: string | null;
  success: boolean;
}

export default function Contact() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.name || user?.userName || "");

  useEffect(() => {
    setEmail(user?.email || "");
    setName(user?.name || user?.userName || "");
  }, [user]);

  const [formData, setFormData] = useState<FormState>({
    name: name,
    email: email,
    subject: "Website Contact",
    message: "",
  });

  const [status, setStatus] = useState<FormStatus>({
    submitting: false,
    submitted: false,
    error: null,
    success: false,
  });

  // Initialize EmailJS when component mounts
  useEffect(() => {
    initEmailJS();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStatus({
      submitting: true,
      submitted: false,
      error: null,
      success: false,
    });

    formData.name =
      email + " <" + (formData.name + " reply to: " + formData.email) + ">";

    try {
      const response = await submitContactForm(formData);

      if (response.status === 200) {
        // Show success notification
        addNotification(
          "success",
          "Thank you for your message! We've received your inquiry and will get back to you soon."
        );

        setStatus({
          submitting: false,
          submitted: true,
          error: null,
          success: true,
        });

        // Reset form after successful submission
        setFormData({
          name: name,
          email: email,
          subject: "Website Contact",
          message: "",
        });
      } else {
        throw new Error("Failed to send message");
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

  return (
    <section className="web-contact">
      <div className="container">
        {/* Hero Section */}
        <div className="web-contact-hero">
          <h1 className="web-contact-title">Let's Build Something Amazing Together</h1>
          <p className="web-contact-subtitle">
            As a fullstack developer specializing in .NET and React, I'm ready to help bring your project to life. 
            Whether you need a scalable API, an interactive web application, or end-to-end development.
          </p>
        </div>

        {/* Services Grid */}
        <div className="web-contact-services">
          <div className="web-contact-service-card">
            <h3 className="web-contact-service-title">Backend Development</h3>
            <p className="web-contact-service-desc">ASP.NET Core APIs, Entity Framework, SQL databases</p>
          </div>
          <div className="web-contact-service-card">
            <h3 className="web-contact-service-title">Frontend Development</h3>
            <p className="web-contact-service-desc">React, TypeScript, Tailwind, Modern UI/UX</p>
          </div>
          <div className="web-contact-service-card">
            <h3 className="web-contact-service-title">Full Project Delivery</h3>
            <p className="web-contact-service-desc">End-to-end solutions with CI/CD and cloud deployment</p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="web-contact-layout">
          {/* Form Column */}
          <div className="web-contact-form-container">
            <h2 className="web-contact-form-title">Start Your Project</h2>
            
            <form className="web-contact-form" onSubmit={handleSubmit}>
              <div className="web-contact-input-group">
                <div className="web-contact-field">
                  <label htmlFor="name" className="web-contact-label">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="web-contact-input"
                    value={formData.name || name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="web-contact-field">
                  <label htmlFor="email" className="web-contact-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="web-contact-input"
                    value={formData.email || email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="web-contact-field">
                <label htmlFor="subject" className="web-contact-label">
                  Project Type
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="web-contact-input"
                  placeholder="e.g., Full-stack Application, API Development, Frontend UI"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="web-contact-field">
                <label htmlFor="message" className="web-contact-label">
                  Project Details
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="web-contact-textarea"
                  placeholder="Please describe your project, timeline, and any specific requirements..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="web-contact-submit"
                disabled={status.submitting}
              >
                {status.submitting ? "Sending..." : "Let's Discuss Your Project"}
              </button>
            </form>
          </div>

          {/* Info Column */}
          <div className="web-contact-info-wrapper">
            <div className="web-contact-info">
              <h2 className="web-contact-info-title">Why Work With Me?</h2>
              <ul className="web-contact-features">
                <li className="web-contact-feature">
                  <span className="web-contact-feature-icon">✓</span>
                  <p className="web-contact-feature-text">Expert in both frontend and backend development</p>
                </li>
                <li className="web-contact-feature">
                  <span className="web-contact-feature-icon">✓</span>
                  <p className="web-contact-feature-text">Strong background in scientific applications</p>
                </li>
                <li className="web-contact-feature">
                  <span className="web-contact-feature-icon">✓</span>
                  <p className="web-contact-feature-text">Experience with complex data visualization</p>
                </li>
                <li className="web-contact-feature">
                  <span className="web-contact-feature-icon">✓</span>
                  <p className="web-contact-feature-text">Proven track record in project delivery</p>
                </li>
              </ul>
            </div>

            <div className="web-contact-info">
              <h2 className="web-contact-info-title">Contact Information</h2>
              <div className="web-contact-details">
                <div className="web-contact-detail">
                  <h3 className="web-contact-detail-label">Email</h3>
                  <p className="web-contact-detail-value">contact@asafarim.com</p>
                </div>
                <div className="web-contact-detail">
                  <h3 className="web-contact-detail-label">Location</h3>
                  <p className="web-contact-detail-value">Hasselt, België</p>
                </div>
                <div className="web-contact-detail">
                  <h3 className="web-contact-detail-label">Availability</h3>
                  <p className="web-contact-detail-value">Available for freelance projects</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
