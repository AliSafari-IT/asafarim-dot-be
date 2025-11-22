import { useTranslation } from '@asafarim/shared-i18n';

export default function Hero() {
  const { t } = useTranslation('demo');

  return (
    <section className="section" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="section-title" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>
            {t('hero.title')}
          </h1>
          <p className="section-subtitle" style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
            {t('hero.subtitle')}
          </p>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '700px', margin: '0 auto 2rem' }}>
            {t('hero.description')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="https://github.com/AliSafari-IT/asafarim-dot-be/tree/main/packages/shared-i18n" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              {t('footer.viewSource')}
            </a>
            <a 
              href="#demo" 
              className="btn btn-secondary"
            >
              {t('demo.title')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
