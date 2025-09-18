import type { ReactNode } from "react";
import { Button } from "./Button";
import { Spark, Arrow } from "../svg-icons";
import ShowcaseCard from "./ShowcaseCard";

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

export default function Hero({
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
    <section className={`relative overflow-hidden section ${className}`}>
      {/* Background decorative grid + glow */}
      <BackgroundDecoration />

      <div className="container">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          {/* Left column: copy */}
          <div>
            {/* Kicker */}
            <div className="flex items-center gap-sm mb-3">
              <span className="badge">
                <span className="badge-dot"></span>
                {kicker}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-phosphor">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-lg text-secondary mb-5" style={{ maxWidth: "46rem" }}>
                {subtitle}
              </p>
            )}

            {/* Bullets */}
            {bullets?.length > 0 && (
              <ul className="mb-6 space-y-2">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-secondary">
                    <span aria-hidden className="mt-1 text-brand">
                      •
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-md mt-2">
              {primaryCta && (
                <Button
                  to={"to" in primaryCta ? primaryCta.to : undefined}
                  href={"href" in primaryCta ? primaryCta.href : undefined}
                  variant="brand"
                  rightIcon={<Spark />}
                >
                  {primaryCta.label}
                </Button>
              )}
              {secondaryCta && (
                <Button
                  to={"to" in secondaryCta ? secondaryCta.to : undefined}
                  href={"href" in secondaryCta ? secondaryCta.href : undefined}
                  variant="outline"
                  rightIcon={<Arrow />}
                >
                  {secondaryCta.label}
                </Button>
              )}
            </div>
          </div>

          {/* Right column: media or placeholder card */}
          <div className="relative">
            {media ? (
              <div className="rounded-lg border border-neutral-800 p-4 md:p-6 backdrop-blur-sm">
                {media}
              </div>
            ) : (
              <ShowcaseCard />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function BackgroundDecoration() {
  return (
    <>
      <div className="hero-glow" />
      <div className="hero-grid" />
    </>
  );
}



