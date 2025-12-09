import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clientsApi, type ClientResponseDto } from "../api";
import { formatCurrency, debounce } from "../utils/apiHelpers";
import { ButtonComponent } from "@asafarim/shared-ui-react";
import "../styles/pages/clients.css";

export const ClientsPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async (search?: string) => {
    try {
      setLoading(true);
      const data = await clientsApi.getAll(search);
      setClients(data);
      setError(null);
    } catch (err) {
      setError("Failed to load clients");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = debounce((value: string) => {
    loadClients(value);
  }, 500);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    handleSearch(e.target.value);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await clientsApi.delete(id);
        setClients(clients.filter((c) => c.id !== id));
      } catch (err) {
        alert("Failed to delete client");
        console.error(err);
      }
    }
  };

  return (
    <div className="flt-clientspage-container">
      <div className="flt-clientspage-header">
        <h2 className="flt-clientspage-title">Clients</h2>
        <ButtonComponent
          variant="outline"
          onClick={() => navigate("/clients/new")}
        >
          <span>+</span> Add Client
        </ButtonComponent>
      </div>

      {/* Search and Filter */}
      <div className="flt-clientspage-search-container">
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={onSearchChange}
          className="flt-clientspage-search-input"
        />
      </div>

      {loading ? (
        <div className="flt-clientspage-loading">Loading clients...</div>
      ) : error ? (
        <div className="flt-clientspage-error">{error}</div>
      ) : clients.length === 0 ? (
        <div className="flt-clientspage-empty">
          <div className="flt-clientspage-empty-icon">👥</div>
          <h3 className="flt-clientspage-empty-title">No clients found</h3>
          <p className="flt-clientspage-empty-text">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Get started by adding your first client"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate("/clients/new")}
              className="flt-clientspage-empty-button"
            >
              Add Client
            </button>
          )}
        </div>
      ) : (
        <div className="flt-clientspage-table-container">
          <table className="flt-clientspage-table">
            <thead className="flt-clientspage-table-header">
              <tr>
                <th className="flt-clientspage-table-header-cell">Name</th>
                <th className="flt-clientspage-table-header-cell">Contact</th>
                <th className="flt-clientspage-table-header-cell">Activity</th>
                <th className="flt-clientspage-table-header-cell">Revenue</th>
                <th className="flt-clientspage-table-header-cell flt-clientspage-table-header-cell--actions">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="flt-clientspage-table-row">
                  <td className="flt-clientspage-table-cell">
                    <div className="flt-clientspage-client-name">
                      {client.name}
                    </div>
                    {client.companyName && (
                      <div className="flt-clientspage-client-company">
                        {client.companyName}
                      </div>
                    )}
                  </td>
                  <td className="flt-clientspage-table-cell">
                    <div className="flt-clientspage-client-email">
                      {client.email}
                    </div>
                    {client.phone && (
                      <div className="flt-clientspage-client-phone">
                        {client.phone}
                      </div>
                    )}
                  </td>
                  <td className="flt-clientspage-table-cell">
                    <div className="flt-clientspage-client-activity">
                      <span title="Proposals">📄 {client.proposalsCount}</span>
                      <span title="Invoices">💰 {client.invoicesCount}</span>
                      <span title="Bookings">📅 {client.bookingsCount}</span>
                    </div>
                  </td>
                  <td className="flt-clientspage-table-cell">
                    <div className="flt-clientspage-client-revenue">
                      {formatCurrency(client.totalRevenue)}
                    </div>
                  </td>
                  <td className="flt-clientspage-table-cell flt-clientspage-table-cell--actions">
                    <button
                      onClick={() => navigate(`/clients/${client.id}`)}
                      className="flt-clientspage-action-button flt-clientspage-action-button--edit"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(client.id, client.name)}
                      className="flt-clientspage-action-button flt-clientspage-action-button--delete"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
