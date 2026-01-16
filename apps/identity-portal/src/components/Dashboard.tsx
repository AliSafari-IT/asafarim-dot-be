import { useState } from "react";
import "./dashboard.css";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import {
  BLOG_URL,
  WEB_URL,
  AI_URL,
  CORE_URL,
  openInNewTab,
  PUBLICATIONS_URL,
  RESUME_URL,
  TASKS_URL,
  SMARTOPS_URL,
  TESTORA_URL,
  STUDYNOTES_URL,
  KIDCODE_URL,
} from "../utils/appUrls";
import ChangePasswordModal from "./ChangePasswordModal";
import useAuth from "../hooks/useAuth";
import { useTranslation } from "@asafarim/shared-i18n";

export const Dashboard = () => {
  const { user } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { t } = useTranslation("identityPortal");

  const roles = (user?.roles || ["Viewer"]).join(", ");

  return (
    <div className="dash" data-testid="dashboard-component">
      <header className="dash-header">
        <div className="dash-header-inner">
          <h1 className="dash-title">{t("dashboard.title")}</h1>
          <p className="dash-subtitle">{user?.firstName || user?.email}</p>
        </div>
      </header>

      <main className="dash-main">
        <section className="dash-grid">
          <article className="card">
            <h2 className="card-title">
              {t("dashboard.user-management.title")}
            </h2>
            <div className="field">
              <label>{t("dashboard.user-management.email")}</label>
              <input
                className="field-input"
                value={user?.email || ""}
                readOnly
              />
            </div>
            <div className="field">
              <label>{t("dashboard.user-management.username")}</label>
              <input
                className="field-input"
                value={user?.userName || ""}
                readOnly
              />
            </div>
          </article>

          <article className="card">
            <h2 className="card-title">{t("dashboard.access.title")}</h2>
            <div className="field">
              <label>{t("dashboard.access.roles")}</label>
              <input className="field-input" value={roles} readOnly />
            </div>
          </article>
        </section>

        <section className="card actions">
          <h2 className="card-title">{t("dashboard.actions.title")}</h2>
          <div className="actions-row">
            <Button
              onClick={() =>
                (window.location.href = (user?.roles || []).some((r: string) =>
                  /^(admin|superadmin)$/i.test(r)
                )
                  ? "/admin-area/user-profile"
                  : "/me")
              }
              variant="success"
            >
              {t("dashboard.actions.editProfile")}
            </Button>

            <Button
              onClick={() => setIsPasswordModalOpen(true)}
              variant="warning"
            >
              {t("dashboard.actions.changePassword")}
            </Button>

            {(user?.roles || []).some((r: string) =>
              /^(admin|superadmin)$/i.test(r)
            ) && (
              <Button
                onClick={() => (window.location.href = "/admin-area/users")}
                variant="info"
              >
                {t("dashboard.actions.manageUsers")}
              </Button>
            )}

            <Button onClick={() => openInNewTab(BLOG_URL)} variant="info">
              Open blog
            </Button>
            <Button onClick={() => openInNewTab(WEB_URL)} variant="info">
              Web portal
            </Button>
            <Button onClick={() => openInNewTab(AI_URL)} variant="info">
              AI portal
            </Button>
            <Button onClick={() => openInNewTab(CORE_URL)} variant="info">
              Core portal
            </Button>
            {/** my publications */}
            <Button
              onClick={() => openInNewTab(PUBLICATIONS_URL)}
              variant="info"
            >
              My publications
            </Button>
            {/** resume */}
            <Button onClick={() => openInNewTab(RESUME_URL)} variant="info">
              Resume
            </Button>

            <Button onClick={() => openInNewTab(TASKS_URL)} variant="brand">
              Task Management App
            </Button>
            <Button onClick={() => openInNewTab(SMARTOPS_URL)} variant="brand">
              SmartOps
            </Button>
            <Button onClick={() => openInNewTab(TESTORA_URL)} variant="brand">
              E2E Test Automation
            </Button>
            <Button
              onClick={() => openInNewTab(STUDYNOTES_URL)}
              variant="outline"
            >
              Java StudyNotes App
            </Button>
            <Button onClick={() => openInNewTab(KIDCODE_URL)} variant="success">
              KidCode Studio
            </Button>
            {/* SmartPath UI */}
            <Button onClick={() => openInNewTab("http://smartpath.asafarim.local:5195")} variant="secondary">
              SmartPath UI
            </Button>
          </div>
        </section>
      </main>

      {/* Password Change Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
