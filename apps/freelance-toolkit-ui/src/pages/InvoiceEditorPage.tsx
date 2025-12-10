import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { invoicesApi, clientsApi } from "../api";
import { ButtonComponent } from "@asafarim/shared-ui-react";
import type { InvoiceResponseDto, UpdateInvoiceDto, InvoiceLineItemDto, ClientResponseDto } from "../types";
import "../styles/pages/invoice-editor.css";

export default function InvoiceEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Draft");
  const [lineItems, setLineItems] = useState<InvoiceLineItemDto[]>([
    { description: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [paymentInstructions, setPaymentInstructions] = useState("");

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await invoicesApi.getById(id);
      setIssueDate(data.issueDate);
      setDueDate(data.dueDate);
      setStatus(data.status);
      setLineItems(data.lineItems);
      setTaxPercent(data.taxPercent || 0);
      setNotes(data.notes || "");
      setPaymentInstructions(data.paymentInstructions || "");
    } catch (err: any) {
      setError("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const calculateLineItemTotal = (item: InvoiceLineItemDto) => {
    const subtotal = item.quantity * item.unitPrice;
    const discount = item.discountPercent ? (subtotal * item.discountPercent) / 100 : 0;
    return subtotal - discount;
  };

  const updateLineItem = (index: number, field: keyof InvoiceLineItemDto, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    updated[index].total = calculateLineItemTotal(updated[index]);
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * taxPercent) / 100;
    return { subtotal, taxAmount, total: subtotal + taxAmount };
  };

  const handleSave = async () => {
    if (!id) return;
    const dto: UpdateInvoiceDto = {
      issueDate,
      dueDate,
      status,
      lineItems,
      taxPercent,
      notes,
      paymentInstructions,
    };

    try {
      setSaving(true);
      await invoicesApi.update(id, dto);
      navigate("/invoices");
    } catch (err: any) {
      setError("Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm("Delete this invoice?")) return;
    try {
      await invoicesApi.delete(id);
      navigate("/invoices");
    } catch (err) {
      setError("Failed to delete invoice");
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  if (loading) return <div className="flt-invoice-editor-loading">Loading...</div>;

  return (
    <div className="flt-invoice-editor">
      <div className="flt-invoice-editor-header">
        <h2>Edit Invoice</h2>
        <div className="flt-invoice-editor-actions">
          <ButtonComponent variant="ghost" onClick={() => navigate("/invoices")}>
            Cancel
          </ButtonComponent>
          <ButtonComponent variant="danger" onClick={handleDelete}>
            Delete
          </ButtonComponent>
          <ButtonComponent variant="brand" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </ButtonComponent>
        </div>
      </div>

      {error && <div className="flt-invoice-editor-error">{error}</div>}

      <div className="flt-invoice-editor-form">
        <div className="flt-invoice-editor-row">
          <div className="flt-invoice-editor-field">
            <label>Issue Date</label>
            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </div>
          <div className="flt-invoice-editor-field">
            <label>Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="flt-invoice-editor-field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <h3>Line Items</h3>
        {lineItems.map((item, index) => (
          <div key={index} className="flt-invoice-line-item">
            <input
              type="text"
              placeholder="Description"
              value={item.description}
              onChange={(e) => updateLineItem(index, "description", e.target.value)}
            />
            <input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => updateLineItem(index, "quantity", parseFloat(e.target.value))}
            />
            <input
              type="number"
              placeholder="Unit Price"
              value={item.unitPrice}
              onChange={(e) => updateLineItem(index, "unitPrice", parseFloat(e.target.value))}
            />
            <span className="flt-invoice-line-total">${item.total.toFixed(2)}</span>
            <button onClick={() => removeLineItem(index)}>Remove</button>
          </div>
        ))}
        <button onClick={addLineItem}>+ Add Line Item</button>

        <div className="flt-invoice-totals">
          <div>Subtotal: ${subtotal.toFixed(2)}</div>
          <div>
            Tax ({taxPercent}%): ${taxAmount.toFixed(2)}
            <input type="number" value={taxPercent} onChange={(e) => setTaxPercent(parseFloat(e.target.value))} />
          </div>
          <div><strong>Total: ${total.toFixed(2)}</strong></div>
        </div>

        <div className="flt-invoice-editor-field">
          <label>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>

        <div className="flt-invoice-editor-field">
          <label>Payment Instructions</label>
          <textarea value={paymentInstructions} onChange={(e) => setPaymentInstructions(e.target.value)} rows={3} />
        </div>
      </div>
    </div>
  );
}