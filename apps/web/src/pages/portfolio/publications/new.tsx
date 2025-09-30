import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPublication } from "../../../services/publicationService";
import type { PublicationDto } from "../../../services/publicationService";
import "./pub-styles.css";
import PublicationActionsBar from "./components/PublicationActionsBar";

const NewPublication: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Omit<PublicationDto, 'id'>>({
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
    variant: "publication",
    size: "md",
    fullWidth: false,
    elevated: true,
    bordered: true,
    clickable: false,
    featured: false,
    doi: "",
    journalName: "",
    conferenceName: "",
    publicationType: "academic"
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

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle tags input
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    setFormData(prev => ({ ...prev, tags: tagsArray }));
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
        navigate('/portfolio/publications?myPublications=true');
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
    return <div className="new-publication">Redirecting to login...</div>;
  }

  return (
    <div className="new-publication">
      <PublicationActionsBar />
      <div className="new-publication-container">
        <h1 className="new-publication-title">Add New Publication</h1>
        
        {error && (
          <div className="new-publication-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="new-publication-form">
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
            
            {/* Publication Details */}
            <div className="form-field-full form-section">
              <h2 className="form-section-title">Publication Details</h2>
              
              <div className="form-field">
                <label className="form-label">Type</label>
                <select
                  name="variant"
                  value={formData.variant}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="publication">Academic Publication</option>
                  <option value="project">Project / Presentation</option>
                  <option value="article">Article</option>
                  <option value="report">Report</option>
                  <option value="default">Other</option>
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
                <input
                  type="text"
                  name="doi"
                  value={formData.doi || ''}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 10.1000/xyz123"
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
                <input
                  type="text"
                  name="tags"
                  value={formData.tags?.join(', ') || ''}
                  onChange={handleTagsChange}
                  className="form-input"
                  placeholder="e.g., web, research, javascript"
                />
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
              onClick={() => navigate('/portfolio/publications')}
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
              {isSubmitting ? 'Saving...' : 'Save Publication'}
            </button>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPublication;
