// Test Automation Hero component
import { Hero as SharedHero } from "@asafarim/shared-ui-react";

export default function Hero() {
  const kicker = "ASafariM • Testora";
  const title = "Testora: Automate, Execute, and Analyze Your Tests";
  const subtitle =
    "Powerful and unified test automation for executing, monitoring, and analyzing your end-to-end tests.";
  const bullets = [
    "Run and monitor automated E2E tests across environments.",
    "Visualize detailed test reports and analytics.",
    "Integrate with CI/CD pipelines for continuous testing.",
  ];
  const primaryCta = { label: "Start Test Run", to: "/run" };
  const secondaryCta = { label: "View Test Reports", to: "/reports" };

  return (
    <SharedHero
      kicker={kicker}
      title={title}
      subtitle={subtitle}
      bullets={bullets}
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
      className="hero-section-home"
      
      
      // media={<TestPreview />}
    />
  );
}
