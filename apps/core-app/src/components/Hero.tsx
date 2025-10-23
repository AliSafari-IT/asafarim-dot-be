// AI UI Hero component
import { Hero as SharedHero } from "@asafarim/shared-ui-react";

export default function Hero() {
  const kicker = "ASafariM • Core Suite";
  const title = "Your Complete Career Toolkit";
  const subtitle = "Streamline your job search with intelligent tracking, personalized insights, and AI-powered optimization.";
  const bullets = [
    "Track applications with smart analytics",
    "Tailor resumes with AI precision"
  ];
  const primaryCta = { label: "Start Your Journey", to: "/jobs" };
  const secondaryCta = { label: "Contact", to: "/contact" };

  return (
    <SharedHero
      kicker={kicker}
      title={title}
      subtitle={subtitle}
      bullets={bullets}
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
    />
  );
}
