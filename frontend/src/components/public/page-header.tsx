// src/components/public/page-header.tsx
interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="space-y-2 border-b border-sand-dark/50 pb-6">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">{eyebrow}</p>
      )}
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-petrol sm:text-4xl">
        {title}
      </h1>
      {description && <p className="max-w-2xl text-base text-ink-muted">{description}</p>}
    </header>
  );
}
