// src/pages/admin/admin-dashboard-page.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminStats } from "../../api/admin-stats";
import {
  IconBuilding,
  IconChart,
  IconEuro,
  IconFile,
  IconNewspaper,
  IconQr,
  IconShop,
  IconUsers,
} from "../../components/admin/admin-icons";
import { AdminNavTile } from "../../components/admin/admin-nav-tile";
import { AdminStatCard } from "../../components/admin/admin-stat-card";
import { Card } from "../../components/ui/card";
import { linkButtonClass } from "../../components/ui/button";
import type { AdminStats } from "../../types";

const tiles = [
  {
    to: "/admin/analytics",
    title: "Analytics",
    description: "KPIs reseau : scans QR, leads, commissions et contenus publies.",
    icon: <IconChart />,
    accent: "petrol" as const,
  },
  {
    to: "/admin/leads",
    title: "Recommandations",
    description: "Qualifier, refuser et convertir les contacts transmis par les commercants.",
    icon: <IconUsers />,
    accent: "alert" as const,
  },
  {
    to: "/admin/commercants",
    title: "Commercants",
    description: "Creer, modifier et publier les fiches de l'annuaire partenaire.",
    icon: <IconShop />,
    accent: "success" as const,
  },
  {
    to: "/admin/articles",
    title: "Gazette locale",
    description: "Publier actus locales et portraits de commercants par territoire.",
    icon: <IconNewspaper />,
    accent: "brass" as const,
  },
  {
    to: "/admin/immo",
    title: "Articles immo",
    description: "Contenus techniques et editoriaux agence — reserve au detenteur de l'app.",
    icon: <IconBuilding />,
    accent: "petrol" as const,
  },
  {
    to: "/admin/commissions",
    title: "Commissions",
    description: "Suivre, approuver et marquer les commissions dues aux commercants.",
    icon: <IconEuro />,
    accent: "sand" as const,
  },
];

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetchAdminStats().then(setStats).catch(() => {});
  }, []);

  return (
    <section className="space-y-8">
      <Card className="relative overflow-hidden border-petrol/15 bg-linear-to-br from-petrol via-petrol-light to-petrol p-0 text-white">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brass/20 blur-3xl" />
        <div className="absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brass-light">Back-office</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Vue d&apos;ensemble</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-sand/90 sm:text-base">
            Pilotez le reseau local, la gazette territoriale et le pipeline immobilier depuis un seul espace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/admin/analytics" className={linkButtonClass("accent")}>
              Voir les analytics
            </Link>
            <Link
              to="/admin/leads"
              className="inline-flex items-center justify-center rounded-lg border border-white/25 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Pipeline leads
            </Link>
          </div>
        </div>
      </Card>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            label="Commercants"
            value={stats.merchants.published}
            hint={`${stats.merchants.total} au total · ${stats.merchants.featured} mis en avant`}
            icon={<IconShop />}
            accent="success"
          />
          <AdminStatCard
            label="Scans QR"
            value={stats.qr_scans.total}
            hint={`${stats.qr_scans.this_week} cette semaine · ${stats.qr_scans.unique} uniques`}
            icon={<IconQr />}
            accent="brass"
          />
          <AdminStatCard
            label="Recommandations"
            value={stats.leads.total}
            hint={`${stats.leads.this_month} ce mois-ci`}
            icon={<IconUsers />}
            accent="alert"
          />
          <AdminStatCard
            label="Contenus publies"
            value={stats.articles.gazette + stats.articles.immo}
            hint={`${stats.articles.gazette} gazette · ${stats.articles.immo} immo`}
            icon={<IconFile />}
            accent="petrol"
          />
        </div>
      )}

      <div>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brass">Raccourcis</p>
            <h2 className="font-serif text-2xl font-semibold text-petrol">Modules du back-office</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {tiles.map((tile) => (
            <AdminNavTile key={tile.to} {...tile} />
          ))}
        </div>
      </div>
    </section>
  );
}
