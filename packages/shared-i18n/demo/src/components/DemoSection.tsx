import { useTranslation, useLanguage, LANGUAGE_COOKIE_NAME } from '@asafarim/shared-i18n';

export default function DemoSection() {
  const { t } = useTranslation(['demo', 'common']);
  const { language, changeLanguage, isChanging } = useLanguage();

    const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() ?? 'Not set';
    return 'Not set';
  };

  return (
    <section id="demo" className="section" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="container">
        <h2 className="section-title">{t('demo:demo.title')}</h2>
        
        <div className="grid grid-2">
          {/* Translation Example */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
              {t('demo:demo.translationExample')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <strong>{t('demo:demo.commonKeys')}:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  <li>{t('common:welcome')}</li>
                  <li>{t('common:language')}</li>
                  <li>{t('common:settings')}</li>
                  <li>{t('common:submit')}</li>
                </ul>
              </div>
              <div>
                <strong>{t('demo:demo.customKeys')}:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  <li>{t('demo:hero.title')}</li>
                  <li>{t('demo:features.title')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Hook Usage */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
              {t('demo:demo.hookUsage')}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              {t('demo:demo.hookDescription')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <strong>{t('demo:demo.currentLang')}:</strong> <code>{language}</code>
              </div>
              <button
                onClick={() => changeLanguage(language === 'en' ? 'nl' : 'en')}
                disabled={isChanging}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {isChanging ? t('demo:demo.isChanging') : t('demo:demo.switchLang')}
              </button>
            </div>
          </div>

          {/* Cookie Info */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
              {t('demo:demo.cookieInfo')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <strong>{t('demo:demo.cookieName')}:</strong> <code>{LANGUAGE_COOKIE_NAME}</code>
              </div>
              <div>
                <strong>{t('demo:demo.cookieValue')}:</strong> <code>{getCookie(LANGUAGE_COOKIE_NAME)}</code>
              </div>
              <div>
                <strong>Expiry:</strong> <span style={{ color: 'var(--color-text-muted)' }}>{t('demo:demo.cookieExpiry')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
