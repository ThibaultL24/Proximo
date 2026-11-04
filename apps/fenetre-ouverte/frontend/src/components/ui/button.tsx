// src/components/ui/button.tsx
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "accent" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-ink text-surface hover:bg-petrol-light",
  accent: "bg-tile text-white hover:bg-tile-light",
  outline: "border border-line-strong bg-surface text-ink hover:border-ink",
  ghost: "text-ink-muted hover:bg-paper-dark hover:text-ink",
};

export function buttonClass(variant: ButtonVariant = "primary", className = "") {
  return `inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tile disabled:opacity-50 ${variantClasses[variant]} ${className}`.trim();
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function linkButtonClass(variant: ButtonVariant = "primary", className = "") {
  return buttonClass(variant, className);
}
