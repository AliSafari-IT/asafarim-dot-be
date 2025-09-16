// AI UI Hero component
import { Hero as SharedHero } from "@asafarim/shared-ui-react";

export default function Hero() {
  const kicker = "ASafariM • Core Suite";
  const title = "Job Tracker";
  const subtitle = "Track, Tailor, and Prepare your job applications with thoughtfully designed AI workflows.";
  const bullets = [
    "Track your job applications",
    "Tailor your job applications",
    "Prepare your job applications"
  ];
  const primaryCta = { label: "Try Job Tracker", to: "/jobs" };

  return (
    <SharedHero
      kicker={kicker}
      title={title}
      subtitle={subtitle}
      bullets={bullets}
      primaryCta={primaryCta}
    />
  );
}
