import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPublicationById, updatePublication } from "../../../services/publicationService";
import type { PublicationDto } from "../../../services/publicationService";

const EditPublication: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const publicationId = parseInt(id || '0', 10);
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  
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
    userId: ""
  });

  // Check if user is logged in
  useEffect(() => {
    const token = document.cookie.includes('atk=') || localStorage.getItem('auth_token');
    setIsLoggedIn(!!token);
    
    if (!token) {
      // Redirect to the identity subdomain login page
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(window.location.href)}`;
    }
  }, [id]);

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

    if (isLoggedIn && publicationId) {
      loadPublication();
    }
  }, [isLoggedIn, publicationId]);

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
      const success = await updatePublication(publicationId, formData);
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

  if (!isLoggedIn) {
    return <div className="p-8 text-center">Redirecting to login...</div>;
  }

  if (isLoading) {
    return (
      <div className="edit-publication p-8">
        <h1 className="text-2xl font-bold mb-6">Edit Publication</h1>
        <div className="loading-spinner"></div>
        <p>Loading publication data...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="edit-publication p-8">
        <h1 className="text-2xl font-bold mb-6">Publication Not Found</h1>
        <p>The publication you're trying to edit could not be found or you don't have permission to edit it.</p>
        <button
          onClick={() => navigate('/portfolio/publications/manage')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Manage Publications
        </button>
      </div>
    );
  }

  return (
    <div className="edit-publication p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Publication</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              
              <div>
                <label className="block mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1">Subtitle / Authors</label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">Meta Information (Journal, Date, etc.)</label>
                <input
                  type="text"
                  name="meta"
                  value={formData.meta || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  rows={4}
                />
              </div>
            </div>
            
            {/* Publication Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Publication Details</h2>
              
              <div>
                <label className="block mb-1">Type</label>
                <select
                  name="variant"
                  value={formData.variant}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="publication">Academic Publication</option>
                  <option value="project">Project / Presentation</option>
                  <option value="article">Article</option>
                  <option value="report">Report</option>
                  <option value="default">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1">Year</label>
                <input
                  type="text"
                  name="year"
                  value={formData.year || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">DOI (for academic publications)</label>
                <input
                  type="text"
                  name="doi"
                  value={formData.doi || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">Journal Name</label>
                <input
                  type="text"
                  name="journalName"
                  value={formData.journalName || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">Conference Name</label>
                <input
                  type="text"
                  name="conferenceName"
                  value={formData.conferenceName || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            
            {/* Display Options */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Display Options</h2>
              
              <div>
                <label className="block mb-1">Link URL</label>
                <input
                  type="url"
                  name="link"
                  value={formData.link || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags?.join(', ') || ''}
                  onChange={handleTagsChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">Size</label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="elevated"
                    name="elevated"
                    checked={formData.elevated}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="elevated">Elevated</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="bordered"
                    name="bordered"
                    checked={formData.bordered}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="bordered">Bordered</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="clickable"
                    name="clickable"
                    checked={formData.clickable}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="clickable">Clickable</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="featured">Featured</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="useGradient"
                    name="useGradient"
                    checked={formData.useGradient}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="useGradient">Use Gradient</label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/portfolio/publications/manage')}
              className="px-4 py-2 border rounded"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Update Publication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPublication;
