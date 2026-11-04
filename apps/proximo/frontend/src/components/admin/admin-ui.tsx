// src/components/admin/admin-ui.tsx
import type { ReactNode, SelectHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { buttonClass, linkButtonClass } from "../ui/button";
import { Card } from "../ui/card";

export const adminInputClass =
  "w-full rounded-xl border border-sand-dark/60 bg-surface px-3 py-2.5 text-sm text-ink transition focus:border-petrol/40 focus:outline-none focus:ring-2 focus:ring-petrol/10";

export const adminSelectClass =
  "rounded-xl border border-sand-dark/60 bg-surface px-3 py-2.5 text-sm text-ink transition focus:border-petrol/40 focus:outline-none focus:ring-2 focus:ring-petrol/10";

interface AdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  backTo?: string;
  backLabel?: string;
  action?: ReactNode;
}

export function AdminPageHeader({
  eyebrow = "Back-office",
  title,
  description,
  backTo = "/admin",
  backLabel = "Vue d'ensemble",
  action,
}: AdminPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        {backTo && (
          <Link to={backTo} className="text-sm font-medium text-brass hover:text-petrol">
            &larr; {backLabel}
          </Link>
        )}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">{eyebrow}</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-petrol">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{description}</p>}
        </div>
      </div>
      {action}
    </header>
  );
}

export function AdminPrimaryLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={linkButtonClass("primary")}>
      {children}
    </Link>
  );
}

interface AdminFiltersProps {
  children: ReactNode;
}

export function AdminFilters({ children }: AdminFiltersProps) {
  return (
    <Card className="flex flex-wrap items-center gap-3 border-sand-dark/50 bg-paper/40 p-4">
      {children}
    </Card>
  );
}

export function AdminSelect({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${adminSelectClass} ${className}`.trim()} {...props} />;
}

export function AdminAlert({ children }: { children: ReactNode }) {
  return <Card className="border-alert/30 bg-alert/5 p-4 text-sm text-alert">{children}</Card>;
}

export function AdminLoading() {
  return <p className="text-sm text-ink-muted">Chargement...</p>;
}

export function AdminEmptyState({ children }: { children: ReactNode }) {
  return (
    <Card className="border-dashed border-sand-dark bg-surface/50 p-10 text-center text-sm text-ink-muted">
      {children}
    </Card>
  );
}

interface AdminTableProps {
  children: ReactNode;
}

export function AdminTable({ children }: AdminTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">{children}</table>
      </div>
    </Card>
  );
}

export function AdminTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-sand-dark/50 bg-paper/80 text-xs uppercase tracking-wider text-ink-muted">
      {children}
    </thead>
  );
}

export function AdminTableRow({ children }: { children: ReactNode }) {
  return <tr className="border-t border-sand-dark/30 transition hover:bg-paper/40">{children}</tr>;
}

export function AdminTableCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-top ${className}`.trim()}>{children}</td>;
}

export function AdminTableActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

export function AdminActionLink({ to, children, target }: { to: string; children: ReactNode; target?: string }) {
  return (
    <Link
      to={to}
      target={target}
      rel={target === "_blank" ? "noreferrer" : undefined}
      className="text-sm font-medium text-brass hover:text-petrol"
    >
      {children}
    </Link>
  );
}

export function AdminActionButton({
  children,
  onClick,
  disabled,
  variant = "danger",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "danger" | "muted";
}) {
  const className =
    variant === "danger"
      ? "text-sm font-medium text-alert hover:underline disabled:opacity-50"
      : "text-sm font-medium text-ink-muted hover:text-petrol disabled:opacity-50";

  return (
    <button type="button" disabled={disabled} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

interface AdminFormShellProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdminFormShell({ children, onSubmit }: AdminFormShellProps) {
  return (
    <Card className="p-0">
      <form onSubmit={onSubmit} className="space-y-6 p-6 sm:p-8">
        {children}
      </form>
    </Card>
  );
}

export function AdminFieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-sand-dark/40 bg-paper/30 p-5">
      <legend className="px-1 text-sm font-semibold text-petrol">{legend}</legend>
      {children}
    </fieldset>
  );
}

export function AdminHint({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-ink-muted">{children}</p>;
}

export function AdminFormLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block space-y-1.5">
      <span className="text-sm font-medium text-petrol">{children}</span>
      {hint && <span className="block text-xs font-normal text-ink-muted">{hint}</span>}
    </label>
  );
}

export function AdminFormActions({
  isSubmitting,
  submitLabel = "Enregistrer",
  cancelTo,
}: {
  isSubmitting: boolean;
  submitLabel?: string;
  cancelTo: string;
}) {
  return (
    <div className="flex flex-wrap gap-3 border-t border-sand-dark/40 pt-5">
      <button type="submit" disabled={isSubmitting} className={buttonClass("primary")}>
        {isSubmitting ? "Enregistrement..." : submitLabel}
      </button>
      <Link to={cancelTo} className={linkButtonClass("outline")}>
        Annuler
      </Link>
    </div>
  );
}

export function AdminBadge({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`.trim()}>
      {children}
    </span>
  );
}

export function AdminPipelineColumn({
  title,
  count,
  countClassName,
  children,
}: {
  title: string;
  count: number;
  countClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-[280px] flex-1">
      <div className="mb-3 flex items-center justify-between rounded-xl border border-sand-dark/50 bg-surface px-3 py-2">
        <h2 className="text-sm font-semibold text-petrol">{title}</h2>
        <AdminBadge className={countClassName || "bg-sand text-petrol"}>{count}</AdminBadge>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
