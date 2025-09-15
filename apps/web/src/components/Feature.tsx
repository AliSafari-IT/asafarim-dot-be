import { Arrow, Spark } from "@asafarim/shared-ui-react";

export default function Feature({
    title,
    desc,
    href,
    external,
  }: {
    title: string;
    desc: string;
    href: string;
    external?: boolean;
  }) {
    const body = (
      <article className="feature-card p-4">
        <h3 className="flex items-center gap-sm font-semibold mb-2 text-brand">
          <Spark /> {title}
        </h3>
        <p className="text-secondary mb-2" style={{ fontSize: '0.875rem' }}>{desc}</p>
        <span className="flex items-center gap-sm text-primary font-semibold" style={{ fontSize: '0.875rem' }}>
          Open <Arrow />
        </span>
      </article>
    );
    return external ? (
      <a href={href} target="_blank" rel="noreferrer" className="no-underline">
        {body}
      </a>
    ) : (
      <a href={href} className="no-underline">{body}</a>
    );
  }