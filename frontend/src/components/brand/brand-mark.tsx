// src/components/brand/brand-mark.tsx
interface BrandMarkProps {
  className?: string;
  title?: string;
}

/** Symbole fenêtre — cadre ouvert sur le territoire. */
export function BrandMark({ className = "h-8 w-8", title = "Fenêtre Ouverte" }: BrandMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect x="3" y="3" width="34" height="34" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 20h34M20 3v34" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 28c2.5-3 5.5-4.5 12-4.5S29.5 25 32 28"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}
