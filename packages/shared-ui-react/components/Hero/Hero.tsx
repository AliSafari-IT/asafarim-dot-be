// D:\repos\asafarim-dot-be\packages\shared-ui-react\components\Hero\Hero.tsx
import type { ReactNode } from "react";
import { Spark, Arrow } from "../../svg-icons";
import { ButtonComponent } from "../Button/ButtonComponent";
import "./Hero.css";

type Cta =
  | { label: string; to: string; href?: never }
  | { label: string; href: string; to?: never };

export interface HeroProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  primaryCta?: Cta;
  secondaryCta?: Cta;
  media?: ReactNode; // optional image, illustration, or any custom node
  className?: string;
}

export function Hero({
  kicker = "",
  title,
  subtitle = "",
  bullets = [],
  primaryCta = { label: "", to: "" },
  secondaryCta = { label: "", to: "" },
  media,
  className = "",
}: HeroProps) {
  return (
    <section className={`hero-section ${className}`}>
      {/* Background decorative effects */}
      <BackgroundDecoration />

      <div className="hero-container">
        <div className={`hero-grid ${media ? 'hero-grid--with-media' : 'hero-grid--centered'}`}>
          {/* Content column */}
          <div className="hero-content">
            {/* Kicker badge */}
            {kicker && (
              <div className="hero-kicker-wrapper">
                <span className="hero-badge">
                  <span className="hero-badge-dot"></span>
                  <span className="hero-badge-text">{kicker}</span>
                </span>
              </div>
            )}

            {/* Headline */}
            <h1 className="hero-title">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="hero-subtitle">
                {subtitle}
              </p>
            )}

            {/* Feature bullets */}
            {bullets?.length > 0 && (
              <ul className="hero-features">
                {bullets.map((b, i) => (
                  <li key={i} className="hero-feature-item">
                    <span className="hero-feature-icon" aria-hidden="true">✓</span>
                    <span className="hero-feature-text">{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Action buttons */}
            {(primaryCta?.label || secondaryCta?.label) && (
              <div className="hero-actions">
                {primaryCta?.label && (
                  <ButtonComponent
                    to={"to" in primaryCta ? primaryCta.to : undefined}
                    href={"href" in primaryCta ? primaryCta.href : undefined}
                    variant="brand"
                    rightIcon={<Spark />}
                  >
                    {primaryCta.label}
                  </ButtonComponent>
                )}
                {secondaryCta?.label && (
                  <ButtonComponent
                    to={"to" in secondaryCta ? secondaryCta.to : undefined}
                    href={"href" in secondaryCta ? secondaryCta.href : undefined}
                    variant="outline"
                    rightIcon={<Arrow />}
                  >
                    {secondaryCta.label}
                  </ButtonComponent>
                )}
              </div>
            )}
          </div>

          {/* Media column */}
          {media && (
            <div className="hero-media">
              <div className="hero-media-card">
                <div className="hero-media-content">
                  {media}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function BackgroundDecoration() {
  return (
    <div className="hero-background">
      <div className="hero-background-glow" />
      <div className="hero-background-grid" />
      <div className="hero-background-gradient" />
    </div>
  );
}



