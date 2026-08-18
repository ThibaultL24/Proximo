// src/components/brand/brand-image-fallback.tsx
import { BrandMark } from "./brand-mark";

interface BrandImageFallbackProps {
  className?: string;
}

/** Visuel de remplacement quand une photo produit / fiche est absente. */
export function BrandImageFallback({ className = "" }: BrandImageFallbackProps) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-paper-dark ${className}`.trim()}
      aria-hidden
    >
      <BrandMark className="h-14 w-14 text-ink/20" />
    </div>
  );
}
