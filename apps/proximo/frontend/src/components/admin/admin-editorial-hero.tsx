// src/components/admin/admin-editorial-hero.tsx
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/card";

interface AdminEditorialHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  icon?: ReactNode;
  backTo?: string;
  backLabel?: string;
  primaryAction?: { to: string; label: string };
  secondaryAction?: { to: string; label: string };
}

export function AdminEditorialHero({
  eyebrow,
  title,
  description,
  icon,
  backTo = "/admin",
  backLabel = "Vue d'ensemble",
  primaryAction,
  secondaryAction,
}: AdminEditorialHeroProps) {
  return (
    <Card className="relative overflow-hidden border-petrol/15 bg-linear-to-br from-petrol via-petrol-light to-petrol p-0 text-white">
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 left-1/4 h-36 w-36 rounded-full bg-success/15 blur-2xl" />

      <div className="relative px-6 py-8 sm:px-8 sm:py-10">
        {backTo && (
          <Link
            to={backTo}
            className="text-sm font-medium text-white/75 transition hover:text-white"
          >
            &larr; {backLabel}
          </Link>
        )}

        <div className="mt-4 flex flex-wrap items-start gap-4">
          {icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sand/80">{eyebrow}</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sand/90 sm:text-base">{description}</p>
          </div>
        </div>

        {(primaryAction || secondaryAction) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {primaryAction && (
              <Link
                to={primaryAction.to}
                className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-petrol shadow-sm transition hover:bg-sand/90"
              >
                {primaryAction.label}
              </Link>
            )}
            {secondaryAction && (
              <Link
                to={secondaryAction.to}
                className="inline-flex items-center justify-center rounded-lg border border-white/25 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                {secondaryAction.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
