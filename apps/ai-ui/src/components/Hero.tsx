// AI UI Hero component
import { Hero as SharedHero } from "@asafarim/shared-ui-react";
import ChatPreview from "./ChatPreview";

export default function Hero() {
  const kicker = "ASafariM • AI Suite";
  const title = "AI-Powered Career Tools";
  const subtitle = "Chat, generate resumes, and streamline your job hunt with thoughtfully designed AI workflows.";
  const bullets = [
    "Conversational AI for quick insights and guidance",
    "Resume Maker with smart sections and tone presets",
    "Job Tools to track, tailor, and prepare applications"
  ];
  const primaryCta = { label: "Try AI Chat", to: "/chat" };
  const secondaryCta = { label: "Resume Maker", to: "/resume-maker" };

  return (
    <SharedHero
      kicker={kicker}
      title={title}
      subtitle={subtitle}
      bullets={bullets}
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
      media={<ChatPreview />}
    />
  );
}
