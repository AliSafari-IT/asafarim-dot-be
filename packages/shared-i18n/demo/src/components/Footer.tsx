import { useTranslation } from '@asafarim/shared-i18n';

export default function Footer() {
  const { t } = useTranslation('demo');

  return (
    <footer style={{ 
      backgroundColor: 'var(--color-surface)', 
      borderTop: '1px solid var(--color-border)',
      padding: '2rem 0',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1rem',
          textAlign: 'center'
        }}>
          <p style={{ color: 'var(--color-text-muted)' }}>
            {t('footer.madeWith')} ❤️ {t('footer.by')} <a href="https://asafarim.be" target="_blank" rel="noopener noreferrer">ASafariM</a>
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a 
              href="https://github.com/AliSafari-IT/asafarim-dot-be/tree/main/packages/shared-i18n" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {t('footer.viewSource')}
            </a>
            <a 
              href="https://github.com/AliSafari-IT/asafarim-dot-be/blob/main/packages/shared-i18n/README.md" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {t('footer.documentation')}
            </a>
            <a 
              href="https://www.npmjs.com/package/@asafarim/shared-i18n" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              NPM
            </a>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {t('common:copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
