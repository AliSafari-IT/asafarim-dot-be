import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi, calendarApi, type DashboardStatsDto } from "../api";
import { formatCurrency, formatRelativeTime } from "../utils/apiHelpers";
import { formatDurationCompact } from "../utils/dateUtils";
import DashboardCard from "../components/DashboardCard";
import type { BookingResponseDto } from "../types";
import "../styles/pages/dashboard.css";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<
    BookingResponseDto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    loadUpcomingBookings();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError("Failed to load dashboard stats");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingBookings = async () => {
    try {
      const bookings = await calendarApi.getDashboardUpcoming(5);
      setUpcomingBookings(bookings);
    } catch (err) {
      console.error("Failed to load upcoming bookings:", err);
    }
  };

  if (loading) {
    return <div className="flt-dashboard-loading">Loading dashboard...</div>;
  }

  if (error || !stats) {
    return (
      <div className="flt-dashboard-error">
        {error || "Failed to load dashboard"}
      </div>
    );
  }

  const statCards = [
    {
      title: "Revenue This Month",
      value: formatCurrency(stats.revenueThisMonth),
      change: `${
        stats.revenuePercentChange >= 0 ? "+" : ""
      }${stats.revenuePercentChange.toFixed(1)}%`,
      changeColor:
        stats.revenuePercentChange >= 0
          ? "var(--success-text)"
          : "var(--error-text)",
    },
    {
      title: "Unpaid Invoices",
      value: stats.unpaidInvoices.toString(),
      subtitle: formatCurrency(stats.unpaidAmount),
      color: "var(--warning-text)",
    },
    {
      title: "Active Proposals",
      value: stats.sentProposals.toString(),
      subtitle: `${stats.proposalAcceptanceRate.toFixed(0)}% acceptance`,
      color: "var(--info-text)",
    },
    {
      title: "Upcoming Bookings",
      value: stats.upcomingBookings.toString(),
      subtitle: `${stats.bookingsThisWeek} this week`,
      color: "var(--success-text)",
    },
  ];

  return (
    <div className="flt-dashboard-container">
      {/* Stats Cards */}
      <div className="flt-dashboard-stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="flt-dashboard-stat-card">
            <div className="flt-dashboard-stat-label">{card.title}</div>
            <div
              className="flt-dashboard-stat-value"
              style={{ color: card.color || "var(--color-text)" }}
            >
              {card.value}
            </div>
            {card.subtitle && (
              <div className="flt-dashboard-stat-change">{card.subtitle}</div>
            )}
            {card.change && (
              <div
                className={`flt-dashboard-stat-change ${
                  card.changeColor === "var(--success-text)"
                    ? "flt-dashboard-stat-change--positive"
                    : "flt-dashboard-stat-change--negative"
                }`}
              >
                {card.change} vs last month
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="flt-dashboard-section">
        {/* Recent Invoices */}
        <DashboardCard
          title="Recent Invoices"
          icon="📄"
          action={{ label: "View All", href: "/invoices" }}
        >
          {stats.recentInvoices.length === 0 ? (
            <div className="flt-dashboard-empty">No recent invoices</div>
          ) : (
            stats.recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                onClick={() => navigate(`/invoices/${invoice.id}`)}
                className="flt-dashboard-activity-item"
              >
                <div>
                  <div className="flt-dashboard-activity-title">
                    {invoice.invoiceNumber}
                  </div>
                  <div className="flt-dashboard-activity-description">
                    {invoice.clientName}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600 }}>
                    {formatCurrency(invoice.total)}
                  </div>
                  <div className="flt-dashboard-activity-time">
                    {formatRelativeTime(invoice.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </DashboardCard>

        {/* Recent Proposals */}
        <DashboardCard
          title="Recent Proposals"
          icon="📋"
          action={{ label: "View All", href: "/proposals" }}
        >
          {stats.recentProposals.length === 0 ? (
            <div className="flt-dashboard-empty">No recent proposals</div>
          ) : (
            stats.recentProposals.map((proposal) => (
              <div
                key={proposal.id}
                onClick={() => navigate(`/proposals/${proposal.id}`)}
                className="flt-dashboard-activity-item"
              >
                <div>
                  <div className="flt-dashboard-activity-title">
                    {proposal.proposalNumber}
                  </div>
                  <div className="flt-dashboard-activity-description">
                    {proposal.clientName}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600 }}>
                    {formatCurrency(proposal.total)}
                  </div>
                  <div className="flt-dashboard-activity-time">
                    {formatRelativeTime(proposal.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </DashboardCard>

        {/* Upcoming Bookings */}
        <DashboardCard
          title="Upcoming Bookings"
          icon="📅"
          action={{ label: "View All", href: "/calendar" }}
        >
          {upcomingBookings.length === 0 ? (
            <div className="flt-dashboard-empty">No upcoming bookings</div>
          ) : (
            upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => navigate(`/calendar`)}
                className="flt-dashboard-activity-item"
              >
                <div>
                  <div className="flt-dashboard-activity-title">
                    {booking.title}
                  </div>
                  <div className="flt-dashboard-activity-description">
                    {booking.clientName && `${booking.clientName} • `}
                    {formatRelativeTime(booking.startTime)} •{" "}
                    {formatDurationCompact(booking.durationMinutes)}
                  </div>
                </div>
              </div>
            ))
          )}
        </DashboardCard>
      </div>
    </div>
  );
};
