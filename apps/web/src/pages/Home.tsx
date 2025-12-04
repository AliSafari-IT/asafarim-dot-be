import { isProduction } from "@asafarim/shared-ui-react";
import { useTranslation } from "@asafarim/shared-i18n";
import Hero from "../components/Hero";
import Feature from "../components/Feature";
import './home.css';

export default function Home() {
  const { t } = useTranslation('web');

  return (
    <section className="section">
      <Hero />
      <div className="container">
        <div className="features-grid mb-8">
          <Feature
            title={t("home.features.whatBuilding.title")}
            desc={t("home.features.whatBuilding.description")}
            href={
              isProduction
                ? "https://asafarim.be/what-is-building"
                : "/what-is-building"
            }
          />

          <Feature
            title={t("home.features.smartops.title")}
            desc={t("home.features.smartops.description")}
            href={
              isProduction
                ? "https://smartops.asafarim.be"
                : "http://smartops.asafarim.local:5175"
            }
          />

          <Feature
            title={t("home.features.testora.title")}
            desc={t("home.features.testora.description")}
            href={
              isProduction
                ? "https://testora.asafarim.be"
                : "http://testora.asafarim.local:5176"
            }
          />

          <Feature
            title={t("home.features.testoraEngine.title")}
            desc={t("home.features.testoraEngine.description")}
            href={
              isProduction
                ? "https://testora.asafarim.be/runner"
                : "http://testora.asafarim.local:5176/runner"
            }
          />

          <Feature
            title={t("home.features.taskManagement.title")}
            desc={t("home.features.taskManagement.description")}
            href={
              isProduction
                ? "https://taskmanagement.asafarim.be"
                : "http://taskmanagement.asafarim.local:5177"
            }
          />

          <Feature
            title={t("home.features.studynotes.title")}
            desc={t("home.features.studynotes.description")}
            href={
              isProduction
                ? "https://studynotes.asafarim.be"
                : "http://studynotes.asafarim.local:5183"
            }
          />

          <Feature
            title={t("home.features.ai.title")}
            desc={t("home.features.ai.description")}
            href={
              isProduction
                ? "https://ai.asafarim.be"
                : "http://ai.asafarim.local:5173"
            }
          />
          <Feature
            title={t("home.features.core.title")}
            desc={t("home.features.core.description")}
            href={
              isProduction
                ? "https://core.asafarim.be"
                : "http://core.asafarim.local:5174"
            }
          />
          <Feature
            title={t("home.features.jobs.title")}
            desc={t("home.features.jobs.description")}
            href={
              isProduction
                ? "https://core.asafarim.be/jobs"
                : "http://core.asafarim.local:5174/jobs"
            }
          />
          <Feature
            title={t("home.features.blog.title")}
            desc={t("home.features.blog.description")}
            href={
              isProduction
                ? "https://blog.asafarim.be/"
                : "http://blog.asafarim.local:3000/"
            }
            external
          />
        </div>

        <div className="divider mb-8">
          <h2 className="text-xl font-semibold mb-2 text-brand">
            {t("home.monorepo.title")}
          </h2>
          <ul className="list-disc">
            <li className="mb-1">{t("home.monorepo.items.tokens")}</li>
            <li className="mb-1">{t("home.monorepo.items.apps")}</li>
            <li className="mb-1">{t("home.monorepo.items.blog")}</li>
            <li className="mb-1">{t("home.monorepo.items.apis")}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
