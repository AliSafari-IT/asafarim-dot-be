import { useTranslation } from '@asafarim/shared-i18n';

const features = [
  { key: 'multilang', icon: '🌍' },
  { key: 'persistence', icon: '💾' },
  { key: 'backend', icon: '🔄' },
  { key: 'hooks', icon: '🪝' },
  { key: 'detection', icon: '🔍' },
  { key: 'typescript', icon: '📘' }
];

export default function Features() {
  const { t } = useTranslation('demo');

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">{t('features.title')}</h2>
        <div className="grid grid-3">
          {features.map(({ key, icon }) => (
            <div key={key} className="card">
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {t(`features.items.${key}.title`)}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
                {t(`features.items.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
