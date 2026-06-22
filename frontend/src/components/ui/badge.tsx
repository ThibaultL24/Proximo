// src/components/ui/badge.tsx
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "partner" | "featured" | "category";
  className?: string;
}

const variants = {
  default: "bg-sand text-petrol",
  partner: "bg-petrol/10 text-petrol",
  featured: "bg-brass/15 text-brass",
  category: "bg-paper-dark text-ink-muted border border-sand-dark",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
