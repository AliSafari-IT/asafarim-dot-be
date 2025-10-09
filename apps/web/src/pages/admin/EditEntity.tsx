import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ButtonComponent as Button, useAuth, useNotifications } from "@asafarim/shared-ui-react";
import { ENTITY_TYPES } from "../../services/entityService";
import { 
  fetchWorkExperienceById,
  updateWorkExperience, 
  type WorkExperienceRequest,
  type WorkAchievementRequest 
} from "../../services/workExperienceService";
import { fetchResumes, updateResume, fetchResumeById, type UpdateResumeRequest } from "../../services/resumeApi";
import { fetchPublicationById, updatePublication, type PublicationDto } from "../../services/publicationService";
import "./entity-management.css";

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'url' | 'date' | 'number' | 'checkbox' | 'select';
  required?: boolean;
  placeholder?: string;
  rows?: number;
  defaultValue?: string | number | boolean;
  options?: { value: string; label: string, tooltip?: string }[];
}

// Define form schemas for each entity type - matching backend models exactly
const FORM_SCHEMAS: Record<string, FormField[]> = {
  'work-experiences': [
    // Basic details
    { name: 'resumeId', label: 'Resume', type: 'select', required: true, options: [] },
    { name: 'jobTitle', label: 'Job Title', type: 'text', required: true, placeholder: 'e.g., Senior Full Stack Developer' },
    { name: 'companyName', label: 'Company Name', type: 'text', required: true, placeholder: 'e.g., Tech Company' },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Brussels, Belgium' },
    
    // Dates
    { name: 'startDate', label: 'Start Date', type: 'date', required: true },
    { name: 'endDate', label: 'End Date', type: 'date' },
    { name: 'isCurrent', label: 'Currently Working Here', type: 'checkbox', defaultValue: false },
    
    // Description
    { name: 'description', label: 'Job Description', type: 'textarea', rows: 4, placeholder: 'Leading development of enterprise web apps...' },
    
    // Display options
    { name: 'sortOrder', label: 'Sort Order', type: 'number', defaultValue: 0 },
    { name: 'highlighted', label: 'Highlight This Experience', type: 'checkbox', defaultValue: false },
    { name: 'isPublished', label: 'Published', type: 'checkbox', defaultValue: true }
  ],
  'publications': [
    // Basic content
    { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g., Advanced Machine Learning Techniques' },
    { name: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Brief subtitle...' },
    { name: 'meta', label: 'Meta Information', type: 'text', placeholder: 'Additional metadata...' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 4, placeholder: 'Brief description of the publication...' },
    { name: 'link', label: 'Publication URL', type: 'url', placeholder: 'https://...' },
    
    // Media
    { name: 'imageUrl', label: 'Image URL', type: 'url', placeholder: 'https://...' },
    { name: 'useGradient', label: 'Use Gradient Background', type: 'checkbox', defaultValue: false },
    { name: 'showImage', label: 'Show Image', type: 'checkbox', defaultValue: true },
    
    // Publication specific
    { name: 'year', label: 'Year', type: 'text', placeholder: 'e.g., 2024' },
    { name: 'doi', label: 'DOI', type: 'text', placeholder: 'e.g., 10.1000/xyz123' },
    { name: 'journalName', label: 'Journal Name', type: 'text', placeholder: 'e.g., Nature' },
    { name: 'conferenceName', label: 'Conference Name', type: 'text', placeholder: 'e.g., ICML 2024' },
    { 
      name: 'publicationType', 
      label: 'Publication Type', 
      type: 'select',
      options: [
        { value: '', label: 'Select Type' },
        { value: 'Journal Article', label: 'Journal Article', tooltip: 'A peer-reviewed journal article' },
        { value: 'Conference Paper', label: 'Conference Paper', tooltip: 'A conference paper or presentation' },
        { value: 'Book Chapter', label: 'Book Chapter', tooltip: 'A chapter from a published book' },
        { value: 'Technical Report', label: 'Technical Report', tooltip: 'A technical report or white paper' },
        { value: 'Thesis', label: 'Thesis', tooltip: 'A doctoral thesis or dissertation' },
        { value: 'Preprint', label: 'Preprint', tooltip: 'A preprint of a research paper' },
        { value: 'Other', label: 'Other', tooltip: 'Any other type of publication' }
      ]
    },
    
    // Display options
    { 
      name: 'variant', 
      label: 'Variant', 
      type: 'select',
      defaultValue: 'default',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'article', label: 'Article', tooltip: 'Display as an article card' },
        { value: 'publication', label: 'Academic Publication', tooltip: 'Display as an academic publication card' },
        { value: 'report', label: 'Report', tooltip: 'Display as a report card' },
        { value: 'project', label: 'Project', tooltip: 'Display as a project card' }
      ]
    },
    { 
      name: 'size', 
      label: 'Size', 
      type: 'select',
      defaultValue: 'md',
      options: [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' }
      ]
    },
    { name: 'fullWidth', label: 'Full Width', type: 'checkbox', defaultValue: false },
    { name: 'elevated', label: 'Elevated', type: 'checkbox', defaultValue: false },
    { name: 'bordered', label: 'Bordered', type: 'checkbox', defaultValue: true },
    { name: 'clickable', label: 'Clickable', type: 'checkbox', defaultValue: false },
    { name: 'featured', label: 'Featured', type: 'checkbox', defaultValue: false },
    
    // Metadata
    { name: 'sortOrder', label: 'Sort Order', type: 'number', defaultValue: 0 },
    { name: 'isPublished', label: 'Published', type: 'checkbox', defaultValue: true }
  ],
  'resumes': [
    { name: 'title', label: 'Resume Title', type: 'text', required: true, placeholder: 'e.g., Senior Software Engineer Resume' },
    { name: 'summary', label: 'Professional Summary', type: 'textarea', rows: 6, placeholder: 'Brief professional summary highlighting your key skills and experience...' },
    
    // Contact Information
    { name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g., John Doe' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'e.g., john.doe@example.com' },
    { name: 'phone', label: 'Phone', type: 'text', placeholder: 'e.g., +1 234 567 8900' },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g., San Francisco, CA' }
  ]
};

const EditEntity = () => {
  const navigate = useNavigate();
  const { entityType, id } = useParams<{ entityType: string; id: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const [achievements, setAchievements] = useState<WorkAchievementRequest[]>([{ text: "" }]);
  const [resumeSchema, setResumeSchema] = useState<FormField[]>([]);
  const [loadingResumes, setLoadingResumes] = useState<boolean>(false);

  const entity = ENTITY_TYPES.find((e) => e.id === entityType);
  // Use dynamic resume schema for work-experiences, otherwise use static schema
  const formSchema = entityType === 'work-experiences' && resumeSchema.length > 0 
    ? resumeSchema 
    : entityType ? FORM_SCHEMAS[entityType] : undefined;

  // Fetch resumes for work-experiences entity type
  useEffect(() => {
    const loadResumes = async () => {
      if (entityType === 'work-experiences' && isAuthenticated) {
        setLoadingResumes(true);
        try {
          const userResumes = await fetchResumes(true);
          
          const resumeOptions = userResumes.map(resume => ({
            value: resume.id,
            label: resume.title || 'Untitled Resume'
          }));
          
          const updatedSchema = FORM_SCHEMAS['work-experiences'].map(field => {
            if (field.name === 'resumeId') {
              return {
                ...field,
                options: resumeOptions
              };
            }
            return field;
          });
          
          setResumeSchema(updatedSchema);
        } catch (err) {
          console.error('Failed to load resumes:', err);
        } finally {
          setLoadingResumes(false);
        }
      }
    };
    
    loadResumes();
  }, [entityType, isAuthenticated]);

  // Load entity data
  useEffect(() => {
    const loadEntityData = async () => {
      if (!id || !isAuthenticated) return;
      
      try {
        setIsLoading(true);
        
        if (entityType === 'work-experiences') {
          const data = await fetchWorkExperienceById(id);
          if (data) {
            setFormData({
              resumeId: '', // Will be set from backend if available
              jobTitle: data.jobTitle,
              companyName: data.companyName,
              location: data.location || '',
              startDate: data.startDate.split('T')[0],
              endDate: data.endDate ? data.endDate.split('T')[0] : '',
              isCurrent: data.isCurrent,
              description: data.description || '',
              sortOrder: data.sortOrder,
              highlighted: data.highlighted,
              isPublished: data.isPublished
            });
            
            if (data.achievements && data.achievements.length > 0) {
              setAchievements(data.achievements.map(a => ({ text: a.text })));
            }
          } else {
            setError("Work experience not found");
          }
        } else if (entityType === 'resumes') {
          const data = await fetchResumeById(id);
          if (data) {
            setFormData({
              title: data.title,
              summary: data.summary || '',
              fullName: data.contact?.fullName || '',
              email: data.contact?.email || '',
              phone: data.contact?.phone || '',
              location: data.contact?.location || ''
            });
          } else {
            setError("Resume not found");
          }
        } else if (entityType === 'publications') {
          const data = await fetchPublicationById(id);
          if (data) {
            setFormData({
              title: data.title,
              subtitle: data.subtitle || '',
              meta: data.meta || '',
              description: data.description || '',
              link: data.link || '',
              imageUrl: data.imageUrl || '',
              useGradient: data.useGradient || false,
              showImage: data.showImage !== false,
              year: data.year || '',
              doi: data.doi || '',
              journalName: data.journalName || '',
              conferenceName: data.conferenceName || '',
              publicationType: data.publicationType || '',
              variant: data.variant || 'default',
              size: data.size || 'md',
              fullWidth: data.fullWidth || false,
              elevated: data.elevated || false,
              bordered: data.bordered !== false,
              clickable: data.clickable || false,
              featured: data.featured || false,
              sortOrder: data.sortOrder || 0,
              isPublished: data.isPublished !== false
            });
          } else {
            setError("Publication not found");
          }
        }
      } catch (err) {
        console.error("Error loading entity:", err);
        setError("Failed to load entity data");
      } finally {
        setIsLoading(false);
      }
    };

    loadEntityData();
  }, [id, entityType, isAuthenticated]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(
        window.location.href
      )}`;
    }
  }, [authLoading, isAuthenticated]);

  const handleInputChange = (fieldName: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
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
      if (entityType === 'work-experiences' && id) {
        const request: WorkExperienceRequest = {
          jobTitle: String(formData.jobTitle || ''),
          companyName: String(formData.companyName || ''),
          location: formData.location ? String(formData.location) : undefined,
          startDate: String(formData.startDate || ''),
          endDate: formData.endDate ? String(formData.endDate) : undefined,
          isCurrent: Boolean(formData.isCurrent),
          description: formData.description ? String(formData.description) : undefined,
          achievements: achievements.filter(a => a.text.trim() !== ''),
          sortOrder: Number(formData.sortOrder || 0),
          highlighted: Boolean(formData.highlighted),
          isPublished: Boolean(formData.isPublished),
          isAdminEdit: true
        };
        
        console.log('Updating work experience with achievements:', request.achievements);
        await updateWorkExperience(id, request);
        addNotification("success", "Work experience updated successfully!");
      } else if (entityType === 'resumes' && id) {
        const request: UpdateResumeRequest = {
          title: String(formData.title || ''),
          summary: formData.summary ? String(formData.summary) : undefined,
          contact: {
            fullName: String(formData.fullName || ''),
            email: String(formData.email || ''),
            phone: String(formData.phone || ''),
            location: String(formData.location || '')
          }
        };
        await updateResume(id, request);
        addNotification("success", "Resume updated successfully!");
      } else if (entityType === 'publications' && id) {
        const request: PublicationDto = {
          id: id,
          title: String(formData.title || ''),
          subtitle: formData.subtitle ? String(formData.subtitle) : undefined,
          meta: formData.meta ? String(formData.meta) : undefined,
          description: formData.description ? String(formData.description) : undefined,
          link: formData.link ? String(formData.link) : undefined,
          imageUrl: formData.imageUrl ? String(formData.imageUrl) : undefined,
          useGradient: Boolean(formData.useGradient),
          showImage: Boolean(formData.showImage),
          year: formData.year ? String(formData.year) : undefined,
          doi: formData.doi ? String(formData.doi) : undefined,
          journalName: formData.journalName ? String(formData.journalName) : undefined,
          conferenceName: formData.conferenceName ? String(formData.conferenceName) : undefined,
          publicationType: formData.publicationType ? String(formData.publicationType) : undefined,
          variant: formData.variant ? String(formData.variant) : 'default',
          size: formData.size ? String(formData.size) : 'md',
          fullWidth: Boolean(formData.fullWidth),
          elevated: Boolean(formData.elevated),
          bordered: Boolean(formData.bordered),
          clickable: Boolean(formData.clickable),
          featured: Boolean(formData.featured),
          isPublished: Boolean(formData.isPublished)
        };
        await updatePublication(parseInt(id), request);
        addNotification("success", "Publication updated successfully!");
      }

      // Navigate back to entity list
      navigate(`/admin/entities/${entityType}`);
    } catch (err) {
      const errorMessage = "Failed to update entity: " + (err instanceof Error ? err.message : String(err));
      setError(errorMessage);
      addNotification("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!entity || !formSchema) {
    return <div>Entity type not found or form schema not configured</div>;
  }
  
  // Show loading state
  if (isLoading || (entityType === 'work-experiences' && loadingResumes)) {
    return (
      <div className="entity-form-container">
        <header>
          <h1>Edit {entity.displayName}</h1>
        </header>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          Loading...
        </div>
      </div>
    );
  }

  const renderField = (field: FormField) => {
    const value = formData[field.name];

    if (field.type === 'checkbox') {
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

    if (field.type === 'select') {
      return (
        <div key={field.name} className="form-group">
          <label>
            {field.label} {field.required && '*'}
          </label>
          <select
            value={value !== undefined ? String(value) : ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.name} className="form-group">
          <label>
            {field.label} {field.required && '*'}
          </label>
          <textarea
            rows={field.rows || 4}
            value={(value as string) || ''}
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
          {field.label} {field.required && '*'}
        </label>
        <input
          type={field.type}
          value={value !== undefined ? String(value) : ''}
          onChange={(e) => {
            const newValue = field.type === 'number' ? Number(e.target.value) : e.target.value;
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
        <h1>Edit {entity.displayName}</h1>
        <Button
          onClick={() => navigate(`/admin/entities/${entityType}`)}
          variant="secondary"
        >
          ← Back to {entity.displayName}
        </Button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="entity-form">
        {formSchema.map(field => renderField(field))}

        {/* Achievements section for work experiences */}
        {entityType === 'work-experiences' && (
          <div className="form-group">
            <label>Achievements</label>
            {achievements.map((achievement, index) => (
              <div key={index} className="achievement-item">
                <input
                  type="text"
                  value={achievement.text}
                  onChange={(e) => handleAchievementChange(index, e.target.value)}
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
            {isSubmitting ? "Updating..." : `Update ${entity.displayName}`}
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

export default EditEntity;
