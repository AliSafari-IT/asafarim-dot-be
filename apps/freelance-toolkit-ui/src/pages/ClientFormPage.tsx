import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  clientsApi,
  type CreateClientDto,
} from "../api";
import "../styles/pages/client-form.css";
import { FormErrorBoundary } from "@asafarim/shared-ui-react";

export const ClientFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateClientDto>({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    companyWebsite: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    notes: "",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (isEditMode && id) {
      loadClient(id);
    }
  }, [isEditMode, id]);

  const loadClient = async (clientId: string) => {
    try {
      const client = await clientsApi.getById(clientId);
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone || "",
        companyName: client.companyName || "",
        companyWebsite: client.companyWebsite || "",
        address: client.address || "",
        city: client.city || "",
        country: client.country || "",
        postalCode: client.postalCode || "",
        notes: client.notes || "",
        tags: client.tags || [],
      });
    } catch (err) {
      setErrors({ _form: "Failed to load client details" });
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...(prev.tags || []), tagInput.trim()],
        }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  // Validation function
  const validateForm = (): Record<string, string> => {
    const validationErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim() === "") {
      validationErrors.name = "Name is required";
    }

    if (!formData.email || formData.email.trim() === "") {
      validationErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.email = "Please enter a valid email address";
    }

    return validationErrors;
  };

  // Clear errors
  const clearErrors = () => {
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Run validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      if (isEditMode && id) {
        await clientsApi.update(id, formData);
      } else {
        await clientsApi.create(formData);
      }

      navigate("/clients");
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      if (axiosError.response?.data?.message) {
        setErrors({ _form: axiosError.response.data.message });
      } else if (axiosError.response?.data?.errors) {
        const serverErrors: Record<string, string> = {};
        Object.entries(axiosError.response.data.errors).forEach(
          ([key, messages]) => {
            serverErrors[key] = Array.isArray(messages)
              ? messages[0]
              : String(messages);
          }
        );
        setErrors(serverErrors);
      } else {
        setErrors({ _form: "Failed to save client" });
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="flt-clientform-loading">Loading...</div>;
  }

  return (
    <div className="flt-clientform-container">
      <div className="flt-clientform-header">
        <button
          onClick={() => navigate("/clients")}
          className="flt-clientform-back-button"
        >
          ←
        </button>
        <h2 className="flt-clientform-title">
          {isEditMode ? "Edit Client" : "Add New Client"}
        </h2>
      </div>

      <FormErrorBoundary errors={errors} onClear={clearErrors}>
        <form onSubmit={handleSubmit} className="flt-clientform-form">
          {/* Basic Info */}
          <div className="flt-clientform-section">
            <h3 className="flt-clientform-section-title">Basic Information</h3>
            <div className="flt-clientform-grid-2">
              <div className="flt-clientform-input-group">
                <label className="flt-clientform-label flt-clientform-label--required">
                  Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`flt-clientform-input ${
                    errors.name ? "flt-clientform-input--error" : ""
                  }`}
                />
                {errors.name && (
                  <span className="flt-clientform-field-error">
                    {errors.name}
                  </span>
                )}
              </div>
              <div className="flt-clientform-input-group">
                <label className="flt-clientform-label flt-clientform-label--required">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`flt-clientform-input ${
                    errors.email ? "flt-clientform-input--error" : ""
                  }`}
                />
                {errors.email && (
                  <span className="flt-clientform-field-error">
                    {errors.email}
                  </span>
                )}
              </div>
              <div className="flt-clientform-input-group">
                <label className="flt-clientform-label">Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="flt-clientform-input"
                />
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="flt-clientform-section">
            <h3 className="flt-clientform-section-title">Company Details</h3>
            <div className="flt-clientform-grid-2">
              <div className="flt-clientform-input-group">
                <label className="flt-clientform-label">Company Name</label>
                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="flt-clientform-input"
                />
              </div>
              <div className="flt-clientform-input-group">
                <label className="flt-clientform-label">Website</label>
                <input
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  placeholder="https://"
                  className="flt-clientform-input"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="flt-clientform-section">
            <h3 className="flt-clientform-section-title">Address</h3>
            <div className="flt-clientform-grid-full">
              <div className="flt-clientform-input-group">
                <label className="flt-clientform-label">Street Address</label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="flt-clientform-input"
                />
              </div>
              <div className="flt-clientform-grid-3">
                <div className="flt-clientform-input-group">
                  <label className="flt-clientform-label">City</label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="flt-clientform-input"
                  />
                </div>
                <div className="flt-clientform-input-group">
                  <label className="flt-clientform-label">State/Country</label>
                  <input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="flt-clientform-input"
                  />
                </div>
                <div className="flt-clientform-input-group">
                  <label className="flt-clientform-label">Postal Code</label>
                  <input
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="flt-clientform-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flt-clientform-section">
            <h3 className="flt-clientform-section-title">Additional Info</h3>
            <div className="flt-clientform-grid-full">
              <div className="flt-clientform-input-group">
                <label className="flt-clientform-label">
                  Tags (Press Enter to add)
                </label>
                <div className="flt-clientform-tags-container">
                  {formData.tags?.map((tag) => (
                    <span key={tag} className="flt-clientform-tag">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="flt-clientform-tag-remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={formData.tags?.length ? "" : "Type tag..."}
                    className="flt-clientform-tag-input"
                  />
                </div>
              </div>

              <div className="flt-clientform-input-group">
                <label className="flt-clientform-label">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="flt-clientform-textarea"
                />
              </div>
            </div>
          </div>

          <div className="flt-clientform-actions">
            <button
              type="button"
              onClick={() => navigate("/clients")}
              className="flt-clientform-button flt-clientform-button--cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flt-clientform-button flt-clientform-button--submit"
            >
              {loading
                ? "Saving..."
                : isEditMode
                ? "Update Client"
                : "Create Client"}
            </button>
          </div>
        </form>
      </FormErrorBoundary>
    </div>
  );
};
