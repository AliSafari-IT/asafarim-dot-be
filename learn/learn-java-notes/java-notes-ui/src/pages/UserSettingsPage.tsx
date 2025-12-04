import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserPreferences, updateUserPreferences, type UserPreference } from "../api/notesApi";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import { useAuth } from "../contexts/useAuth";
import "./UserSettingsPage.css";

export default function UserSettingsPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [notesPerPage, setNotesPerPage] = useState(10);
  const [theme, setTheme] = useState<'LIGHT' | 'DARK' | 'SYSTEM'>('SYSTEM');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadPreferences();
  }, [isAuthenticated, navigate]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await getUserPreferences();
      setPreferences(prefs);
      setNotesPerPage(prefs.notesPerPage);
      setTheme(prefs.theme);
      setLanguage(prefs.language);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      
      const updated = await updateUserPreferences({
        notesPerPage,
        theme,
        language,
      });
      
      setPreferences(updated);
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
      
      // Apply theme immediately
      applyTheme(theme);
      
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  const applyTheme = (newTheme: 'LIGHT' | 'DARK' | 'SYSTEM') => {
    const html = document.documentElement;
    
    if (newTheme === 'SYSTEM') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      html.setAttribute('data-theme', newTheme.toLowerCase());
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading-state">
          <div className="loading-spinner">⚙️</div>
          <p>Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <header className="settings-header">
          <h1>⚙️ Settings</h1>
          <p>Customize your experience</p>
        </header>

        {message && (
          <div className={`settings-message ${message.type}`}>
            {message.type === 'success' ? '✓' : '✕'} {message.text}
          </div>
        )}

        <div className="settings-sections">
          {/* Account Section */}
          <section className="settings-section">
            <h2>👤 Account</h2>
            <div className="setting-item">
              <label>Username</label>
              <div className="setting-value">{user?.username || 'Unknown'}</div>
            </div>
            <div className="setting-item">
              <label>Email</label>
              <div className="setting-value">{user?.email || 'Unknown'}</div>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="settings-section">
            <h2>🎨 Appearance</h2>
            <div className="setting-item">
              <label htmlFor="theme">Theme</label>
              <select
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'LIGHT' | 'DARK' | 'SYSTEM')}
                className="setting-select"
              >
                <option value="SYSTEM">System (auto)</option>
                <option value="LIGHT">Light</option>
                <option value="DARK">Dark</option>
              </select>
              <p className="setting-hint">Choose your preferred color scheme</p>
            </div>
          </section>

          {/* Language Section */}
          <section className="settings-section">
            <h2>🌐 Language</h2>
            <div className="setting-item">
              <label htmlFor="language">Display Language</label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="setting-select"
              >
                <option value="en">English</option>
                <option value="nl">Nederlands</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
              </select>
              <p className="setting-hint">Select your preferred language (i18n coming soon)</p>
            </div>
          </section>

          {/* Display Section */}
          <section className="settings-section">
            <h2>📋 Display</h2>
            <div className="setting-item">
              <label htmlFor="notesPerPage">Notes per page</label>
              <select
                id="notesPerPage"
                value={notesPerPage}
                onChange={(e) => setNotesPerPage(Number(e.target.value))}
                className="setting-select"
              >
                <option value={10}>10 notes</option>
                <option value={20}>20 notes</option>
                <option value={50}>50 notes</option>
              </select>
              <p className="setting-hint">Number of notes to show per page in the notes list</p>
            </div>
          </section>
        </div>

        <div className="settings-actions">
          <Button
            variant="brand"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Changes'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </div>

        {preferences?.updatedAt && (
          <p className="settings-footer">
            Last updated: {new Date(preferences.updatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
