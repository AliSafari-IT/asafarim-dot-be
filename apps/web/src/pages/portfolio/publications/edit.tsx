import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchPublicationById,
  updatePublication,
} from "../../../services/publicationService";
import type { PublicationDto } from "../../../services/publicationService";
import { useAuth } from "@asafarim/shared-ui-react";
import { useToast } from "@asafarim/toast";
import "./pub-styles.css";
import PublicationActionsBar from "./components/PublicationActionsBar";
import { contentType, PUBLICATION_VARIANTS } from "./data";
import { PROJECT_VARIANTS } from "./data";

const BASE_URL =
  contentType === "projects"
    ? "/portfolio/projects"
    : "/portfolio/publications";
const typeOptions =
  contentType === "projects" ? PROJECT_VARIANTS : PUBLICATION_VARIANTS;
const defaultVariant =
  contentType === "projects" ? "opensource" : "publication";
const EditDocument = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const documentId = parseInt(id || "0", 10);

  // Use the shared auth hook to get user and admin status
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const isAdmin =
    user?.roles?.map((role: string) => role.toLowerCase()).includes("admin") ||
    false;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  // Store the original userId to preserve ownership
  const [originalUserId, setOriginalUserId] = useState<string>("");
  const [publicationType, setPublicationType] = useState<string>("academic");


  // Form state
  const [formData, setFormData] = useState<
    Omit<PublicationDto, "id"> & { userId?: string }
  >({
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
    variant: defaultVariant,
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
    showImage: false,
    userId: "",
  });

  // Check if user is authenticated
  useEffect(() => {
    // Only redirect after authentication check is complete
    if (!authLoading && !isAuthenticated) {
      // Redirect to the identity subdomain login page
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(
        window.location.href
      )}`;
    }
  }, [authLoading, isAuthenticated, id]);

  // Load publication data
  useEffect(() => {
    // Validate contentType - only allow 'projects' or 'publications'
    const validContentTypes = ['projects', 'publications'];
    if (!contentType || !validContentTypes.includes(contentType)) {
      // Redirect to publications if contentType is invalid
      navigate('/portfolio/publications', { replace: true });
      return;
    }

    const loadPublication = async () => {
      if (!documentId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const document = await fetchPublicationById(documentId);

        if (!document) {
          setNotFound(true);
          return;
        }

        // Store the original userId for admin updates
        const pubUserId =
          (document as unknown as { userId?: string }).userId || "";
        setOriginalUserId(pubUserId);
        console.log("Original publication userId:", pubUserId);

        // Convert publication to form data
        setFormData({
          title: document.title || "",
          subtitle: document.subtitle || "",
          meta: document.meta || "",
          description: document.description || "",
          link: document.link || "",
          imageUrl: document.imageUrl || "",
          useGradient: document.useGradient || false,
          tags: document.tags || [],
          year: document.year?.toString() || "",
          metrics: document.metrics || [],
          variant: document.variant || defaultVariant,
          size: document.size || "md",
          fullWidth: document.fullWidth || false,
          elevated: document.elevated || false,
          bordered: document.bordered !== false, // Default to true if undefined
          clickable: document.clickable || false,
          featured: document.featured || false,
          doi: document.doi || "",
          journalName: document.journalName || "",
          conferenceName: document.conferenceName || "",
          publicationType: document.publicationType || publicationType,
          // Make sure to properly read the showImage property
          showImage:
            document.showImage !== undefined ? document.showImage : false,
          userId: (document as unknown as { userId?: string }).userId || "", // Type-safe casting
        });

        setError(null);
      } catch (err) {
        setError("Failed to load publication data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && documentId) {
      loadPublication();
    }
  }, [documentId, navigate, isAuthenticated, publicationType]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "variant" && value !== "publication") {
      setPublicationType("non-academic");
    }
    if (name === "variant" && value === "publication") {
      setPublicationType("academic");
    }
    if (name === "publicationType") {
      setPublicationType(value);
      if (value !== "academic") {
        setFormData((prev) => ({ ...prev, doi: "" }));
      }
    }
  };

  // Handle tags input
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");
    setFormData((prev) => ({ ...prev, tags: tagsArray }));
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
      // Make a copy of the form data
      const preparedData = { ...formData } as Omit<PublicationDto, "id">;

      // Ensure DOI and JournalName are explicitly included in the request
      // even if they're empty strings - this forces them to be updated in the database
      if (formData.doi === "") {
        preparedData.doi = ""; // Keep empty string to ensure it's sent to API
      }

      if (formData.journalName === "") {
        preparedData.journalName = ""; // Keep empty string to ensure it's sent to API
      }

      // Convert other empty strings to undefined to avoid sending empty values
      // Create a new object without the empty strings
      const cleanedData: Record<
        string,
        | string
        | number
        | boolean
        | string[]
        | { label: string; value: string | number }[]
        | undefined
      > = {};

      for (const key in preparedData) {
        if (
          key !== "doi" &&
          key !== "journalName" &&
          preparedData[key as keyof typeof preparedData] === ""
        ) {
          // Skip empty strings
        } else {
          cleanedData[key] = preparedData[key as keyof typeof preparedData];
        }
      }

      // Replace preparedData with the cleaned version
      Object.assign(preparedData, cleanedData);

      // If admin is editing someone else's publication, ensure we preserve the original userId
      if (isAdmin && originalUserId && originalUserId !== user?.id) {
        console.log(
          "Admin is editing another user's publication. Preserving original userId:",
          originalUserId
        );
        preparedData.userId = originalUserId;
      }

      // Add admin flag to the request if the user is an admin
      if (isAdmin) {
        // Use the same type that updatePublication expects
        (
          preparedData as Omit<PublicationDto, "id"> & { isAdminEdit?: boolean }
        ).isAdminEdit = true;
      }

      console.log("Submitting publication data:", preparedData);
      console.log("DOI value:", preparedData.doi);
      console.log("JournalName value:", preparedData.journalName);

      const success = await updatePublication(documentId, preparedData);
      toast.success("Publication updated successfully");
      if (success) {
        navigate(BASE_URL + "/manage");
      } else {
        setError("Failed to update publication");
        toast.error("Failed to update publication");
      }
    } catch (err) {
      setError("An error occurred while updating the publication");
      toast.error("An error occurred while updating the publication");
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
          <p>
            The publication you're trying to edit could not be found or you
            don't have permission to edit it.
          </p>
          <button
            onClick={() => navigate(BASE_URL + "/manage")}
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
      <PublicationActionsBar />
      <div className="edit-publication-container">
        <h1 className="edit-publication-title">Edit Publication</h1>

        {error && <div className="edit-publication-error">{error}</div>}

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
                  value={formData.subtitle || ""}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Meta Information</label>
                <input
                  type="text"
                  name="meta"
                  value={formData.meta || ""}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Brief summary or keywords (e.g. Journal Name, Date, etc.)"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ""}
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
                  {typeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Year</label>
                <input
                  type="text"
                  name="year"
                  value={formData.year || ""}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  DOI (for academic publications)
                </label>
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
                  value={formData.doi || ""}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 10.1061/(ASCE)HE.1943-5584.0001141"
                  disabled={publicationType !== "academic"}
                />
              </div>

              {publicationType === "academic" && (
                <>
                  <div className="form-field">
                    <label className="form-label">Journal Name</label>
                    <input
                      type="text"
                      name="journalName"
                      value={formData.journalName || ""}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Conference Name</label>
                    <input
                      type="text"
                      name="conferenceName"
                      value={formData.conferenceName || ""}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Display Options */}
            <div className="form-field-full form-section">
              <h2 className="form-section-title">Display Options</h2>

              <div className="form-field">
                <label className="form-label">Link URL</label>
                <input
                  type="url"
                  name="link"
                  value={formData.link || ""}
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
                  value={formData.imageUrl || ""}
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
                  value={formData.tags?.join(", ") || ""}
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
                onClick={() => navigate(BASE_URL + "/manage")}
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
                {isSubmitting ? "Updating..." : "Update Document"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDocument;
