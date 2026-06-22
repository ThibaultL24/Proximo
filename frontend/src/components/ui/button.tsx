// src/components/ui/button.tsx
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "accent" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-petrol text-white hover:bg-petrol-light shadow-sm",
  accent:
    "bg-brass text-white hover:bg-brass-light shadow-sm",
  outline:
    "border border-sand-dark bg-surface text-ink hover:border-petrol hover:text-petrol",
  ghost:
    "text-ink-muted hover:bg-paper-dark hover:text-petrol",
};

export function buttonClass(variant: ButtonVariant = "primary", className = "") {
  return `inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${variantClasses[variant]} ${className}`.trim();
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function linkButtonClass(variant: ButtonVariant = "primary", className = "") {
  return buttonClass(variant, className);
}
