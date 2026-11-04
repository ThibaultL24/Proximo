// src/components/admin/admin-stat-card.tsx
import type { ReactNode } from "react";
import { Card } from "../ui/card";

type Accent = "petrol" | "brass" | "success" | "alert";

const accentStyles: Record<Accent, { icon: string; ring: string }> = {
  petrol: { icon: "bg-petrol/10 text-petrol", ring: "border-petrol/15" },
  brass: { icon: "bg-brass/15 text-brass", ring: "border-brass/20" },
  success: { icon: "bg-success/10 text-success", ring: "border-success/15" },
  alert: { icon: "bg-alert/10 text-alert", ring: "border-alert/15" },
};

interface AdminStatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  accent?: Accent;
}

export function AdminStatCard({ label, value, hint, icon, accent = "petrol" }: AdminStatCardProps) {
  const styles = accentStyles[accent];

  return (
    <Card className={`relative overflow-hidden border ${styles.ring} p-0`}>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-sand/30 blur-2xl" />
      <div className="relative flex items-start gap-4 p-5">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-brass">{label}</p>
          <p className="mt-1 font-serif text-3xl font-semibold tabular-nums text-petrol">{value}</p>
          {hint && <p className="mt-1 text-sm text-ink-muted">{hint}</p>}
        </div>
      </div>
    </Card>
  );
}
