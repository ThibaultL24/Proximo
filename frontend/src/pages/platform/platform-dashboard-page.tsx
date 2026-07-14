// src/pages/platform/platform-dashboard-page.tsx
import { useEffect, useState } from "react";
import { fetchPlatformStats } from "../../api/platform-stats";
import { IconBuilding, IconQr, IconShop, IconUsers } from "../../components/admin/admin-icons";
import { AdminStatCard } from "../../components/admin/admin-stat-card";
import { AdminAlert, AdminLoading, AdminPageHeader, AdminTable, AdminTableCell, AdminTableHead, AdminTableRow } from "../../components/admin/admin-ui";
import { Card } from "../../components/ui/card";
import type { PlatformStats } from "../../types";

function formatEuros(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PlatformDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlatformStats()
      .then(setStats)
      .catch(() => setError("Impossible de charger les statistiques plateforme"))
      .finally(() => setIsLoading(false));
  }, []);

  const totalMrr = stats
    ? stats.subscriptions.agency_mrr_cents +
      stats.subscriptions.client_mrr_cents +
      stats.subscriptions.merchant_mrr_cents
    : 0;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="Super admin"
        title="Vue plateforme Proxi Immo"
        description="Suivi global des agences, citoyens, commercants et visiteurs."
        backTo=""
      />

      {error && <AdminAlert>{error}</AdminAlert>}
      {isLoading && <AdminLoading />}

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              label="Agences immo"
              value={stats.agencies.total}
              hint={`${stats.agencies.subscribed} abonnees · ${stats.agencies.active} actives`}
              icon={<IconBuilding />}
              accent="petrol"
            />
            <AdminStatCard
              label="Citoyens"
              value={stats.clients.total}
              hint={`${stats.clients.subscribed} abonnes · ${stats.clients.this_month} ce mois`}
              icon={<IconUsers />}
              accent="alert"
            />
            <AdminStatCard
              label="Commercants"
              value={stats.merchants.total}
              hint={`${stats.merchants.published} publies · ${stats.merchants.subscribed} abonnes`}
              icon={<IconShop />}
              accent="success"
            />
            <AdminStatCard
              label="Visiteurs QR"
              value={stats.visitors.qr_scans_unique}
              hint={`${stats.visitors.qr_scans_total} scans · ${stats.visitors.qr_scans_this_week} cette semaine`}
              icon={<IconQr />}
              accent="brass"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-brass">Revenus recurrents estimes</p>
              <p className="mt-2 font-serif text-3xl font-semibold text-petrol">{formatEuros(totalMrr)}</p>
              <p className="mt-2 text-sm text-ink-muted">/ mois (agences + citoyens + commercants)</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-brass">Leads plateforme</p>
              <p className="mt-2 font-serif text-3xl font-semibold text-petrol">{stats.leads.total}</p>
              <p className="mt-2 text-sm text-ink-muted">
                {stats.leads.this_month} ce mois · {stats.leads.direct_agency} directs agence
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-brass">Agences en essai / brouillon</p>
              <p className="mt-2 font-serif text-3xl font-semibold text-petrol">{stats.agencies.draft}</p>
              <p className="mt-2 text-sm text-ink-muted">En attente d&apos;activation licence</p>
            </Card>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-sand-dark/40 px-6 py-4">
              <h2 className="font-serif text-xl font-semibold text-petrol">Agences sur la plateforme</h2>
            </div>
            <AdminTable>
              <AdminTableHead>
                <tr>
                  <th className="px-4 py-3 font-medium">Agence</th>
                  <th className="px-4 py-3 font-medium">Ville</th>
                  <th className="px-4 py-3 font-medium">Commercants</th>
                  <th className="px-4 py-3 font-medium">Citoyens</th>
                  <th className="px-4 py-3 font-medium">Leads</th>
                  <th className="px-4 py-3 font-medium">Licence</th>
                  <th className="px-4 py-3 font-medium">Creee le</th>
                </tr>
              </AdminTableHead>
              <tbody>
                {stats.agencies_list.map((agency) => (
                  <AdminTableRow key={agency.id}>
                    <AdminTableCell className="font-medium text-petrol">{agency.name}</AdminTableCell>
                    <AdminTableCell>{agency.city || "—"}</AdminTableCell>
                    <AdminTableCell>{agency.merchants_count}</AdminTableCell>
                    <AdminTableCell>{agency.clients_count}</AdminTableCell>
                    <AdminTableCell>{agency.leads_count}</AdminTableCell>
                    <AdminTableCell>{agency.subscription_status || agency.status}</AdminTableCell>
                    <AdminTableCell className="text-ink-muted">{formatDate(agency.created_at)}</AdminTableCell>
                  </AdminTableRow>
                ))}
              </tbody>
            </AdminTable>
          </Card>
        </>
      )}
    </section>
  );
}
