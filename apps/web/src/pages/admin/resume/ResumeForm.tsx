import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, useAuth } from "@asafarim/shared-ui-react";
import {
  createResume,
  updateResume,
  fetchResumeById,
  type CreateResumeRequest,
  type UpdateResumeRequest,
} from "../../../services/resumeApi";
import { useToast } from "@asafarim/toast";

const ResumeForm: React.FC = () => {
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateResumeRequest>({
    title: "",
    summary: "",
    contact: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
    },
  });

  // Load existing resume data if editing
  useEffect(() => {
    if (isEditing && id) {
      const loadResume = async () => {
        try {
          setLoading(true);
          const resume = await fetchResumeById(id);
          setFormData({
            title: resume.title,
            summary: resume.summary,
            contact: resume.contact
              ? {
                  fullName: resume.contact.fullName,
                  email: resume.contact.email,
                  phone: resume.contact.phone,
                  location: resume.contact.location,
                }
              : {
                  fullName: "",
                  email: "",
                  phone: "",
                  location: "",
                },
          });
        } catch (error) {
          console.error("Failed to load resume:", error);
          toast.error("Failed to load resume data");
        } finally {
          setLoading(false);
        }
      };

      loadResume();
    }
  }, [id, isEditing]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleContactChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact!,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setLoading(true);

      if (isEditing && id) {
        await updateResume(id, formData as UpdateResumeRequest);
        toast.success("Resume updated successfully!");
      } else {
        await createResume(formData);
        toast.success("Resume created successfully!");
      }

      // Navigate back to resume list or to the edit page to manage sections
      navigate("/admin/entities/resumes");
    } catch (error) {
      console.error("Failed to save resume:", error);
      toast.error(`Failed to ${isEditing ? "update" : "create"} resume`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in to manage resumes.</div>;
  }

  return (
    <div className="resume-form-page">
      <div className="resume-form-container">
        <div className="resume-section-form-view">
          <div className="resume-section-form-container">
            <header className="resume-section-form-header">
              <div>
                <h1 className="resume-section-form-title">
                  {isEditing ? "Edit Resume" : "Create New Resume"}
                </h1>
                <p className="resume-section-form-subtitle">
                  {isEditing ? (
                    <>
                      Update your resume details.{" "}
                      {id && (
                        <a
                          href={`/admin/entities/resumes/${id}/edit`}
                          className="link"
                        >
                          Manage sections
                        </a>
                      )}{" "}
                      after saving.
                    </>
                  ) : (
                    <>
                      Create a new resume.{" "}
                      {id && (
                        <a
                          href={`/admin/entities/resumes/${id}/edit`}
                          className="link"
                        >
                          Add sections
                        </a>
                      )}{" "}
                      after creating the basic resume.
                    </>
                  )}
                </p>
              </div>
              <Button
                onClick={() => navigate("/admin/entities/resumes")}
                variant="secondary"
              >
                ← Back to Resumes
              </Button>
            </header>

            <form onSubmit={handleSubmit} className="resume-section-form">
              {/* Basic Information */}
              <div className="form-section">
                <h3>Basic Information</h3>

                <div className="form-group">
                  <label htmlFor="title">
                    Resume Title <span className="required">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Software Engineer Resume, Full Stack Developer CV"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="summary">Professional Summary</label>
                  <textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) =>
                      handleInputChange("summary", e.target.value)
                    }
                    placeholder="Brief summary of your professional background and key strengths..."
                    rows={4}
                    className="form-textarea"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="form-section">
                <h3>Contact Information</h3>

                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.contact?.fullName || ""}
                    onChange={(e) =>
                      handleContactChange("fullName", e.target.value)
                    }
                    placeholder="Your full name"
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={formData.contact?.email || ""}
                      onChange={(e) =>
                        handleContactChange("email", e.target.value)
                      }
                      placeholder="your.email@example.com"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.contact?.phone || ""}
                      onChange={(e) =>
                        handleContactChange("phone", e.target.value)
                      }
                      placeholder="+1 (555) 123-4567"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    type="text"
                    value={formData.contact?.location || ""}
                    onChange={(e) =>
                      handleContactChange("location", e.target.value)
                    }
                    placeholder="City, State/Country"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/admin/entities/resumes")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !formData.title.trim()}
                >
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Update Resume"
                    : "Create Resume"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeForm;
