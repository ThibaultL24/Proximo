import { useEffect, useState } from "react";
import { fetchAdminStats } from "../../api/admin-stats";
import { AdminPanelCard } from "../../components/admin/admin-panel-card";
import { IconFile, IconQr, IconShop } from "../../components/admin/admin-icons";
import { AdminStatCard } from "../../components/admin/admin-stat-card";
import { AdminAlert, AdminLoading, AdminPageHeader } from "../../components/admin/admin-ui";
import type { AdminStats } from "../../types";

// Les comptes immobiliers historiques ne font plus partie de l'interface de
// Fenêtre Ouverte. Ils restent en base pendant la migration vers Proximo.
export function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(() => setError("Impossible de charger les statistiques du réseau."));
  }, []);

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="Fenêtre Ouverte · Audience locale"
        title="Statistiques du territoire"
        description="Comprendre la visibilité du réseau : commerçants, scans QR et contenus de la Gazette. Les chiffres proviennent des données enregistrées."
        backLabel="Vue d'ensemble"
      />

      {error && <AdminAlert>{error}</AdminAlert>}
      {!stats && !error && <AdminLoading />}
      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard label="Fiches publiées" value={stats.merchants.published}
              hint={`${stats.merchants.total} commerces au total`}
              icon={<IconShop />} accent="success" />
            <AdminStatCard label="Commerçants mis en avant" value={stats.merchants.featured}
              hint="Présence dans l'annuaire"
              icon={<IconShop />} accent="brass" />
            <AdminStatCard label="Scans QR" value={stats.qr_scans.total}
              hint={`${stats.qr_scans.this_week} cette semaine`}
              icon={<IconQr />} accent="petrol" />
            <AdminStatCard label="Articles Gazette" value={stats.articles.gazette}
              hint={`${stats.articles.draft} brouillon(s) dans la rédaction`}
              icon={<IconFile />} accent="brass" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <AdminPanelCard
              title="Le journal et ses contenus"
              icon={<IconFile className="h-4 w-4" />}
              actions={[
                { label: "Rédiger les articles", to: "/admin/articles" },
                { label: "Composer le numéro A4", to: "/admin/gazette-studio" },
              ]}
            >
              <p className="mb-4 text-sm text-ink-muted">
                Les articles validés sont réutilisables dans le Studio Gazette.
                Les éditions publiées restent consultables par les habitants.
              </p>
              <div className="rounded-xl bg-paper/70 px-4 py-3">
                <strong className="block text-3xl font-bold text-petrol">{stats.articles.gazette}</strong>
                <span className="text-sm text-ink-muted">Articles de la Gazette</span>
              </div>
            </AdminPanelCard>

            <AdminPanelCard title="Visibilité du réseau QR" icon={<IconQr className="h-4 w-4" />}>
              <p className="font-serif text-4xl font-semibold tabular-nums text-petrol">
                {stats.qr_scans.unique}
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                Sessions distinctes enregistrées à travers les fiches des partenaires.
              </p>
              {stats.qr_scans.top_merchants.length > 0 ? (
                <ul className="mt-5 space-y-2">
                  {stats.qr_scans.top_merchants.map((merchant) => (
                    <li key={merchant.name}
                      className="flex justify-between gap-3 rounded-lg bg-paper/50 px-3 py-2 text-sm">
                      <span>{merchant.name}</span>
                      <strong className="tabular-nums text-petrol">{merchant.scan_count}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-ink-muted">Aucun scan à présenter.</p>
              )}
            </AdminPanelCard>
          </div>
          <p className="text-xs text-ink-muted">
            Cette page décrit l'activité locale. Les recommandations et commissions immobilières
            sont gérées dans Proximo et ne sont plus incluses dans ce tableau de bord.
          </p>
        </>
      )}
    </section>
  );
}
