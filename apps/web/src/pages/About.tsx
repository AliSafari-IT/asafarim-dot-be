import { useTranslation } from "@asafarim/shared-i18n";
import { Hero as SharedHero } from "@asafarim/shared-ui-react";
import "./About.css";
export default function About() {
  const { t } = useTranslation("web");
  const kicker = "ASafariM";
  const title = t("about.title");
  const subtitle = t("about.subtitle");
  const bullets = [t("about.description"), t("about.tagline")];
  const primaryCta = {
    label: t("about.viewResume"),
    to: "/portfolio/cv-nov-2025/public",
  };
  const secondaryCta = { label: t("common:contact"), to: "/contact" };
  const media = null;
  const className = "";

  return (
    <section className="web-about">
      {/* Hero */}
      <SharedHero
        kicker={kicker}
        title={title}
        subtitle={subtitle}
        bullets={bullets}
        primaryCta={primaryCta}
        secondaryCta={secondaryCta}
        media={media}
        className={className}
      />{" "}
      <div className="web-about-container">
        <section className="web-about-section">
          <h2 className="web-about-heading">{t("about.whatIDo.title")}</h2>
          <div className="web-about-section-grid">
            <div className="web-about-section-card">
              <h3>{t("about.whatIDo.backend.title")}</h3>
              <p>{t("about.whatIDo.backend.description")}</p>
            </div>
            <div className="web-about-section-card">
              <h3>{t("about.whatIDo.frontend.title")}</h3>
              <p>{t("about.whatIDo.frontend.description")}</p>
            </div>
            <div className="web-about-section-card">
              <h3>{t("about.whatIDo.fullstack.title")}</h3>
              <p>{t("about.whatIDo.fullstack.description")}</p>
            </div>
          </div>
        </section>

        {/* Key Skills */}
        <div className="web-about-section">
          <h2 className="web-about-heading">{t("about.skills.title")}</h2>
          <ul className="web-about-skills-list">
            <li className="web-about-skill">
              <strong>{t("about.skills.frontend")}</strong>
            </li>
            <li className="web-about-skill">
              <strong>{t("about.skills.backend")}</strong>
            </li>
            <li className="web-about-skill">
              <strong>{t("about.skills.databases")}</strong>
            </li>
            <li className="web-about-skill">
              <strong>{t("about.skills.data")}</strong>
            </li>
            <li className="web-about-skill">
              <strong>{t("about.skills.devops")}</strong>
            </li>
          </ul>
        </div>

        {/* Experience */}
        <div className="web-about-section">
          <h2 className="web-about-heading">{t("about.experience.title")}</h2>
          <div className="web-about-cards">
            <div className="web-about-card">
              <h3 className="web-about-card-title">
                {t("about.experience.xitechnix.title")}
              </h3>
              <p>{t("about.experience.xitechnix.description")}</p>
            </div>
            <div className="web-about-card">
              <h3 className="web-about-card-title">
                {t("about.experience.irc.title")}
              </h3>
              <p>{t("about.experience.irc.description")}</p>
            </div>
            <div className="web-about-card">
              <h3 className="web-about-card-title">
                {t("about.experience.vmm.title")}
              </h3>
              <p>{t("about.experience.vmm.description")}</p>
            </div>
          </div>
        </div>

        {/* Academic */}
        <div className="web-about-section">
          <h2 className="web-about-heading">{t("about.background.title")}</h2>
          <div className="web-about-cards">
            <div className="web-about-education-card">
              <div className="web-about-education-icon" aria-hidden="true">
                🎓
              </div>
              <div className="web-about-education-content">
                <span className="web-about-education-title">
                  {t("about.background.appliedIT.title")}
                  <br />
                  <span className="web-about-education-school">
                    {t("about.background.appliedIT.school")}
                  </span>
                </span>
                <span className="web-about-education-desc">
                  {t("about.background.appliedIT.description")}
                </span>
              </div>
            </div>
            <div className="web-about-education-card">
              <div className="web-about-education-icon" aria-hidden="true">
                🔬
              </div>
              <div className="web-about-education-content">
                <span className="web-about-education-title">
                  {t("about.background.phd.title")}
                  <br />
                  <span className="web-about-education-school">
                    {t("about.background.phd.school")}
                  </span>
                </span>
                <span className="web-about-education-desc">
                  {t("about.background.phd.description")}
                </span>
              </div>
            </div>
            <div className="web-about-education-card">
              <div className="web-about-education-icon" aria-hidden="true">
                🌊
              </div>
              <div className="web-about-education-content">
                <span className="web-about-education-title">
                  {t("about.background.bsc.title")}
                  <br />
                  <span className="web-about-education-school">
                    {t("about.background.bsc.school")}
                  </span>
                </span>
                <span className="web-about-education-desc">
                  {t("about.background.bsc.description")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
