import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPublicationById, updatePublication } from "../../../services/publicationService";
import type { PublicationDto } from "../../../services/publicationService";
import { useAuth } from "@asafarim/shared-ui-react";
import "./pub-styles.css";

const EditPublication: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const publicationId = parseInt(id || '0', 10);
  
  // Use the shared auth hook to get user and admin status
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const isAdmin = user?.roles?.map((role: string) => role.toLowerCase()).includes('admin') || false;
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  // Store the original userId to preserve ownership
  const [originalUserId, setOriginalUserId] = useState<string>("");
  
  // Form state
  const [formData, setFormData] = useState<Omit<PublicationDto, 'id'> & { userId?: string }>({
    title: "",
    subtitle: "",
    meta: "",
    description: "",
    link: "",
    imageUrl: "",
    useGradient: false,
    tags: [],
    year: "",
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
    publicationType: "academic",
    showImage: false,
    userId: ""
  });

  // Check if user is authenticated
  useEffect(() => {
    // Only redirect after authentication check is complete
    if (!authLoading && !isAuthenticated) {
      // Redirect to the identity subdomain login page
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(window.location.href)}`;
    }
  }, [authLoading, isAuthenticated, id]);

  // Load publication data
  useEffect(() => {
    const loadPublication = async () => {
      if (!publicationId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const publication = await fetchPublicationById(publicationId);
        
        if (!publication) {
          setNotFound(true);
          return;
        }
        
        // Store the original userId for admin updates
        const pubUserId = (publication as unknown as { userId?: string }).userId || "";
        setOriginalUserId(pubUserId);
        console.log('Original publication userId:', pubUserId);
        
        // Convert publication to form data
        setFormData({
          title: publication.title || "",
          subtitle: publication.subtitle || "",
          meta: publication.meta || "",
          description: publication.description || "",
          link: publication.link || "",
          imageUrl: publication.imageUrl || "",
          useGradient: publication.useGradient || false,
          tags: publication.tags || [],
          year: publication.year?.toString() || "",
          metrics: publication.metrics || [],
          variant: publication.variant || "publication",
          size: publication.size || "md",
          fullWidth: publication.fullWidth || false,
          elevated: publication.elevated || false,
          bordered: publication.bordered !== false, // Default to true if undefined
          clickable: publication.clickable || false,
          featured: publication.featured || false,
          doi: publication.doi || "",
          journalName: publication.journalName || "",
          conferenceName: publication.conferenceName || "",
          publicationType: publication.publicationType || "academic",
          // Make sure to properly read the showImage property
          showImage: publication.showImage !== undefined ? publication.showImage : false,
          userId: (publication as unknown as { userId?: string }).userId || "" // Type-safe casting
        });
        
        setError(null);
      } catch (err) {
        setError("Failed to load publication data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && publicationId) {
      loadPublication();
    }
  }, [isAuthenticated, publicationId]);

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
      // Prepare the data for submission
      // Convert empty strings to undefined to avoid sending empty values
      const preparedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => {
          // Convert empty strings to undefined
          if (value === "") return [key, undefined];
          // Keep other values as is
          return [key, value];
        })
      ) as Omit<PublicationDto, 'id'>;
      
      // If admin is editing someone else's publication, ensure we preserve the original userId
      if (isAdmin && originalUserId && originalUserId !== user?.id) {
        console.log('Admin is editing another user\'s publication. Preserving original userId:', originalUserId);
        preparedData.userId = originalUserId;
      }
      
      // Add admin flag to the request if the user is an admin
      if (isAdmin) {
        (preparedData as any).isAdminEdit = true;
      }
      
      console.log('Submitting publication data:', preparedData);
      
      const success = await updatePublication(publicationId, preparedData);
      if (success) {
        navigate('/portfolio/publications/manage');
      } else {
        setError("Failed to update publication");
      }
    } catch (err) {
      setError("An error occurred while updating the publication");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="edit-publication">Redirecting to login...</div>;
  }

  if (isLoading) {
    return (
      <div className="edit-publication">
        <div className="edit-publication-container">
          <h1 className="edit-publication-title">Edit Publication</h1>
          <div className="loading-spinner"></div>
          <p>Loading publication data...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="edit-publication">
        <div className="edit-publication-container">
          <h1 className="edit-publication-title">Publication Not Found</h1>
          <p>The publication you're trying to edit could not be found or you don't have permission to edit it.</p>
          <button
            onClick={() => navigate('/portfolio/publications/manage')}
            className="form-button form-button-primary"
          >
            Back to Manage Publications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-publication">
      <div className="edit-publication-container">
        <h1 className="edit-publication-title">Edit Publication</h1>
        
        {error && (
          <div className="edit-publication-error">
            {error}
          </div>
        )}
      
        <form onSubmit={handleSubmit} className="edit-publication-form">
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
              onClick={() => navigate('/portfolio/publications/manage')}
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
              {isSubmitting ? 'Updating...' : 'Update Publication'}
            </button>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPublication;
