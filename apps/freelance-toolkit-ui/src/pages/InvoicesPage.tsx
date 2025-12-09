import { useState, useEffect } from "react";
import { invoicesApi } from "../api/invoicesApi";
import { FormErrorBoundary } from "@asafarim/shared-ui-react";
import EmailPreviewModal from "../components/EmailPreviewModal";
import type { InvoiceResponseDto } from "../types";
import "../styles/pages/invoices.css";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceResponseDto | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoicesApi.getAll();
      setInvoices(data);
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to load invoices" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPreview = (invoice: InvoiceResponseDto) => {
    setSelectedInvoice(invoice);
    setPreviewModalOpen(true);
  };

  const handleSendEmail = async (subject: string, body: string) => {
    if (!selectedInvoice) return;

    try {
      setSending(selectedInvoice.id);
      setErrors({});
      setSuccessMessage(null);

      await invoicesApi.send(selectedInvoice.id);

      setSuccessMessage(
        `Invoice ${selectedInvoice.invoiceNumber} sent successfully!`
      );
      loadInvoices(); // Reload to get updated status
      setPreviewModalOpen(false);
      setSelectedInvoice(null);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general:
            error.response?.data?.message ||
            error.message ||
            "Failed to send invoice",
        });
      }
      throw error; // Re-throw to let modal handle it
    } finally {
      setSending(null);
    }
  };

  const getDefaultEmailSubject = (invoice: InvoiceResponseDto) => {
    return `Invoice ${invoice.invoiceNumber} from Freelance Toolkit`;
  };

  const getDefaultEmailBody = (invoice: InvoiceResponseDto) => {
    return `Dear ${invoice.clientName},

Please find attached invoice ${
      invoice.invoiceNumber
    } for the amount of $${invoice.total.toFixed(2)}.

Payment is due by ${new Date(invoice.dueDate).toLocaleDateString()}.

Thank you for your business!

Best regards,
Freelance Toolkit`;
  };

  const handleDownloadPdf = async (id: string, invoiceNumber: string) => {
    try {
      const blob = await invoicesApi.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      setErrors({ general: "Failed to download PDF" });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "flt-invoices-badge--paid";
      case "sent":
        return "flt-invoices-badge--sent";
      case "overdue":
        return "flt-invoices-badge--overdue";
      case "cancelled":
        return "flt-invoices-badge--cancelled";
      default:
        return "flt-invoices-badge--draft";
    }
  };

  if (loading) {
    return (
      <div className="flt-invoices-container">
        <div className="flt-invoices-loading">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="flt-invoices-container">
      <div className="flt-invoices-header">
        <h1 className="flt-invoices-title">Invoices</h1>
      </div>

      <FormErrorBoundary errors={errors} onClear={() => setErrors({})}>
        {successMessage && (
          <div className="flt-invoices-success">
            {successMessage}
            <button
              className="flt-invoices-success-close"
              onClick={() => setSuccessMessage(null)}
            >
              ×
            </button>
          </div>
        )}

        {invoices.length === 0 ? (
          <div className="flt-invoices-empty">
            <p>No invoices found.</p>
          </div>
        ) : (
          <div className="flt-invoices-table-wrapper">
            <table className="flt-invoices-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="flt-invoices-number">
                      {invoice.invoiceNumber}
                    </td>
                    <td>{invoice.clientName}</td>
                    <td>{new Date(invoice.issueDate).toLocaleDateString()}</td>
                    <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="flt-invoices-amount">
                      ${invoice.total.toFixed(2)}
                    </td>
                    <td>
                      <span
                        className={`flt-invoices-badge ${getStatusBadgeClass(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td>
                      <div className="flt-invoices-actions">
                        {invoice.status.toLowerCase() === "draft" && (
                          <button
                            className="flt-invoices-btn flt-invoices-btn--send"
                            onClick={() => handleOpenPreview(invoice)}
                            disabled={sending === invoice.id}
                          >
                            {sending === invoice.id ? "Sending..." : "Send"}
                          </button>
                        )}
                        <button
                          className="flt-invoices-btn flt-invoices-btn--download"
                          onClick={() =>
                            handleDownloadPdf(invoice.id, invoice.invoiceNumber)
                          }
                        >
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </FormErrorBoundary>

      {selectedInvoice && (
        <EmailPreviewModal
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setSelectedInvoice(null);
          }}
          onSend={handleSendEmail}
          defaultSubject={getDefaultEmailSubject(selectedInvoice)}
          defaultBody={getDefaultEmailBody(selectedInvoice)}
          recipientEmail={selectedInvoice.clientName} // TODO: Should use actual client email
          documentType="Invoice"
          documentNumber={selectedInvoice.invoiceNumber}
        />
      )}
    </div>
  );
}
