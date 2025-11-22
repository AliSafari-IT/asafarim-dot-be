import { useTranslation } from '@asafarim/shared-i18n';

const tutorialSteps = [
  {
    key: 'install',
    code: `pnpm add @asafarim/shared-i18n`
  },
  {
    key: 'initialize',
    code: `// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initI18n } from '@asafarim/shared-i18n';

import enApp from './locales/en/app.json';
import nlApp from './locales/nl/app.json';

initI18n({
  defaultNS: 'common',
  ns: ['common', 'app'],
  resources: {
    en: { app: enApp },
    nl: { app: nlApp }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);`
  },
  {
    key: 'translate',
    code: `import { useTranslation } from '@asafarim/shared-i18n';

export function WelcomeMessage() {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('languageChanged')}</p>
    </div>
  );
}`
  },
  {
    key: 'languageHook',
    code: `import { useLanguage } from '@asafarim/shared-i18n';

export function LanguageToggle() {
  const { language, changeLanguage, isChanging } = useLanguage();

  return (
    <button onClick={() => changeLanguage(language === 'en' ? 'nl' : 'en')}>
      {isChanging ? 'Updating…' : 'Switch to ' + (language === 'en' ? 'Dutch' : 'English')}
    </button>
  );
}`
  }
] as const;

export default function CodeExamples() {
  const { t } = useTranslation('demo');

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">{t('tutorial.title')}</h2>
        <p className="section-subtitle" style={{ marginBottom: '2.5rem' }}>
          {t('tutorial.description')}
        </p>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {tutorialSteps.map((step, index) => (
            <div key={step.key} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '999px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.125rem'
                  }}
                >
                  {index + 1}
                </span>
                <div>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)'
                    }}
                  >
                    {t(`tutorial.stepLabel${index + 1}`)}
                  </p>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    {t(`tutorial.steps.${step.key}.title`)}
                  </h3>
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    {t(`tutorial.steps.${step.key}.description`)}
                  </p>
                </div>
              </div>

              <pre style={{ margin: 0 }}>
                <code>{step.code}</code>
              </pre>

              <p
                style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: 'var(--color-text-muted)',
                  borderLeft: '3px solid var(--color-border)',
                  paddingLeft: '0.75rem'
                }}
              >
                {t(`tutorial.steps.${step.key}.tip`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
