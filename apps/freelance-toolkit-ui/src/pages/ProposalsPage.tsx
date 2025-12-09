// apps/freelance-toolkit-ui/src/api/ProposalsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { proposalsApi, type ProposalResponseDto } from "../api";
import { formatCurrency, debounce } from "../utils/apiHelpers";
import { ButtonComponent } from "@asafarim/shared-ui-react";
import "../styles/pages/proposals.css";

export const ProposalsPage = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<ProposalResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async (search?: string, status?: string) => {
    try {
      setLoading(true);
      const data = await proposalsApi.getAll(status || undefined);
      // Filter by search term on client side
      const filtered = search
        ? data.filter(
            (p) =>
              p.proposalNumber.toLowerCase().includes(search.toLowerCase()) ||
              p.clientName.toLowerCase().includes(search.toLowerCase()) ||
              p.title.toLowerCase().includes(search.toLowerCase())
          )
        : data;
      setProposals(filtered);
      setError(null);
    } catch (err) {
      setError("Failed to load proposals");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = debounce((value: string) => {
    loadProposals(value, statusFilter);
  }, 500);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    handleSearch(e.target.value);
  };

  const onStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    setStatusFilter(status);
    loadProposals(searchTerm, status);
  };

  const handleDelete = async (id: string, number: string) => {
    if (window.confirm(`Are you sure you want to delete proposal ${number}?`)) {
      try {
        await proposalsApi.delete(id);
        setProposals(proposals.filter((p) => p.id !== id));
      } catch (err) {
        alert("Failed to delete proposal");
        console.error(err);
      }
    }
  };

  const handleSend = async (id: string) => {
    try {
      setActionLoading(id);
      const updated = await proposalsApi.send(id);
      setProposals(proposals.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      alert("Failed to send proposal");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPdf = async (id: string, number: string) => {
    try {
      setActionLoading(id);
      const blob = await proposalsApi.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proposal-${number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to download PDF");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusClassName = (status: string) => {
    const baseClass = "flt-proposalspage-card-status";
    const statusLower = status.toLowerCase();
    return `${baseClass} ${baseClass}--${statusLower}`;
  };

  return (
    <div className="flt-proposalspage-container">
      <div className="flt-proposalspage-header">
        <h2 className="flt-proposalspage-title">Proposals</h2>
        <ButtonComponent
          variant="primary"
          onClick={() => navigate("/proposals/new")}
        >
          <span>+</span> New Proposal
        </ButtonComponent>
      </div>

      {/* Search and Filter */}
      <div className="flt-proposalspage-filters">
        <input
          type="text"
          placeholder="Search by proposal #, client, or title..."
          value={searchTerm}
          onChange={onSearchChange}
          className="flt-proposalspage-search-input"
        />
        <select
          value={statusFilter}
          onChange={onStatusFilterChange}
          className="flt-proposalspage-status-filter"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Error Message */}
      {error && <div className="flt-proposalspage-error">{error}</div>}

      {/* Loading State */}
      {loading ? (
        <div className="flt-proposalspage-loading">Loading proposals...</div>
      ) : proposals.length === 0 ? (
        <div className="flt-proposalspage-empty">
          <div className="flt-proposalspage-empty-icon">📄</div>
          <h3 className="flt-proposalspage-empty-title">No proposals found</h3>
          <p className="flt-proposalspage-empty-text">
            {searchTerm || statusFilter
              ? "Try adjusting your search or filters"
              : "Get started by creating your first proposal"}
          </p>
          {!searchTerm && !statusFilter && (
            <button
              onClick={() => navigate("/proposals/new")}
              className="flt-proposalspage-empty-button"
            >
              Create First Proposal
            </button>
          )}
        </div>
      ) : (
        <div className="flt-proposalspage-grid">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="flt-proposalspage-card"
              onClick={() => navigate(`/proposals/${proposal.id}`)}
            >
              <div className="flt-proposalspage-card-header">
                <div>
                  <h3 className="flt-proposalspage-card-title">
                    {proposal.title}
                  </h3>
                  <p className="flt-proposalspage-card-number">
                    Proposal #{proposal.proposalNumber}
                  </p>
                </div>
                <div className={getStatusClassName(proposal.status)}>
                  {proposal.status}
                </div>
              </div>

              <p className="flt-proposalspage-card-client">
                Client: {proposal.clientName}
              </p>

              {proposal.projectScope && (
                <p className="flt-proposalspage-card-description">
                  {proposal.projectScope}
                </p>
              )}

              <div className="flt-proposalspage-card-footer">
                <div className="flt-proposalspage-card-amount">
                  {formatCurrency(proposal.totalAmount)}
                </div>
                <div className="flt-proposalspage-card-date">
                  {new Date(proposal.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div
                className="flt-proposalspage-card-actions"
                onClick={(e) => e.stopPropagation()}
              >
                {proposal.status.toLowerCase() === "draft" && (
                  <button
                    onClick={() => handleSend(proposal.id)}
                    disabled={actionLoading === proposal.id}
                    className="flt-proposalspage-action-button flt-proposalspage-action-button--send"
                  >
                    {actionLoading === proposal.id ? "Sending..." : "✉️ Send"}
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadPdf(proposal.id, proposal.proposalNumber);
                  }}
                  disabled={actionLoading === proposal.id}
                  className="flt-proposalspage-action-button"
                >
                  {actionLoading === proposal.id ? "..." : "📄 PDF"}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(proposal.id, proposal.proposalNumber);
                  }}
                  className="flt-proposalspage-action-button flt-proposalspage-action-button--delete"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
