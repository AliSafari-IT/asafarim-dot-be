import { useState, useEffect, useCallback } from "react";
import { adminSystemApi } from "../../api/adminApi";
import type { SystemSetting } from "../../api/adminApi";
import "./AdminPages.css";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState<Record<string, SystemSetting[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsRes, maintenanceRes] = await Promise.all([
        adminSystemApi.getSettingsByCategory(),
        adminSystemApi.getMaintenanceStatus(),
      ]);
      setSettings(settingsRes.data);
      setMaintenanceMode(maintenanceRes.data.maintenanceMode);
      setAnnouncement(maintenanceRes.data.announcement || "");
    } catch (err) {
      setError("Failed to load settings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      setSaving(true);
      await adminSystemApi.updateSetting(key, value);
      loadSettings();
    } catch (err) {
      console.error(err);
      alert("Failed to update setting");
    } finally {
      setSaving(false);
    }
  };

  const handleMaintenanceToggle = async () => {
    try {
      setSaving(true);
      await adminSystemApi.setMaintenanceMode(!maintenanceMode, announcement);
      setMaintenanceMode(!maintenanceMode);
    } catch (err) {
      console.error(err);
      alert("Failed to toggle maintenance mode");
    } finally {
      setSaving(false);
    }
  };

  const categories = Object.keys(settings);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>System Settings</h1>
          <p>Configure system-wide settings</p>
        </div>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : (
        <>
          {/* Maintenance Mode Card */}
          <div className="admin-card admin-maintenance-card">
            <h3>Maintenance Mode</h3>
            <p>When enabled, users will see a maintenance message.</p>

            <div className="admin-maintenance-controls">
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={handleMaintenanceToggle}
                  disabled={saving}
                />
                <span className="admin-toggle-slider"></span>
                <span className="admin-toggle-label">
                  {maintenanceMode ? "Enabled" : "Disabled"}
                </span>
              </label>

              <div className="admin-maintenance-announcement">
                <label>Announcement Message</label>
                <textarea
                  id="announcement-message"
                  name="announcement-message"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Optional message to show users..."
                  rows={5}
                />
                <Button
                  onClick={() =>
                    adminSystemApi.setMaintenanceMode(
                      maintenanceMode,
                      announcement
                    )
                  }
                  disabled={saving}
                >
                  Update Announcement
                </Button>
              </div>
            </div>
          </div>

          {/* Settings by Category */}
          {categories.map((category) => (
            <div key={category} className="admin-card">
              <h3>{category || "General"}</h3>
              <div className="admin-settings-list">
                {settings[category].map((setting) => (
                  <div key={setting.id} className="admin-setting-item">
                    <div className="admin-setting-info">
                      <div className="admin-setting-key">{setting.key}</div>
                      <div className="admin-setting-desc">
                        {setting.description || "No description"}
                      </div>
                    </div>
                    <div className="admin-setting-value">
                      {setting.valueType === "BOOLEAN" ? (
                        <label className="admin-toggle small">
                          <input
                            type="checkbox"
                            checked={setting.value === "true"}
                            onChange={(e) =>
                              handleUpdateSetting(
                                setting.key,
                                e.target.checked ? "true" : "false"
                              )
                            }
                            disabled={saving}
                          />
                          <span className="admin-toggle-slider"></span>
                        </label>
                      ) : (
                        <input
                          type="text"
                          value={setting.value}
                          onChange={(e) =>
                            handleUpdateSetting(setting.key, e.target.value)
                          }
                          className="admin-setting-input"
                          disabled={saving}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default AdminSettingsPage;
