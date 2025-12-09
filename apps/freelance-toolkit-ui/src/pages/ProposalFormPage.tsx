// apps/freelance-toolkit-ui/src/api/ProposalFormPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  proposalsApi,
  clientsApi,
  type CreateProposalDto,
  type ProposalResponseDto,
  type ProposalLineItemDto,
  type ClientResponseDto,
} from "../api";
import { formatCurrency } from "../utils/apiHelpers";
import "../styles/pages/proposal-form.css";
import { ButtonComponent, FormErrorBoundary } from "@asafarim/shared-ui-react";

export const ProposalFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clients, setClients] = useState<ClientResponseDto[]>([]);

  const [formData, setFormData] = useState<CreateProposalDto>({
    clientId: "",
    title: "",
    description: "",
    lineItems: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
    taxPercent: 0,
    terms: "",
    notes: "",
    validUntil: "",
  });

  const [lineItems, setLineItems] = useState<ProposalLineItemDto[]>([
    { description: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);

  useEffect(() => {
    loadClients();
    if (isEditMode && id) {
      loadProposal(id);
    }
  }, [isEditMode, id]);

  const loadClients = async () => {
    try {
      const data = await clientsApi.getAll();
      setClients(data);
    } catch (err) {
      console.error("Failed to load clients", err);
    }
  };

  const loadProposal = async (proposalId: string) => {
    try {
      const proposal = await proposalsApi.getById(proposalId);
      setFormData({
        clientId: proposal.clientId,
        title: proposal.title,
        description: proposal.projectScope || "",
        lineItems: proposal.lineItems || [],
        taxPercent: 0,
        terms: "",
        notes: "",
        validUntil: proposal.validUntil || "",
      });
      setLineItems(proposal.lineItems || []);
    } catch (err) {
      setErrors({ _form: "Failed to load proposal details" });
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (
    index: number,
    field: keyof ProposalLineItemDto,
    value: string | number
  ) => {
    const updated = [...lineItems];
    const item = updated[index];

    if (field === "quantity" || field === "unitPrice") {
      const numValue =
        typeof value === "string" ? parseFloat(value) || 0 : value;
      (item[field] as number) = numValue;
    } else if (field === "description") {
      (item[field] as string) = value as string;
    }

    // Calculate total
    item.total = item.quantity * item.unitPrice;

    setLineItems(updated);
    setFormData((prev) => ({ ...prev, lineItems: updated }));
  };

  const addLineItem = () => {
    const newItem: ProposalLineItemDto = {
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    const updated = [...lineItems, newItem];
    setLineItems(updated);
    setFormData((prev) => ({ ...prev, lineItems: updated }));
  };

  const removeLineItem = (index: number) => {
    const updated = lineItems.filter((_, i) => i !== index);
    setLineItems(updated);
    setFormData((prev) => ({ ...prev, lineItems: updated }));
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * (formData.taxPercent || 0)) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // Validation function
  const validateForm = (): Record<string, string> => {
    const validationErrors: Record<string, string> = {};

    // Required fields
    if (!formData.clientId) {
      validationErrors.clientId = "Client is required";
    }

    if (!formData.title || formData.title.trim() === "") {
      validationErrors.title = "Proposal title is required";
    }

    // Valid Until must be a future date
    if (!formData.validUntil) {
      validationErrors.validUntil =
        "Please select a 'Valid Until' date in the future";
    } else {
      const selectedDate = new Date(formData.validUntil);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) {
        validationErrors.validUntil = "Valid until date must be in the future";
      }
    }

    // Line items validation
    if (lineItems.length === 0) {
      validationErrors.lineItems = "At least one line item is required";
    } else {
      lineItems.forEach((item, index) => {
        if (!item.description || item.description.trim() === "") {
          validationErrors[`lineItems.${index}.description`] = `Line item ${
            index + 1
          }: Description is required`;
        }
        if (item.quantity <= 0) {
          validationErrors[`lineItems.${index}.quantity`] = `Line item ${
            index + 1
          }: Quantity must be greater than 0`;
        }
        if (item.unitPrice < 0) {
          validationErrors[`lineItems.${index}.unitPrice`] = `Line item ${
            index + 1
          }: Unit price cannot be negative`;
        }
      });
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

      const submitData: CreateProposalDto = {
        ...formData,
        lineItems,
      };

      if (isEditMode && id) {
        await proposalsApi.update(id, {
          title: submitData.title,
          description: submitData.description,
          status: "Draft",
          lineItems: submitData.lineItems,
          taxPercent: submitData.taxPercent,
          terms: submitData.terms,
          notes: submitData.notes,
          validUntil: submitData.validUntil,
        });
      } else {
        await proposalsApi.create(submitData);
      }

      navigate("/proposals");
    } catch (err: unknown) {
      // Extract server error message if available
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
        setErrors({ _form: "Failed to save proposal" });
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="flt-proposalform-loading">Loading...</div>;
  }

  return (
    <div className="flt-proposalform-container">
      <div className="flt-proposalform-header">
        <button
          onClick={() => navigate("/proposals")}
          className="flt-proposalform-back-button"
        >
          ←
        </button>
        <h2 className="flt-proposalform-title">
          {isEditMode ? "Edit Proposal" : "Create New Proposal"}
        </h2>
      </div>

      <FormErrorBoundary errors={errors} onClear={clearErrors}>
        <form onSubmit={handleSubmit} className="flt-proposalform-form">
          {/* Basic Info */}
          <div className="flt-proposalform-section">
            <h3 className="flt-proposalform-section-title">
              Basic Information
            </h3>

            <div className="flt-proposalform-grid-full">
              <div className="flt-proposalform-input-group">
                <label className="flt-proposalform-label flt-proposalform-label--required">
                  Client
                </label>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  required
                  className={`flt-proposalform-select ${
                    errors.clientId ? "flt-proposalform-input--error" : ""
                  }`}
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {errors.clientId && (
                  <span className="flt-proposalform-field-error">
                    {errors.clientId}
                  </span>
                )}
              </div>

              <div className="flt-proposalform-input-group">
                <label className="flt-proposalform-label flt-proposalform-label--required">
                  Proposal Title
                </label>
                <input
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter proposal title..."
                  className={`flt-proposalform-input ${
                    errors.title ? "flt-proposalform-input--error" : ""
                  }`}
                />
                {errors.title && (
                  <span className="flt-proposalform-field-error">
                    {errors.title}
                  </span>
                )}
              </div>

              <div className="flt-proposalform-input-group">
                <label className="flt-proposalform-label">
                  Project Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the project scope and objectives..."
                  className="flt-proposalform-textarea"
                />
              </div>

              <div className="flt-proposalform-input-group">
                <label className="flt-proposalform-label flt-proposalform-label--required">
                  Valid Until
                </label>
                <input
                  type="date"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleChange}
                  className={`flt-proposalform-input ${
                    errors.validUntil ? "flt-proposalform-input--error" : ""
                  }`}
                />
                {errors.validUntil && (
                  <span className="flt-proposalform-field-error">
                    {errors.validUntil}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="flt-proposalform-section">
            <div className="flt-proposalform-line-items">
              <h3 className="flt-proposalform-section-title">Line Items *</h3>
              <button
                type="button"
                onClick={addLineItem}
                className="flt-proposalform-add-line-item"
              >
                + Add Item
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="flt-proposalform-table">
                <thead className="flt-proposalform-table-header">
                  <tr>
                    <th className="flt-proposalform-table-header-cell">
                      Description
                    </th>
                    <th
                      className="flt-proposalform-table-header-cell"
                      style={{ width: "100px", textAlign: "right" }}
                    >
                      Quantity
                    </th>
                    <th
                      className="flt-proposalform-table-header-cell"
                      style={{ width: "120px", textAlign: "right" }}
                    >
                      Unit Price
                    </th>
                    <th
                      className="flt-proposalform-table-header-cell"
                      style={{ width: "120px", textAlign: "right" }}
                    >
                      Total
                    </th>
                    <th
                      className="flt-proposalform-table-header-cell"
                      style={{ width: "60px", textAlign: "center" }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index} className="flt-proposalform-table-row">
                      <td className="flt-proposalform-table-cell">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleLineItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Item description"
                          className={`flt-proposalform-table-cell-input ${
                            errors[`lineItems.${index}.description`]
                              ? "flt-proposalform-input--error"
                              : ""
                          }`}
                        />
                      </td>
                      <td className="flt-proposalform-table-cell">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleLineItemChange(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          min="1"
                          step="1"
                          className={`flt-proposalform-table-cell-input ${
                            errors[`lineItems.${index}.quantity`]
                              ? "flt-proposalform-input--error"
                              : ""
                          }`}
                          style={{ textAlign: "right" }}
                        />
                      </td>
                      <td className="flt-proposalform-table-cell">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleLineItemChange(
                              index,
                              "unitPrice",
                              e.target.value
                            )
                          }
                          min="0"
                          step="0.01"
                          className={`flt-proposalform-table-cell-input ${
                            errors[`lineItems.${index}.unitPrice`]
                              ? "flt-proposalform-input--error"
                              : ""
                          }`}
                          style={{ textAlign: "right" }}
                        />
                      </td>
                      <td
                        className="flt-proposalform-table-cell"
                        style={{ textAlign: "right", fontWeight: 600 }}
                      >
                        {formatCurrency(item.total)}
                      </td>
                      <td
                        className="flt-proposalform-table-cell"
                        style={{ textAlign: "center" }}
                      >
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="flt-proposalform-remove-button"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flt-proposalform-section">
            <div className="flt-proposalform-totals">
              <div className="flt-proposalform-total-row">
                <span className="flt-proposalform-total-label">Subtotal:</span>
                <span className="flt-proposalform-total-value">
                  {formatCurrency(calculateSubtotal())}
                </span>
              </div>

              {(formData.taxPercent ?? 0) > 0 && (
                <div className="flt-proposalform-total-row">
                  <span className="flt-proposalform-total-label">
                    Tax ({formData.taxPercent}%):
                  </span>
                  <span className="flt-proposalform-total-value">
                    {formatCurrency(calculateTax())}
                  </span>
                </div>
              )}

              <div className="flt-proposalform-total-row">
                <span className="flt-proposalform-total-label">Total:</span>
                <span
                  className="flt-proposalform-total-value"
                  style={{ color: "var(--color-brand)", fontSize: "1.2rem" }}
                >
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flt-proposalform-actions">
            <ButtonComponent
              type="button"
              onClick={() => navigate("/proposals")}
              variant="secondary"
            >
              Cancel
            </ButtonComponent>
            <ButtonComponent type="submit" variant="success" disabled={loading}>
              {loading
                ? "Saving..."
                : isEditMode
                ? "Update Proposal"
                : "Create Proposal"}
            </ButtonComponent>
          </div>
        </form>
      </FormErrorBoundary>
    </div>
  );
};
