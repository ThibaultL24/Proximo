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
import { AgencySubscriptionCard } from "../../components/admin/agency-subscription-card";
import { AdminNavTile } from "../../components/admin/admin-nav-tile";
import { AdminStatCard } from "../../components/admin/admin-stat-card";
import { Card } from "../../components/ui/card";
import { linkButtonClass } from "../../components/ui/button";
import type { AdminStats } from "../../types";

const tiles = [
  {
    to: "/admin/moderation",
    title: "Modération",
    description: "Relire les publications des commerçants et valider les modifications de fiches.",
    icon: <IconUsers />,
    accent: "alert" as const,
  },
  {
    to: "/admin/commercants",
    title: "Fiches commerçantes",
    description: "Mettre à jour l'annuaire et vérifier les informations visibles des habitants.",
    icon: <IconShop />,
    accent: "success" as const,
  },
  {
    to: "/admin/articles",
    title: "Rédaction Gazette",
    description: "Créer et corriger les articles avant leur mise en page pour l'édition papier.",
    icon: <IconNewspaper />,
    accent: "brass" as const,
  },
  {
    to: "/admin/gazette-studio",
    title: "Studio Gazette",
    description: "Composer le numéro A4, importer les photos, enregistrer et publier l'édition.",
    icon: <IconFile />,
    accent: "petrol" as const,
  },
  {
    to: "/admin/analytics",
    title: "Statistiques du territoire",
    description: "Consulter les scans QR et les indicateurs de diffusion disponibles.",
    icon: <IconChart />,
    accent: "petrol" as const,
  },
];

const legacyTiles = [
  {
    to: "/admin/leads", title: "Recommandations historiques",
    description: "Module conservé pendant la séparation avec Proximo.", icon: <IconUsers />,
    accent: "alert" as const,
  },
  {
    to: "/admin/immo", title: "Anciens articles immo",
    description: "Contenus hérités du monolithe, à réconcilier.", icon: <IconBuilding />,
    accent: "petrol" as const,
  },
  {
    to: "/admin/commissions", title: "Commissions historiques",
    description: "Module en attente de séparation complète avec Proximo.", icon: <IconEuro />,
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
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brass-light">FENÊTRE OUVERTE · PILOTAGE LOCAL</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Piloter la vie locale</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-sand/90 sm:text-base">
            Animez les communes, validez les contenus des commerçants et préparez la prochaine édition de la Gazette depuis un même espace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/admin/moderation" className={linkButtonClass("accent")}>
              Modérer les publications
            </Link>
            <Link
              to="/admin/gazette-studio"
              className="inline-flex items-center justify-center rounded-lg border border-white/25 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Ouvrir le Studio Gazette
            </Link>
          </div>
        </div>
      </Card>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            label="Commerçants"
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
            label="Contenus publiés"
            value={stats.articles.gazette + stats.articles.immo}
            hint={`${stats.articles.gazette} gazette · ${stats.articles.immo} immo`}
            icon={<IconFile />}
            accent="petrol"
          />
        </div>
      )}

      <section className="space-y-4" aria-label="Le parcours de publication">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brass">Votre parcours éditorial</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-petrol">De la proposition au journal publié</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { number:"01", title:"Relire", body:"Valider les fiches et les posts proposés.", href:"/admin/moderation" },
            { number:"02", title:"Rédiger", body:"Préparer les articles et les portraits.", href:"/admin/articles" },
            { number:"03", title:"Composer", body:"Assembler le numéro dans le Studio A4.", href:"/admin/gazette-studio" },
          ].map(step => <Link key={step.number} to={step.href}
            className="rounded-2xl border border-[#cbd9e8] bg-white p-5 transition hover:border-[#0b4c93] hover:shadow-md">
            <span className="text-xs font-extrabold tracking-widest text-[#db7c19]">ÉTAPE {step.number}</span>
            <h3 className="mt-3 text-lg font-extrabold text-[#0b4c93]">{step.title}</h3>
            <p className="mt-1 text-sm text-ink-muted">{step.body}</p>
          </Link>)}
        </div>
      </section>
      <div>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brass">Raccourcis</p>
            <h2 className="font-serif text-2xl font-semibold text-petrol">Vos outils éditoriaux</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {tiles.map((tile) => (
            <AdminNavTile key={tile.to} {...tile} />
          ))}
        </div>
      </div>
      <details className="rounded-xl border border-line bg-white p-5">
        <summary className="cursor-pointer text-sm font-bold text-petrol">Modules hérités de l'ancien produit immobilier</summary>
        <p className="mt-2 text-xs text-ink-muted">Conservés pour la compatibilité, ils ne font pas partie du parcours éditorial principal.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {legacyTiles.map(tile => <AdminNavTile key={tile.to} {...tile} />)}
        </div>
        <div className="mt-5"><AgencySubscriptionCard /></div>
      </details>
    </section>
  );
}
