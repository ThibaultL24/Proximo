// src/components/admin/admin-nav-tile.tsx
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type TileAccent = "petrol" | "brass" | "success" | "alert" | "sand";

const tileAccents: Record<TileAccent, string> = {
  petrol: "from-petrol/8 to-surface group-hover:border-petrol/25",
  brass: "from-brass/10 to-surface group-hover:border-brass/30",
  success: "from-success/8 to-surface group-hover:border-success/25",
  alert: "from-alert/8 to-surface group-hover:border-alert/25",
  sand: "from-sand/40 to-surface group-hover:border-sand-dark",
};

const iconAccents: Record<TileAccent, string> = {
  petrol: "bg-petrol/10 text-petrol group-hover:bg-petrol group-hover:text-white",
  brass: "bg-brass/15 text-brass group-hover:bg-brass group-hover:text-white",
  success: "bg-success/10 text-success group-hover:bg-success group-hover:text-white",
  alert: "bg-alert/10 text-alert group-hover:bg-alert group-hover:text-white",
  sand: "bg-sand text-petrol group-hover:bg-petrol group-hover:text-white",
};

interface AdminNavTileProps {
  to: string;
  title: string;
  description: string;
  icon: ReactNode;
  accent?: TileAccent;
}

export function AdminNavTile({ to, title, description, icon, accent = "petrol" }: AdminNavTileProps) {
  return (
    <Link to={to} className="group block h-full">
      <article
        className={`flex h-full flex-col rounded-2xl border border-sand-dark/60 bg-linear-to-br ${tileAccents[accent]} p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
      >
        <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${iconAccents[accent]}`}>
          {icon}
        </div>
        <h2 className="font-serif text-xl font-semibold text-petrol">{title}</h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{description}</p>
        <span className="mt-4 text-sm font-medium text-brass transition group-hover:text-petrol">
          Ouvrir →
        </span>
      </article>
    </Link>
  );
}
