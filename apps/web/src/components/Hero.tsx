// Hero component
import { Hero as SharedHero } from "@asafarim/shared-ui-react";
import { useTranslation } from "@asafarim/shared-i18n";

export default function Hero() {
    const { t } = useTranslation('web');
    
    const kicker = "ASafariM";
    const title = t('home.hero.title');
    const subtitle = t('home.hero.subtitle');
    const bullets = [
        t('home.hero.description'),
        t('home.hero.tagline'),
    ];
    const primaryCta = { label: t('common:about'), to: "/about" };
    const secondaryCta = { label: t('common:contact'), to: "/contact" };
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