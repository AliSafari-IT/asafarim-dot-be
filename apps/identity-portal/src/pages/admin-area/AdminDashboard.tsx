// File: src/pages/admin-area/AdminDashboard.tsx
import AuthLayout from "../../components/AuthLayout";
import "./admin-dashboard.css";
import { useToast } from "@asafarim/toast";
import { useAuth } from "@asafarim/shared-ui-react";
import { useTranslation } from "@asafarim/shared-i18n";

export default function AdminDashboard() {
  const toast = useToast();
  const { user } = useAuth();
  const { t } = useTranslation("identityPortal");
  const dashboardData = {
    "user-management": {
      title: t("admin-area.dashboard.user-management.title"),
      description: t("admin-area.dashboard.user-management.description"),
      icon: "👥",
      link: "/admin-area/users",
    },
    "role-management": {
      title: t("admin-area.dashboard.role-management.title"),
      description: t("admin-area.dashboard.role-management.description"),
      icon: "🛡️",
      link: "/admin-area/roles",
    },
  };

  return (
    <div data-testid="admin-dashboard-page">
      <AuthLayout title={t("admin-area.dashboard.title")}>
        <div className="identity-portal-admin-dashboard">
          <header className="dashboard-header">
            <h1>{t("admin-area.dashboard.title")}</h1>
            <p>{t("admin-area.dashboard.description")}</p>
          </header>

          <section className="dashboard-grid">
            {Object.entries(dashboardData).map(([key, value]) => (
              <div className="dashboard-card" key={key}>
                <div className="card-icon">{value.icon}</div>
                <h2>{value.title}</h2>
                <p>{value.description}</p>
                <button
                  className="dashboard-btn"
                  onClick={() => {
                    if ((user?.roles || []).includes("admin")) {
                      window.location.href = value.link;
                    } else {
                      toast.error(t("toast.notAuthorized"));
                    }
                  }}
                >
                  {t("admin-area.dashboard.actions.open")}
                </button>
              </div>
            ))}
          </section>
        </div>
      </AuthLayout>
    </div>
  );
}
