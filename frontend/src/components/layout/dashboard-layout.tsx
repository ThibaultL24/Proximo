// src/components/layout/dashboard-layout.tsx
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  IconBuilding,
  IconChart,
  IconEuro,
  IconGrid,
  IconNewspaper,
  IconShop,
  IconUsers,
} from "../admin/admin-icons";
import { useAuth } from "../../hooks/use-auth";

interface DashboardLayoutProps {
  kind: "admin" | "merchant";
}

const adminLinks = [
  { to: "/admin", label: "Vue d'ensemble", icon: IconGrid, end: true },
  { to: "/admin/analytics", label: "Analytics", icon: IconChart },
  { to: "/admin/commercants", label: "Commercants", icon: IconShop },
  { to: "/admin/articles", label: "Gazette locale", icon: IconNewspaper },
  { to: "/admin/immo", label: "Articles immo", icon: IconBuilding },
  { to: "/admin/leads", label: "Recommandations", icon: IconUsers },
  { to: "/admin/commissions", label: "Commissions", icon: IconEuro },
];

const merchantLinks = [
  { to: "/espace-commercant", label: "Tableau de bord", icon: IconGrid, end: true },
  { to: "/espace-commercant/ma-fiche", label: "Ma fiche vitrine", icon: IconShop },
  { to: "/espace-commercant/leads/nouveau", label: "Transmettre un contact", icon: IconUsers },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
    isActive
      ? "bg-petrol text-white shadow-sm"
      : "text-ink-muted hover:bg-surface hover:text-petrol",
  ].join(" ");
}

export function DashboardLayout({ kind }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const links = kind === "admin" ? adminLinks : merchantLinks;
  const title = kind === "admin" ? "Back-office" : "Espace commercant";
  const homePath = kind === "admin" ? "/admin" : "/espace-commercant";

  const initials = (user?.full_name || user?.email || "?")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-paper via-paper-dark/20 to-paper">
      <header className="border-b border-sand-dark/50 bg-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to={homePath} className="group flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-petrol font-serif text-sm font-semibold text-white">
              P
            </span>
            <span>
              <span className="block font-serif text-lg font-semibold leading-tight text-petrol">Proxi Immo</span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-brass">{title}</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-sand-dark/50 bg-paper/60 py-1 pl-1 pr-3 sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brass/20 text-xs font-semibold text-petrol">
                {initials}
              </span>
              <span className="max-w-[140px] truncate text-sm text-ink-muted">
                {user?.full_name || user?.email}
              </span>
            </div>
            <Link to="/" className="text-sm text-ink-muted transition hover:text-petrol">
              Site public
            </Link>
            <button type="button" onClick={logout} className="text-sm text-ink-muted transition hover:text-petrol">
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row md:gap-8 md:py-8">
        <aside className="md:w-56 md:shrink-0">
          <nav className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:rounded-2xl md:border md:border-sand-dark/50 md:bg-surface md:p-2 md:shadow-sm">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={navLinkClass}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
