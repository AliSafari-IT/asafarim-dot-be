import { useTranslation } from "@asafarim/shared-i18n";

export default function About() {
    const { t } = useTranslation('web');
  
  return (
    <section className="web-about">
      <div className="web-about-container">
        {/* Hero */}
        <div className="web-about-hero">
          <h1 className="web-about-title">{t('about.title')}</h1>
          <p className="web-about-subtitle">
            {t('about.subtitle')}
          </p>
          <div className="web-about-actions">
            <a href="https://asafarim.be/portfolio/my-react-dotnet-cv-10-10-2025/public" className="btn-primary">
              {t('about.viewResume')}
            </a>
            <a href="/contact" className="btn-secondary">
              {t('about.contactMe')}
            </a>
          </div>
        </div>

        <section className="web-about-section">
          <h2 className="web-about-heading">{t('about.whatIDo.title')}</h2>
          <div className="web-about-section-grid">
            <div className="web-about-section-card">
              <h3>{t('about.whatIDo.backend.title')}</h3>
              <p>
                {t('about.whatIDo.backend.description')}
              </p>
            </div>
            <div className="web-about-section-card">
              <h3>{t('about.whatIDo.frontend.title')}</h3>
              <p>
                {t('about.whatIDo.frontend.description')}
              </p>
            </div>
            <div className="web-about-section-card">
              <h3>{t('about.whatIDo.fullstack.title')}</h3>
              <p>
                {t('about.whatIDo.fullstack.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Key Skills */}
        <div className="web-about-section">
          <h2 className="web-about-heading">{t('about.skills.title')}</h2>
          <ul className="web-about-skills-list">
            <li className="web-about-skill">
              <strong>{t('about.skills.frontend')}</strong>
            </li>
            <li className="web-about-skill">
              <strong>{t('about.skills.backend')}</strong>
            </li>
            <li className="web-about-skill">
              <strong>{t('about.skills.databases')}</strong>
            </li>
            <li className="web-about-skill">
              <strong>{t('about.skills.data')}</strong>
            </li>
            <li className="web-about-skill">
              <strong>{t('about.skills.devops')}</strong>
            </li>
          </ul>
        </div>

        {/* Experience */}
        <div className="web-about-section">
          <h2 className="web-about-heading">{t('about.experience.title')}</h2>
          <div className="web-about-cards">
            <div className="web-about-card">
              <h3 className="web-about-card-title">{t('about.experience.xitechnix.title')}</h3>
              <p>
                {t('about.experience.xitechnix.description')}
              </p>
            </div>
            <div className="web-about-card">
              <h3 className="web-about-card-title">{t('about.experience.irc.title')}</h3>
              <p>
                {t('about.experience.irc.description')}
              </p>
            </div>
            <div className="web-about-card">
              <h3 className="web-about-card-title">{t('about.experience.vmm.title')}</h3>
              <p>
                {t('about.experience.vmm.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Academic */}
        <div className="web-about-section">
          <h2 className="web-about-heading">{t('about.background.title')}</h2>
          <div className="web-about-cards">
            <div className="web-about-education-card">
              <div className="web-about-education-icon" aria-hidden="true">🎓</div>
              <div className="web-about-education-content">
                <span className="web-about-education-title">
                  {t('about.background.appliedIT.title')}<br/>
                  <span className="web-about-education-school">{t('about.background.appliedIT.school')}</span>
                </span>
                <span className="web-about-education-desc">
                  {t('about.background.appliedIT.description')}
                </span>
              </div>
            </div>
            <div className="web-about-education-card">
              <div className="web-about-education-icon" aria-hidden="true">🔬</div>
              <div className="web-about-education-content">
                <span className="web-about-education-title">
                  {t('about.background.phd.title')}<br/>
                  <span className="web-about-education-school">{t('about.background.phd.school')}</span>
                </span>
                <span className="web-about-education-desc">
                  {t('about.background.phd.description')}
                </span>
              </div>
            </div>
            <div className="web-about-education-card">
              <div className="web-about-education-icon" aria-hidden="true">🌊</div>
              <div className="web-about-education-content">
                <span className="web-about-education-title">
                  {t('about.background.bsc.title')}<br/>
                  <span className="web-about-education-school">{t('about.background.bsc.school')}</span>
                </span>
                <span className="web-about-education-desc">
                  {t('about.background.bsc.description')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
