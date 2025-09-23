import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from "react";
import { sendEmail } from "../api/emailService";
import { useAuth, useNotifications } from "@asafarim/shared-ui-react";

interface Conversation {
  id: string;
  referenceNumber: string;
  messages: ConversationMessage[];
  status: 'open' | 'replied' | 'closed';
  createdAt: string;
}

interface ConversationMessage {
  id: string;
  subject: string;
  message: string;
  createdAt: string;
  isFromUser: boolean;
  referenceNumber?: string;
  attachments: MessageAttachment[];
  links: MessageLink[];
}

interface MessageAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
}

interface MessageLink {
  id: string;
  url: string;
  description?: string;
}

interface Attachment {
  file: File;
  previewUrl?: string;
  type: 'document' | 'image';
}

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
  attachments: Attachment[];
  links: string[];
  referenceNumber?: string; // Optional reference to another conversation
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEmail(user?.email || "");
    setName(user?.name || user?.userName || "");
  }, [user]);

  useEffect(() => {
    if (user) {
      // Fetch user's conversation history
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_CORE_API_URL}/conversations/${user.id}`);
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const [formData, setFormData] = useState<FormState>({
    name: name || "",
    email: email || "",
    subject: "Website Contact",
    message: "",
    attachments: [],
    links: []
  });

  // Update form data when user auth state changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: name || prev.name,
      email: email || prev.email
    }));
  }, [name, email]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      file,
      type: file.type.startsWith('image/') ? 'image' : 'document',
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleAddLink = () => {
    const link = prompt('Please enter a URL:');
    if (link && isValidUrl(link)) {
      setFormData(prev => ({
        ...prev,
        links: [...prev.links, link]
      }));
    } else if (link) {
      addNotification('error', 'Please enter a valid URL');
    }
  };

  const handleRemoveLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
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

    // The email service will handle the formatting of attachments and links

    try {
      const emailResponse = await sendEmail({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        attachments: formData.attachments,
        links: formData.links,
        referenceNumber: formData.referenceNumber
      });

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

        // Reset form after successful submission
        setFormData({
          name: name,
          email: email,
          subject: "Website Contact",
          message: "",
          attachments: [],
          links: []
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
              <div className="web-contact-reference">
                <label htmlFor="referenceNumber" className="web-contact-label">
                  Reference Number (Optional)
                </label>
                <div className="web-contact-reference-input">
                  <input
                    type="text"
                    id="referenceNumber"
                    name="referenceNumber"
                    className="web-contact-input"
                    placeholder="e.g., CONV-20250923-0001"
                    value={formData.referenceNumber || ''}
                    onChange={handleChange}
                  />
                  {formData.referenceNumber && (
                    <button
                      type="button"
                      className="web-contact-reference-clear"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, referenceNumber: '' }));
                      }}
                    >
                      Clear Reference
                    </button>
                  )}
                </div>
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
                        {attachment.type === 'image' && attachment.previewUrl ? (
                          <img src={attachment.previewUrl} alt="Preview" className="web-contact-attachment-preview" />
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
                        <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
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
                {status.submitting ? "Sending..." : "Let's Discuss Your Project"}
              </button>
            </form>
          </div>

          {/* Conversations Column */}
          {user && (
            <div className="web-contact-conversations">
              <h2 className="web-contact-conversations-title">Your Conversations</h2>
              {conversations.length > 0 ? (
                <div className="web-contact-conversations-list">
                  {conversations.map((conv) => (
                    <div key={conv.id} className="web-contact-conversation-item">
                      <div className="web-contact-conversation-header">
                        <div className="web-contact-conversation-ref">
                          <span className="web-contact-ref-label">Ref:</span>
                          <span className="web-contact-ref-number">{conv.referenceNumber}</span>
                        </div>
                        <span className={`web-contact-status web-contact-status-${conv.status}`}>
                          {conv.status}
                        </span>
                      </div>

                      <div className="web-contact-messages">
                        {conv.messages.map((msg, index) => (
                          <div 
                            key={msg?.id || index} 
                            className={`web-contact-message ${msg.isFromUser ? 'user' : 'admin'}`}
                          >
                            <div className="web-contact-message-content">
                              <h4 className="web-contact-message-subject">{msg.subject}</h4>
                              <p className="web-contact-message-text">{msg.message}</p>
                              
                              {msg.referenceNumber && (
                                <div className="web-contact-message-reference">
                                  References: {msg.referenceNumber}
                                </div>
                              )}

                              {(msg.attachments.length > 0 || msg.links.length > 0) && (
                                <div className="web-contact-message-attachments">
                                  {msg.attachments.map((att) => (
                                    <a 
                                      key={att.id}
                                      href={att.fileUrl}
                                      className="web-contact-attachment-link"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      📎 {att.fileName}
                                    </a>
                                  ))}
                                  {msg.links.map((link) => (
                                    <a
                                      key={link.id}
                                      href={link.url}
                                      className="web-contact-link"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      🔗 {link.description || link.url}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                            <time className="web-contact-message-time">
                              {new Date(msg.createdAt).toLocaleString()}
                            </time>
                          </div>
                        ))}
                      </div>

                      <div className="web-contact-conversation-actions">
                        <button
                          type="button"
                          className="web-contact-reply-btn"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              referenceNumber: conv.referenceNumber,
                              subject: `Re: ${conv.messages[0].subject}`
                            }));
                          }}
                        >
                          Reply to this conversation
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="web-contact-conversations-empty">
                  No conversations yet. Start one by sending a message!
                </p>
              )}
            </div>
          )}
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
