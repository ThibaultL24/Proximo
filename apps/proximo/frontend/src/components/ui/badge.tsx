// src/components/ui/badge.tsx
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "partner" | "featured" | "category" | "soon";
  className?: string;
}

const variants = {
  default: "bg-paper-dark text-ink",
  partner: "bg-navy-soft text-ink",
  featured: "bg-tile-soft text-tile",
  category: "bg-transparent text-ink-muted",
  soon: "bg-sun-soft text-ink",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex text-[11px] font-semibold uppercase tracking-[0.08em] ${variants[variant]} ${variant !== "category" ? "rounded px-2 py-0.5" : ""} ${className}`}
    >
      {children}
    </span>
  );
}
