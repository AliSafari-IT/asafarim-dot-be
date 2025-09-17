import type { ReactNode } from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import styles from "./index.module.css";
import Root from "../theme/Root";
import { Hero as SharedHero } from "@asafarim/shared-ui-react";
import HeroMedia from "../components/HeroMedia";

function HomepageHeader() {
  const kicker = "Sharing my thoughts and experiences";
  const title = "ASafariM Blog";
  const subtitle = "Welcome to my technical blog where I share insights about software development, clean architecture, and AI technologies...";
  const bullets = [
    "Technical docs, how‑tos, and architecture notes",
    "Change logs and legal docs",
    "Shared tokens and UI across all apps",
  ];
  const primaryCta = {
    label: "Get Started",
    to: "/docs/intro",
  };
  const secondaryCta = {
    label: "View the blog",
    to: "/blog",
  };
  return (
    <SharedHero
      className={clsx("hero", styles.heroBanner)}
      kicker={kicker}
      title={title}
      subtitle={subtitle}
      bullets={bullets}
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
      media={<HeroMedia />}
    />
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Root>
      <Layout
        title={`${siteConfig.title}`}
        description={`${siteConfig.tagline}`}
      >
        <HomepageHeader />
      </Layout>
    </Root>
  );
}
