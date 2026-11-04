// src/components/public/page-header.tsx
interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="space-y-2 border-b border-line pb-6">
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          {eyebrow}
        </p>
      )}
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">{description}</p>
      )}
    </header>
  );
}
