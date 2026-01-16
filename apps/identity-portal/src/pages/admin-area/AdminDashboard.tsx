// File: src/pages/admin-area/AdminDashboard.tsx
import AuthLayout from "../../components/AuthLayout";
import "./admin-dashboard.css";
import { useToast } from "@asafarim/toast";
import { useAuth } from "@asafarim/shared-ui-react";
import { useTranslation } from "@asafarim/shared-i18n";

export default function AdminDashboard() {
  const toast = useToast();
  const { user } = useAuth();
  const { t } = useTranslation("adminArea");
  const dashboardData = {
    "user-management": {
      title: t("dashboard.user-management.title"),
      description: t("dashboard.user-management.description"),
      icon: "👥",
      link: "/admin-area/users",
    },
    "role-management": {
      title: t("dashboard.role-management.title"),
      description: t("dashboard.role-management.description"),
      icon: "🛡️",
      link: "/admin-area/roles",
    },
  };

  return (
    <div data-testid="admin-dashboard-page">
      <AuthLayout title={t("dashboard.title")}>
        <div className="identity-portal-admin-dashboard">
          <header className="dashboard-header">
            <h1>{t("dashboard.title")}</h1>
            <p>{t("dashboard.description")}</p>
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
                  {t("dashboard.actions.open")}
                </button>
              </div>
            ))}
          </section>
        </div>
      </AuthLayout>
    </div>
  );
}
