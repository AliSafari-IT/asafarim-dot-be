import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { sendEmail } from "../api/emailService";
import { Button, useAuth, useNotifications } from "@asafarim/shared-ui-react";
import { apiGet, CORE_API_BASE } from "../api/core";
import React from "react";

// Generate a unique reference number for new conversations
const generateReferenceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `CONV-${year}${month}${day}-${random}`;
};

interface Conversation {
  id: number;
  userId: string;
  email: string;
  name?: string;
  subject: string;
  message: string;
  createdAt: string;
  emailSent: boolean;
  attachmentPath?: string;
  referenceNumber?: string;
  referingToConversation?: string;
  links?: string;
}

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

export default function Contact() {
  const { user, token } = useAuth();
  const { addNotification } = useNotifications();
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.name || user?.userName || "");
  const [conversations, setConversations] = useState<Conversation[]>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [referringToConversation, setReferringToConversation] = useState<
    string | undefined
  >();
  const [showReferenceDropdown, setShowReferenceDropdown] = useState(false);
  const [expandedConversations, setExpandedConversations] = useState<
    Record<number, boolean>
  >({});

    // ✅ Ref for Project Type input
    const projectTypeRef = useRef<HTMLInputElement>(null);

    // ✅ Scroll & highlight function
    const scrollToProjectType = () => {
      const el = projectTypeRef.current;
      if (!el) return;
  
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus({ preventScroll: true });
  
      // Add a temporary highlight class
      el.classList.add("web-contact-input-highlight");
      setTimeout(() => el.classList.remove("web-contact-input-highlight"), 2000);
    };
  

  const fetchConversations = useCallback(async () => {
    if (!user?.id || !token) {
      console.log("No user ID or token available for fetching conversations");
      return;
    }

    console.log(
      "Fetching conversations for user:",
      user.id,
      "with token:",
      token.substring(0, 10) + "..."
    );
    // CORE_API_BASE already includes /api, so we don't need to add it again
    const apiUrl = `${CORE_API_BASE}/email/conversations`;
    console.log("Full API URL:", apiUrl);

    try {
      const data = await apiGet<Conversation[]>("/email/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Conversations API response:", data);
      console.log("Number of conversations:", data?.length || 0);

      setConversations(data);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  }, [user?.id, token]);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        setEmail(user?.email || "");
        setName(user?.name || user?.userName || "");
        await fetchConversations();
      }
    }
    fetchData();
  }, [user, fetchConversations]);

  useEffect(() => {
    console.info("Conversations:", conversations);
  }, [conversations]);

  // Function to toggle conversation expanded/collapsed state
  const toggleConversation = (id: number) => {
    setExpandedConversations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const [formData, setFormData] = useState<FormState>({
    name: name || "",
    email: email || "",
    subject: "Website Contact",
    message: "",
    attachments: [],
    links: [],
    referenceNumber: user ? generateReferenceNumber() : undefined,
  });

  // Update form data when user auth state changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: name || prev.name,
      email: email || prev.email,
      // Generate a reference number if user is logged in and there isn't one already
      referenceNumber:
        user && !prev.referenceNumber
          ? generateReferenceNumber()
          : prev.referenceNumber,
    }));
  }, [name, email, user]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      file,
      type: file.type.startsWith("image/") ? "image" : "document",
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
    }));

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments],
    }));
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleAddLink = () => {
    const link = prompt("Please enter a URL:");
    if (link && isValidUrl(link)) {
      setFormData((prev) => ({
        ...prev,
        links: [...prev.links, link],
      }));
    } else if (link) {
      addNotification("error", "Please enter a valid URL");
    }
  };

  const handleRemoveLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const [status, setStatus] = useState<FormStatus>({
    submitting: false,
    submitted: false,
    error: null,
    success: false,
  });

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
  
        // Refresh the conversations list
        await fetchConversations();
  
        // Reset form after successful submission
        setFormData({
          name: name,
          email: email,
          subject: "Website Contact",
          message: "",
          attachments: [],
          links: [],
          referenceNumber: generateReferenceNumber(),
          referingToConversation: undefined,
        });
        setReferringToConversation(undefined);
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
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        success: false,
      });
    }
  };

  return (
    <section className="web-contact">
      <div className="container">
        {/* Hero Section */}
        <div className="web-contact-hero">
          <h1 className="web-contact-title">
            Let's Build Something Amazing Together
          </h1>
          <p className="web-contact-subtitle">
            As a fullstack developer specializing in .NET and React, I'm ready
            to help bring your project to life. Whether you need a scalable API,
            an interactive web application, or end-to-end development.
          </p>
        </div>

        {/* Services Grid */}
        <div className="web-contact-services">
          <div className="web-contact-service-card">
            <h3 className="web-contact-service-title">Backend Development</h3>
            <p className="web-contact-service-desc">
              ASP.NET Core APIs, Entity Framework, SQL databases
            </p>
          </div>
          <div className="web-contact-service-card">
            <h3 className="web-contact-service-title">Frontend Development</h3>
            <p className="web-contact-service-desc">
              React, TypeScript, Tailwind, Modern UI/UX
            </p>
          </div>
          <div className="web-contact-service-card">
            <h3 className="web-contact-service-title">Full Project Delivery</h3>
            <p className="web-contact-service-desc">
              End-to-end solutions with CI/CD and cloud deployment
            </p>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="web-contact-layout">
          {/* Form Column */}
          <div className="web-contact-form-container">
            <h2 className="web-contact-form-title">
              {formData.referenceNumber
                ? `Reply to Conversation ${formData.referenceNumber}`
                : "Start New Conversation"}
            </h2>

            {/* Reference Number Input */}
            {user && (
              <div
                className="web-contact-reference"
                style={{ position: "relative" }}
              >
                <label htmlFor="referenceNumber" className="web-contact-label">
                  Reference Number
                </label>
                <div className="web-contact-reference-input">
                  <input
                    type="text"
                    id="referenceNumber"
                    name="referenceNumber"
                    className="web-contact-input web-contact-input-readonly"
                    value={formData.referenceNumber || ""}
                    readOnly
                  />
                  <div className="web-contact-reference-actions">
                    {referringToConversation ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setReferringToConversation(undefined);
                          setFormData((prev) => ({
                            ...prev,
                            referenceNumber: generateReferenceNumber(),
                            referingToConversation: undefined,
                            subject: "Website Contact",
                          }));
                        }}
                      >
                        New Conversation
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() =>
                          setShowReferenceDropdown(!showReferenceDropdown)
                        }
                      >
                        Reference Previous
                      </Button>
                    )}
                  </div>
                </div>

                {/* Dropdown for selecting previous conversations */}
                {showReferenceDropdown &&
                  conversations &&
                  conversations.length > 0 && (
                    <div className="web-contact-reference-dropdown">
                      <div className="web-contact-reference-dropdown-header">
                        <h4>Select a conversation to reference</h4>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setShowReferenceDropdown(false)}
                        >
                          ×
                        </Button>
                      </div>
                      <div className="web-contact-reference-dropdown-list">
                        {conversations.map((conv) => (
                          <div
                            key={conv.id}
                            className="web-contact-reference-dropdown-item"
                            onClick={() => {
                              const refNumber =
                                conv.referenceNumber || `REF-${conv.id}`;
                              setFormData((prev) => ({
                                ...prev,
                                referingToConversation: refNumber,
                              }));
                              setShowReferenceDropdown(false);
                            }}
                          >
                            <div className="web-contact-reference-dropdown-item-header">
                              <span className="web-contact-reference-dropdown-item-ref">
                                {conv.referenceNumber || `REF-${conv.id}`}
                              </span>
                              <span className="web-contact-reference-dropdown-item-date">
                                {new Date(conv.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="web-contact-reference-dropdown-item-subject">
                              {conv.subject}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

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
                  ref={projectTypeRef} 
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

              {/* Attachments Section */}
              <div className="web-contact-attachments">
                <div className="web-contact-attachment-header">
                  <h3 className="web-contact-label">Attachments & Links</h3>
                  <div className="web-contact-attachment-actions">
                    <button
                      type="button"
                      className="web-contact-attachment-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Add File
                    </button>
                    <button
                      type="button"
                      className="web-contact-attachment-btn"
                      onClick={handleAddLink}
                    >
                      Add Link
                    </button>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                  multiple
                  accept=".pdf,.doc,.docx,.txt,image/*"
                />

                {/* Attachments Preview */}
                {formData.attachments.length > 0 && (
                  <div className="web-contact-attachment-list">
                    {formData.attachments.map((attachment, index) => (
                      <div key={index} className="web-contact-attachment-item">
                        {attachment.type === "image" &&
                        attachment.previewUrl ? (
                          <img
                            src={attachment.previewUrl}
                            alt="Preview"
                            className="web-contact-attachment-preview"
                          />
                        ) : (
                          <div className="web-contact-attachment-icon">📄</div>
                        )}
                        <span>{attachment.file.name}</span>
                        <button
                          type="button"
                          className="web-contact-attachment-remove"
                          onClick={() => handleRemoveAttachment(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Links Preview */}
                {formData.links.length > 0 && (
                  <div className="web-contact-link-list">
                    {formData.links.map((link, index) => (
                      <div key={index} className="web-contact-link-item">
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link}
                        </a>
                        <button
                          type="button"
                          className="web-contact-link-remove"
                          onClick={() => handleRemoveLink(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="web-contact-submit"
                disabled={status.submitting}
              >
                {status.submitting
                  ? "Sending..."
                  : "Let's Discuss Your Project"}
              </button>
            </form>
          </div>

          {/* Conversations Column */}
          {user && (
            <div className="web-contact-conversations">
              <h2 className="web-contact-conversations-title">
                Your Conversations
              </h2>
              {conversations && conversations?.length > 0 ? (
                <div className="web-contact-conversations-list">
                  {conversations.map((conv) => {
                    const isExpanded = expandedConversations[conv.id] || false;
                    const refNumber = conv.referenceNumber || `REF-${conv.id}`;

                    return (
                      <div
                        id={`conversation-${conv.id}`}
                        key={conv.id}
                        className="web-contact-conversation-item"
                      >
                        <div
                          className="web-contact-conversation-header"
                          aria-expanded={isExpanded}
                          onClick={() => toggleConversation(conv.id)}
                        >
                          <div className="web-contact-conversation-summary">
                            <span className="web-contact-ref-number">
                              {refNumber}
                            </span>
                            <span
                              className="web-contact-conversation-subject"
                              title={conv.subject}
                            >
                              {conv.subject}
                            </span>
                            <span className="web-contact-conversation-date">
                              {new Date(conv.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="web-contact-conversation-chevron">
                            {isExpanded ? "▲" : "▼"}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="web-contact-conversation-details">
                            <div className="web-contact-message">
                              <p className="web-contact-message-text">
                                {conv.message}
                              </p>
                              {conv.referingToConversation && (
                                <div className="web-contact-message-reference">
                                  <strong>Referring to conversation: </strong>
                                  <a 
                                    href="#" 
                                    className="web-contact-reference-link"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      // Find the conversation with this reference number
                                      const referencedConv = conversations?.find(
                                        c => c.referenceNumber === conv.referingToConversation || 
                                             `REF-${c.id}` === conv.referingToConversation
                                      );
                                      
                                      if (referencedConv) {
                                        // Expand the referenced conversation if it's not already expanded
                                        setExpandedConversations(prev => ({
                                          ...prev,
                                          [referencedConv.id]: true
                                        }));
                                        
                                        // Scroll to the referenced conversation
                                        setTimeout(() => {
                                          const element = document.getElementById(`conversation-${referencedConv.id}`);
                                          if (element) {
                                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            // Add a highlight effect
                                            element.classList.add('web-contact-conversation-highlight');
                                            setTimeout(() => {
                                              element.classList.remove('web-contact-conversation-highlight');
                                            }, 2000);
                                          }
                                        }, 100);
                                      }
                                    }}
                                  >
                                    {conv.referingToConversation}
                                  </a>
                                </div>
                              )}
                              {conv.links && conv.links.length > 0 && (
                                <div className="web-contact-message-links">
                                  <strong>Links:</strong>
                                  <div className="web-contact-link-list">
                                    {conv.links.split(',').map((link, index) => (
                                      <a 
                                        key={index} 
                                        href={link.trim()} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="web-contact-link"
                                      >
                                        {link.trim()}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {conv.attachmentPath && (
                                <div className="web-contact-message-attachments">
                                  <strong>Attachments:</strong>
                                  <div className="web-contact-attachment-link">
                                    <span className="web-contact-attachment-icon">📄</span>
                                    {conv.attachmentPath.split('/').pop()}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="web-contact-conversation-actions">
                              <Button
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReferringToConversation(refNumber);
                                  setFormData((prev) => ({
                                    ...prev,
                                    referenceNumber: generateReferenceNumber(),
                                    referingToConversation: refNumber,
                                    subject: `Re: ${conv.subject}`,
                                  }));
                                  scrollToProjectType();
                                }}
                              >
                                Reply to this conversation
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>No conversations found</p>
              )}
            </div>
          )}
          <div className="web-contact-info-wrapper">
            <div className="web-contact-info">
              <h2 className="web-contact-info-title">Why Work With Me?</h2>
              <ul className="web-contact-features">
                <li className="web-contact-feature">
                  <span className="web-contact-feature-icon">✓</span>
                  <p className="web-contact-feature-text">
                    Expert in both frontend and backend development
                  </p>
                </li>
                <li className="web-contact-feature">
                  <span className="web-contact-feature-icon">✓</span>
                  <p className="web-contact-feature-text">
                    Strong background in scientific applications
                  </p>
                </li>
                <li className="web-contact-feature">
                  <span className="web-contact-feature-icon">✓</span>
                  <p className="web-contact-feature-text">
                    Experience with complex data visualization
                  </p>
                </li>
                <li className="web-contact-feature">
                  <span className="web-contact-feature-icon">✓</span>
                  <p className="web-contact-feature-text">
                    Proven track record in project delivery
                  </p>
                </li>
              </ul>
            </div>

            <div className="web-contact-info">
              <h2 className="web-contact-info-title">Contact Information</h2>
              <div className="web-contact-details">
                <div className="web-contact-detail">
                  <h3 className="web-contact-detail-label">Email</h3>
                  <p className="web-contact-detail-value">
                    contact@asafarim.com
                  </p>
                </div>
                <div className="web-contact-detail">
                  <h3 className="web-contact-detail-label">Location</h3>
                  <p className="web-contact-detail-value">Hasselt, België</p>
                </div>
                <div className="web-contact-detail">
                  <h3 className="web-contact-detail-label">Availability</h3>
                  <p className="web-contact-detail-value">
                    Available for freelance projects
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
