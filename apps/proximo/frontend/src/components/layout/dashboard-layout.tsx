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
import { BrandMark } from "../brand/brand-mark";
import { BRAND } from "../../lib/brand";
import { useAuth } from "../../hooks/use-auth";

interface DashboardLayoutProps {
  kind: "admin" | "merchant" | "client" | "super_admin";
}

const adminLinks = [
  { to: "/admin", label: "Vue d'ensemble", icon: IconGrid, end: true },
  { to: "/admin/analytics", label: "Analytics", icon: IconChart },
  { to: "/admin/commercants", label: "Commerçants", icon: IconShop },
  { to: "/admin/articles", label: "Gazette", icon: IconNewspaper },
  { to: "/admin/immo", label: "Articles immo", icon: IconBuilding },
  { to: "/admin/leads", label: "Recommandations", icon: IconUsers },
  { to: "/admin/commissions", label: "Commissions", icon: IconEuro },
];

const merchantLinks = [
  { to: "/espace-commercant", label: "Tableau de bord", icon: IconGrid, end: true },
  { to: "/espace-commercant/publier", label: "Publier", icon: IconNewspaper },
  { to: "/espace-commercant/ma-fiche", label: "Ma fiche vitrine", icon: IconShop },
  { to: "/espace-commercant/leads/nouveau", label: "Transmettre un contact", icon: IconUsers },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
    isActive
      ? "bg-ink text-white"
      : "text-ink-muted hover:bg-surface hover:text-ink",
  ].join(" ");
}

const clientLinks = [
  { to: "/espace-client", label: "Tableau de bord", icon: IconGrid, end: true },
];

const platformLinks = [
  { to: "/plateforme", label: "Vue plateforme", icon: IconGrid, end: true },
  { to: "/plateforme/integrations", label: "Integrations reseaux", icon: IconNewspaper },
];

export function DashboardLayout({ kind }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const links =
    kind === "super_admin" ? platformLinks : kind === "admin" ? adminLinks : kind === "merchant" ? merchantLinks : clientLinks;
  const title =
    kind === "super_admin"
      ? "Plateforme"
      : kind === "admin"
        ? "Back-office"
        : kind === "merchant"
          ? "Espace commerçant"
          : "Espace citoyen";
  const homePath =
    kind === "super_admin"
      ? "/plateforme"
      : kind === "admin"
        ? "/admin"
        : kind === "merchant"
          ? "/espace-commercant"
          : "/espace-client";

  const initials = (user?.full_name || user?.email || "?")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-[#f0eee9]">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4">
          <Link to={homePath} className="group flex min-w-0 items-center gap-2 text-ink sm:gap-3">
            <BrandMark className="h-8 w-8 shrink-0" />
            <span className="min-w-0">
              <span className="block truncate font-serif text-base font-semibold leading-tight sm:text-lg">{BRAND.name}</span>
              <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">{title}</span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-lg border border-line bg-[#f7f5f1] py-1 pl-1 pr-3 sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-navy-soft text-xs font-semibold text-ink">
                {initials}
              </span>
              <span className="max-w-[140px] truncate text-sm text-ink-muted">
                {user?.full_name || user?.email}
              </span>
            </div>
            <Link to="/" className="hidden text-sm text-ink-muted transition hover:text-ink sm:inline">
              Site public
            </Link>
            <button type="button" onClick={logout} className="text-xs text-ink-muted transition hover:text-ink sm:text-sm">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row md:gap-8 md:py-8">
        <aside className="md:w-56 md:shrink-0">
          <nav className="no-scrollbar flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:rounded-xl md:border md:border-line md:bg-white md:p-2">
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
