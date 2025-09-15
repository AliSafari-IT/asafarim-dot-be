// Hero component
import { Hero as SharedHero } from "@asafarim/shared-ui-react";

export default function Hero() {
    const kicker = "ASafariM";
    const title = "ASafariM • Multi‑framework monorepo";
    const subtitle = "Multi‑framework frontends (React, Angular, Docusaurus)";
    const bullets = [
        ".NET 8+ APIs with clean architecture and typed clients",
        "Shared tokens and UI for consistent theming",
    ];
    const primaryCta = { label: "Explore Apps", to: "/about" };
    const secondaryCta = { label: "Contact Me", to: "/contact" };
    const media = null;
    const className = "";
    return <SharedHero 
        kicker={kicker}
        title={title}
        subtitle={subtitle}
        bullets={bullets}
        primaryCta={primaryCta}
        secondaryCta={secondaryCta}
        media={media}
        className={className}
    />;
}