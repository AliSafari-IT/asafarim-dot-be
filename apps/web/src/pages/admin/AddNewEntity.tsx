import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ButtonComponent as Button, useAuth, useNotifications } from "@asafarim/shared-ui-react";
import { ENTITY_TYPES } from "../../services/entityService";
import {
  createWorkExperience,
  type WorkExperienceRequest,
  type WorkAchievementRequest,
} from "../../services/workExperienceService";
import {
  createResume,
  fetchResumes,
  type CreateResumeRequest,
} from "../../services/resumeApi";
import {
  createPublication,
  type PublicationDto,
} from "../../services/publicationService";
import "./entity-management.css";

interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "email"
    | "url"
    | "date"
    | "number"
    | "checkbox"
    | "select";
  required?: boolean;
  placeholder?: string;
  rows?: number;
  defaultValue?: string | number | boolean;
  options?: { value: string; label: string; tooltip?: string }[];
}

// Define form schemas for each entity type - matching backend models exactly
const FORM_SCHEMAS: Record<string, FormField[]> = {
  "work-experiences": [
    // Basic details
    {
      name: "resumeId",
      label: "Resume (optional - will create default if not selected)",
      type: "select",
      required: false,
      options: [],
    },
    {
      name: "jobTitle",
      label: "Job Title",
      type: "text",
      required: true,
      placeholder: "e.g., Senior Full Stack Developer",
    },
    {
      name: "companyName",
      label: "Company Name",
      type: "text",
      required: true,
      placeholder: "e.g., Tech Company",
    },
    {
      name: "location",
      label: "Location",
      type: "text",
      placeholder: "e.g., Brussels, Belgium",
    },

    // Dates
    { name: "startDate", label: "Start Date", type: "date", required: true },
    { name: "endDate", label: "End Date", type: "date" },
    {
      name: "isCurrent",
      label: "Currently Working Here",
      type: "checkbox",
      defaultValue: false,
    },

    // Description
    {
      name: "description",
      label: "Job Description",
      type: "textarea",
      rows: 4,
      placeholder: "Leading development of enterprise web apps...",
    },

    // Display options
    { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 },
    {
      name: "highlighted",
      label: "Highlight This Experience",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "isPublished",
      label: "Published",
      type: "checkbox",
      defaultValue: true,
    },
    // Note: Achievements are handled separately as a dynamic list
    // Note: Technologies (many-to-many) would need special handling
  ],
  publications: [
    // Basic content
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
      placeholder: "e.g., Advanced Machine Learning Techniques",
    },
    {
      name: "subtitle",
      label: "Subtitle",
      type: "text",
      placeholder: "Brief subtitle...",
    },
    {
      name: "meta",
      label: "Meta Information",
      type: "text",
      placeholder: "Additional metadata...",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      rows: 4,
      placeholder: "Brief description of the publication...",
    },
    {
      name: "link",
      label: "Publication URL",
      type: "url",
      placeholder: "https://...",
    },

    // Media
    {
      name: "imageUrl",
      label: "Image URL",
      type: "url",
      placeholder: "https://...",
    },
    {
      name: "useGradient",
      label: "Use Gradient Background",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "showImage",
      label: "Show Image",
      type: "checkbox",
      defaultValue: true,
    },

    // Publication specific
    { name: "year", label: "Year", type: "text", placeholder: "e.g., 2024" },
    {
      name: "doi",
      label: "DOI",
      type: "text",
      placeholder: "e.g., 10.1000/xyz123",
    },
    {
      name: "journalName",
      label: "Journal Name",
      type: "text",
      placeholder: "e.g., Nature",
    },
    {
      name: "conferenceName",
      label: "Conference Name",
      type: "text",
      placeholder: "e.g., ICML 2024",
    },
    {
      name: "publicationType",
      label: "Publication Type",
      type: "select",
      options: [
        { value: "", label: "Select Type" },
        {
          value: "Journal Article",
          label: "Journal Article",
          tooltip: "A peer-reviewed journal article",
        },
        {
          value: "Conference Paper",
          label: "Conference Paper",
          tooltip: "A conference paper or presentation",
        },
        {
          value: "Book Chapter",
          label: "Book Chapter",
          tooltip: "A chapter from a published book",
        },
        {
          value: "Technical Report",
          label: "Technical Report",
          tooltip: "A technical report or white paper",
        },
        {
          value: "Thesis",
          label: "Thesis",
          tooltip: "A doctoral thesis or dissertation",
        },
        {
          value: "Preprint",
          label: "Preprint",
          tooltip: "A preprint of a research paper",
        },
        {
          value: "Other",
          label: "Other",
          tooltip: "Any other type of publication",
        },
      ],
    },

    // Display options
    {
      name: "variant",
      label: "Variant",
      type: "select",
      defaultValue: "default",
      options: [
        { value: "default", label: "Default" },
        {
          value: "article",
          label: "Article",
          tooltip: "Display as an article card",
        },
        {
          value: "publication",
          label: "Academic Publication",
          tooltip: "Display as an academic publication card",
        },
        {
          value: "report",
          label: "Report",
          tooltip: "Display as a report card",
        },
        {
          value: "project",
          label: "Project",
          tooltip: "Display as a project card",
        },
      ],
    },
    {
      name: "size",
      label: "Size",
      type: "select",
      defaultValue: "md",
      options: [
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
      ],
    },
    {
      name: "fullWidth",
      label: "Full Width",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "elevated",
      label: "Elevated",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "bordered",
      label: "Bordered",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "clickable",
      label: "Clickable",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "featured",
      label: "Featured",
      type: "checkbox",
      defaultValue: false,
    },

    // Metadata
    { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 },
    {
      name: "isPublished",
      label: "Published",
      type: "checkbox",
      defaultValue: true,
    },
    // Note: Tags and Metrics would need special handling as arrays
  ],
  resumes: [
    {
      name: "title",
      label: "Resume Title",
      type: "text",
      required: true,
      placeholder: "e.g., Senior Software Engineer Resume",
    },
    {
      name: "summary",
      label: "Professional Summary",
      type: "textarea",
      rows: 6,
      placeholder:
        "Brief professional summary highlighting your key skills and experience...",
    },

    // Contact Information
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "e.g., John Doe",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "e.g., john.doe@example.com",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text",
      placeholder: "e.g., +1 234 567 8900",
    },
    {
      name: "location",
      label: "Location",
      type: "text",
      placeholder: "e.g., San Francisco, CA",
    },
    // Note: Skills, Education, etc. are separate entities linked to Resume
  ],
};

const AddNewEntity = () => {
  const navigate = useNavigate();
  const { entityType } = useParams<{ entityType: string }>();
  const { isAuthenticated, loading: authLoding } = useAuth();
  const { addNotification } = useNotifications();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<
    Record<string, string | number | boolean>
  >({});
  const [achievements, setAchievements] = useState<WorkAchievementRequest[]>([
    { text: "" },
  ]);
  const [loadingResumes, setLoadingResumes] = useState<boolean>(false);
  const [resumeSchema, setResumeSchema] = useState<FormField[]>([]);

  const entity = ENTITY_TYPES.find((e) => e.id === entityType);
  // Use dynamic resume schema for work-experiences, otherwise use static schema
  const formSchema =
    entityType === "work-experiences" && resumeSchema.length > 0
      ? resumeSchema
      : entityType
      ? FORM_SCHEMAS[entityType]
      : undefined;

  // Fetch resumes for work-experiences entity type
  useEffect(() => {
    const loadResumes = async () => {
      if (entityType === "work-experiences" && isAuthenticated) {
        setLoadingResumes(true);
        try {
          const userResumes = await fetchResumes(true); // Fetch only user's resumes

          // Build dynamic schema with resume options
          const resumeOptions = [
            { value: "", label: "-- Create default resume --" },
            ...userResumes.map((resume) => ({
              value: resume.id,
              label: resume.title || "Untitled Resume",
            })),
          ];

          // Create updated schema with resume options
          const updatedSchema = FORM_SCHEMAS["work-experiences"].map(
            (field) => {
              if (field.name === "resumeId") {
                return {
                  ...field,
                  options: resumeOptions,
                };
              }
              return field;
            }
          );

          setResumeSchema(updatedSchema);

          // Set the first resume as default if available
          if (userResumes.length > 0) {
            setFormData((prev) => ({
              ...prev,
              resumeId: userResumes[0].id,
            }));
          }
        } catch (err) {
          console.error("Failed to load resumes:", err);
          setError("Failed to load resumes. You can still create a work experience and a default resume will be created.");
        } finally {
          setLoadingResumes(false);
        }
      }
    };

    loadResumes();
  }, [entityType, isAuthenticated]);


  // Initialize form with default values
  useEffect(() => {
    if (formSchema && entityType !== "work-experiences") {
      const initialData: Record<string, string | number | boolean> = {};
      formSchema.forEach((field) => {
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue;
        } else if (field.type === "date") {
          initialData[field.name] = new Date().toISOString().split("T")[0];
        }
      });
      setFormData(initialData);
    }
  }, [formSchema, entityType]);

  // Initialize form data for work-experiences separately (after resumes are loaded)
  useEffect(() => {
    if (
      entityType === "work-experiences" &&
      resumeSchema.length > 0 &&
      !loadingResumes
    ) {
      const initialData: Record<string, string | number | boolean> = {};
      resumeSchema.forEach((field) => {
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue;
        } else if (field.type === "date") {
          initialData[field.name] = new Date().toISOString().split("T")[0];
        }
      });
      // Keep resumeId if already set
      if (formData.resumeId) {
        initialData.resumeId = formData.resumeId;
      }
      setFormData((prev) => ({ ...initialData, ...prev }));
    }
  }, [resumeSchema, loadingResumes, entityType]);

  useEffect(() => {
    if (!authLoding && !isAuthenticated) {
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(
        window.location.href
      )}`;
    }
  }, [authLoding, isAuthenticated]);

  const handleInputChange = (
    fieldName: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleAchievementChange = (index: number, value: string) => {
    const updated = [...achievements];
    updated[index] = { text: value };
    setAchievements(updated);
  };

  const addAchievement = () => {
    setAchievements([...achievements, { text: "" }]);
  };

  const removeAchievement = (index: number) => {
    const updated = achievements.filter((_, i) => i !== index);
    setAchievements(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (entityType === "work-experiences") {
        const request: WorkExperienceRequest = {
          resumeId: formData.resumeId && String(formData.resumeId).trim() !== "" 
            ? String(formData.resumeId) 
            : undefined,
          jobTitle: String(formData.jobTitle || ""),
          companyName: String(formData.companyName || ""),
          location: formData.location ? String(formData.location) : undefined,
          startDate: String(formData.startDate || ""),
          endDate: formData.endDate ? String(formData.endDate) : undefined,
          isCurrent: Boolean(formData.isCurrent),
          description: formData.description
            ? String(formData.description)
            : undefined,
          achievements: achievements.filter((a) => a.text.trim() !== ""),
          sortOrder: Number(formData.sortOrder || 0),
          highlighted: Boolean(formData.highlighted),
          isPublished: Boolean(formData.isPublished),
          isAdminEdit: true,
        };
        
        console.log('Creating work experience with request:', request);

        await Promise.all([createWorkExperience(request)])
          .then(() => {
            if (!formData.resumeId) {
              addNotification(
                "success",
                "Work experience created! A default 'Untitled Resume' was created. Please update its details later."
              );
            } else {
              addNotification("success", "Work experience created successfully!");
            }
            navigate(`/admin/entities/work-experiences`);
          })
          .catch((err) => {
            console.error("Failed to create work experience:", err);
            setError("Failed to create work experience. Please try again.");
          });
      } else if (entityType === "resumes") {
        const request: CreateResumeRequest = {
          title: String(formData.title || ""),
          summary: formData.summary ? String(formData.summary) : undefined,
          contact: {
            fullName: String(formData.fullName || ""),
            email: String(formData.email || ""),
            phone: String(formData.phone || ""),
            location: String(formData.location || ""),
          },
        };
        await Promise.all([createResume(request)])
          .then(() => {
            addNotification("success", "Resume created successfully!");
            navigate(`/admin/entities/resumes`);
          })
          .catch((err) => {
            console.error("Failed to create resume:", err);
            setError("Failed to create a default resume. Please try again.");
          });
      } else if (entityType === "publications") {
        const request: Omit<PublicationDto, "id"> = {
          // Basic content
          title: String(formData.title || ""),
          subtitle: formData.subtitle ? String(formData.subtitle) : undefined,
          meta: formData.meta ? String(formData.meta) : undefined,
          description: formData.description
            ? String(formData.description)
            : undefined,
          link: formData.link ? String(formData.link) : undefined,

          // Media
          imageUrl: formData.imageUrl ? String(formData.imageUrl) : undefined,
          useGradient: Boolean(formData.useGradient),
          showImage: Boolean(formData.showImage),

          // Publication specific
          year: formData.year ? String(formData.year) : undefined,
          doi: formData.doi ? String(formData.doi) : undefined,
          journalName: formData.journalName
            ? String(formData.journalName)
            : undefined,
          conferenceName: formData.conferenceName
            ? String(formData.conferenceName)
            : undefined,
          publicationType: formData.publicationType
            ? String(formData.publicationType)
            : undefined,

          // Display options
          variant: formData.variant ? String(formData.variant) : "default",
          size: formData.size ? String(formData.size) : "md",
          fullWidth: Boolean(formData.fullWidth),
          elevated: Boolean(formData.elevated),
          bordered: Boolean(formData.bordered),
          clickable: Boolean(formData.clickable),
          featured: Boolean(formData.featured),

          // Metadata
          isPublished: Boolean(formData.isPublished),
        };
        await Promise.all([createPublication(request)])
          .then(() => {
            addNotification("success", "Publication created successfully!");
          })
          .catch((err) => {
            console.error("Failed to create publication:", err);
            setError("Failed to create a default resume. Please try again.");
          });
      }
      // Navigate back to entity list
      navigate(`/admin/entities/${entityType}`);
    } catch (err) {
      const errorMessage =
        "Failed to create entity: " +
        (err instanceof Error ? err.message : String(err));
      setError(errorMessage);
      addNotification("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!entity || !formSchema) {
    return <div>Entity type not found or form schema not configured</div>;
  }

  // Show loading state while fetching resumes for work-experiences
  if (entityType === "work-experiences" && loadingResumes) {
    return (
      <div className="entity-form-container">
        <header>
          <h1>Add New {entity.displayName}</h1>
        </header>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          Loading resumes...
        </div>
      </div>
    );
  }

  const renderField = (field: FormField) => {
    const value = formData[field.name];

    if (field.type === "checkbox") {
      return (
        <div key={field.name} className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
            />
            <span>{field.label}</span>
          </label>
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div key={field.name} className="form-group">
          <label>
            {field.label} {field.required && "*"}
          </label>
          <select
            value={value !== undefined ? String(value) : ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <div key={field.name} className="form-group">
          <label>
            {field.label} {field.required && "*"}
          </label>
          <textarea
            rows={field.rows || 4}
            value={(value as string) || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        </div>
      );
    }

    return (
      <div key={field.name} className="form-group">
        <label>
          {field.label} {field.required && "*"}
        </label>
        <input
          type={field.type}
          value={value !== undefined ? String(value) : ""}
          onChange={(e) => {
            const newValue =
              field.type === "number" ? Number(e.target.value) : e.target.value;
            handleInputChange(field.name, newValue);
          }}
          placeholder={field.placeholder}
          required={field.required}
        />
      </div>
    );
  };

  return (
    <div className="entity-form-container">
      <header>
        <h1>Add New {entity.displayName}</h1>
        <Button
          onClick={() => navigate(`/admin/entities/${entityType}`)}
          variant="secondary"
        >
          ← Back to {entity.displayName}
        </Button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="entity-form">
        {formSchema.map((field) => renderField(field))}

        {/* Achievements section for work experiences */}
        {entityType === "work-experiences" && (
          <div className="form-group">
            <label>Achievements</label>
            {achievements.map((achievement, index) => (
              <div key={index} className="achievement-item">
                <input
                  type="text"
                  value={achievement.text}
                  onChange={(e) =>
                    handleAchievementChange(index, e.target.value)
                  }
                  placeholder="Describe an achievement..."
                />
                {achievements.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeAchievement(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addAchievement}
            >
              + Add Achievement
            </button>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : `Create ${entity.displayName}`}
          </button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/admin/entities/${entityType}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddNewEntity;
