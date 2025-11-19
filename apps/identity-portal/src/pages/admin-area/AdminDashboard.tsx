// File: src/pages/admin-area/AdminDashboard.tsx
import AuthLayout from "../../components/AuthLayout";
import "./admin-dashboard.css";

export default function AdminDashboard() {
  const dashboardData = {
    "user-management": {
      title: "User Management",
      description: "Manage platform users and their permissions.",
      icon: "👥",
      link: "/admin-area/users",
    },
    "role-management": {
      title: "Role Management",
      description: "Define and update system roles and privileges.",
      icon: "🛡️",
      link: "/admin-area/roles",
    },
  };

  return (
    <div data-testid="admin-dashboard-page">
      <AuthLayout title="Admin Dashboard">
        <div className="identity-portal-admin-dashboard">
        <header className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage Identity Portal entities</p>
        </header>

        <section className="dashboard-grid">
          {Object.entries(dashboardData).map(([key, value]) => (
            <div className="dashboard-card" key={key}>
              <div className="card-icon">{value.icon}</div>
              <h2>{value.title}</h2>
              <p>{value.description}</p>
              <button
                className="dashboard-btn"
                onClick={() => (window.location.href = value.link)}
              >
                Open
              </button>
            </div>
          ))}
        </section>
        </div>
      </AuthLayout>
    </div>
  );
}
