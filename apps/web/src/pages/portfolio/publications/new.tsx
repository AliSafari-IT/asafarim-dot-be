import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPublication } from "../../../services/publicationService";
import type { PublicationDto } from "../../../services/publicationService";
import "./pub-styles.css";
import PublicationActionsBar from "./components/PublicationActionsBar";
import { contentType, defaultContentType, PROJECT_VARIANTS, PUBLICATION_VARIANTS } from "./data";
import { Heading } from "@asafarim/shared-ui-react";

const BASE_URL = contentType === 'projects' ? '/portfolio/projects' : '/portfolio/publications';
const typeOptions = contentType === 'projects' ? PROJECT_VARIANTS : PUBLICATION_VARIANTS;
const NewDocument: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [publicationType, setPublicationType] = useState<string>('academic');

  // Form state
  const [formData, setFormData] = useState<Omit<PublicationDto, 'id'> & { tagsInput?: string }>({
    title: "",
    subtitle: "",
    meta: "",
    description: "",
    link: "",
    imageUrl: "",
    useGradient: false,
    tags: [],
    year: new Date().getFullYear().toString(),
    metrics: [],
    variant: defaultContentType,
    size: "md",
    fullWidth: false,
    elevated: true,
    bordered: true,
    clickable: false,
    featured: false,
    doi: "",
    journalName: "",
    conferenceName: "",
    publicationType,
    tagsInput: ""
  });

  // Check if user is logged in
  useEffect(() => {
    const token = document.cookie.includes('atk=') || localStorage.getItem('auth_token');
    setIsLoggedIn(!!token);
    
    if (!token) {
      // Redirect to the identity subdomain login page
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(window.location.href)}`;
    }
  }, []);

  // Validate contentType and redirect if invalid
  useEffect(() => {
    const validContentTypes = ['projects', 'publications'];
    if (contentType && !validContentTypes.includes(contentType)) {
      // Redirect to publications if contentType is invalid
      navigate('/portfolio/publications', { replace: true });
    }
  }, [contentType, navigate]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (name === 'variant' && value !== 'publication') {
      setPublicationType('non-academic');
    }
    if (name === 'variant' && value === 'publication') {
      setPublicationType('academic');
    }
    if (name === 'publicationType') {
      setPublicationType(value);
      if (value !== 'academic') {
        setFormData(prev => ({ ...prev, doi: '' }));
      }
    }
  };

  // Handle tags input
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // For now, just store the raw input value
    // We'll process it when the user finishes editing
    setFormData(prev => ({ ...prev, tagsInput: e.target.value }));
  };

  // Handle tags input finish (on blur, enter, or tab)
  const handleTagsFinish = () => {
    if (formData.tagsInput && formData.tagsInput.trim()) {
      const newTagsArray: string[] = formData.tagsInput
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag !== '');

      // Combine existing tags with new tags, avoiding duplicates
      const combinedTags = [...(formData.tags || []), ...newTagsArray];
      const uniqueTags = Array.from(new Set(combinedTags));

      setFormData(prev => ({ ...prev, tags: uniqueTags, tagsInput: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      setError("Title is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await createPublication(formData);

      if (result) {
        navigate(BASE_URL + '?myPublications=true');
      } else {
        setError("Failed to create publication");
      }
    } catch (err) {
      setError("An error occurred while creating the publication");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return <div className="new-document">Redirecting to login...</div>;
  }

  return (
    <div className="new-document">
      <PublicationActionsBar />
      <div className="new-document-container">
        <Heading level={1} variant="h3" align="left" weight="bold" color="secondary" marginBottom="xs" uppercase={false}>
          Add New {contentType === 'projects' ? 'Project' : 'Publication'}
        </Heading>
        
        {error && (
          <div className="new-document-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="new-document-form">
          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-field-full form-section">
              <h2 className="form-section-title">Basic Information</h2>
              
              <div className="form-field">
                <label className="form-label required-field">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">Subtitle / Authors</label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle || ''}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">Meta Information</label>
                <input
                  type="text"
                  name="meta"
                  value={formData.meta || ''}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Brief summary or keywords (e.g. Journal Name, Date, etc.)"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  className="form-textarea"
                  rows={4}
                />
              </div>
            </div>
            
            {/* Document Details */}
            <div className="form-field-full form-section">
              <h2 className="form-section-title">Document Details</h2>
              
              <div className="form-field">
                <label className="form-label">Type</label>
                <select
                  name="variant"
                  value={formData.variant}
                  onChange={handleChange}
                  className="form-select"
                >
                  {
                    typeOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.title}
                      </option>
                    ))
                  }
                </select>
              </div>
              
              <div className="form-field">
                <label className="form-label">Year</label>
                <input
                  type="text"
                  name="year"
                  value={formData.year || ''}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">DOI (for academic publications)</label>
                <select
                  name="publicationType"
                  value={publicationType}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="academic">Academic</option>
                  <option value="non-academic">Non-Academic</option>
                </select>
                <input
                  type="text"
                  name="doi"
                  value={formData.doi || ''}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 10.1061/(ASCE)HE.1943-5584.0001141"
                  disabled={ publicationType !== 'academic'}
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">Journal Name</label>
                <input
                  type="text"
                  name="journalName"
                  value={formData.journalName || ''}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">Conference Name</label>
                <input
                  type="text"
                  name="conferenceName"
                  value={formData.conferenceName || ''}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
            
            {/* Display Options */}
            <div className="form-field-full form-section">
              <h2 className="form-section-title">Display Options</h2>
              
              <div className="form-field">
                <label className="form-label">Link URL</label>
                <input
                  type="url"
                  name="link"
                  value={formData.link || ''}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="https://"
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="https://"
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">Tags (comma-separated)</label>
                <div className="tags-input-wrapper">
                  <input
                    type="text"
                    name="tags"
                    value={formData.tagsInput || ''}
                    onChange={handleTagsChange}
                    onBlur={handleTagsFinish}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTagsFinish();
                      } else if (e.key === ',') {
                        e.preventDefault();
                        handleTagsFinish();
                        // Keep focus for next tag
                      }
                    }}
                    className="form-input"
                    placeholder="e.g., web, research, javascript"
                  />
                  {formData.tagsInput && formData.tagsInput.trim() && (
                    <button
                      type="button"
                      onClick={handleTagsFinish}
                      className="tags-add-button"
                      title="Add tags"
                    >
                      +
                    </button>
                  )}
                </div>
                {formData.tags && formData.tags.length > 0 && (
                  <div className="tags-display">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="tag-badge">
                        {tag}
                        <button
                          type="button"
                          onClick={() => {
                            const newTags = formData.tags?.filter((_, i) => i !== index) || [];
                            setFormData(prev => ({ ...prev, tags: newTags }));
                          }}
                          className="tag-remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="form-field">
                <label className="form-label">Size</label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </div>
              
              <div className="form-field">
                <div className="form-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="elevated"
                    name="elevated"
                    checked={formData.elevated}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <label htmlFor="elevated">Elevated</label>
                </div>
                
                <div className="form-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="clickable"
                    name="clickable"
                    checked={formData.clickable}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <label htmlFor="clickable">Clickable</label>
                </div>
                
                <div className="form-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="fullWidth"
                    name="fullWidth"
                    checked={formData.fullWidth}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <label htmlFor="fullWidth">Full Width</label>
                </div>
                
                <div className="form-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <label htmlFor="featured">Featured</label>
                </div>
                
                <div className="form-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="useGradient"
                    name="useGradient"
                    checked={formData.useGradient}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <label htmlFor="useGradient">Use Gradient</label>
                </div>
                
                <div className="form-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="showImage"
                    name="showImage"
                    checked={formData.showImage}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <label htmlFor="showImage">Show Image</label>
                </div>
              </div>
            </div>
          
          <div className="form-buttons">
            <button
              type="button"
              onClick={() => navigate(BASE_URL)}
              className="form-button form-button-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="form-button form-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Document'}
            </button>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDocument;
