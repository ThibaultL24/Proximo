// src/pages/admin/admin-analytics-page.tsx
import { useEffect, useState } from "react";
import { fetchAdminStats } from "../../api/admin-stats";
import { AdminPanelCard } from "../../components/admin/admin-panel-card";
import {
  IconChart,
  IconEuro,
  IconFile,
  IconQr,
  IconShop,
  IconUsers,
} from "../../components/admin/admin-icons";
import { AdminStatCard } from "../../components/admin/admin-stat-card";
import {
  AdminAlert,
  AdminLoading,
  AdminPageHeader,
} from "../../components/admin/admin-ui";
import { COMMISSION_STATUS_LABELS } from "../../lib/commission-labels";
import { LEAD_STATUS_LABELS } from "../../lib/lead-labels";
import type { AdminStats } from "../../types";

function formatEuros(cents: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function StatusRow({ label, count }: { label: string; count: number }) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-lg bg-paper/50 px-3 py-2 text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="font-semibold tabular-nums text-petrol">{count}</span>
    </li>
  );
}

export function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(() => setError("Impossible de charger les analytics"));
  }, []);

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="Back-office"
        title="Analytics"
        description="Vue consolidee du reseau : commercants, scans QR, recommandations et commissions."
        backLabel="Vue d'ensemble"
      />

      {error && <AdminAlert>{error}</AdminAlert>}
      {!stats && !error && <AdminLoading />}

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              label="Commercants publies"
              value={stats.merchants.published}
              hint={`${stats.merchants.total} au total`}
              icon={<IconShop />}
              accent="success"
            />
            <AdminStatCard
              label="Scans QR"
              value={stats.qr_scans.total}
              hint={`${stats.qr_scans.this_week} cette semaine`}
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
              label="Commissions"
              value={formatEuros(stats.commissions.total_amount_cents)}
              hint={`${stats.commissions.total} dossiers · ${Math.round(stats.commissions.conversion_rate * 100)}% conversion`}
              icon={<IconEuro />}
              accent="petrol"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              label="A payer"
              value={formatEuros(stats.commissions.payable_cents)}
              hint="Commissions approuvees"
              icon={<IconEuro />}
              accent="alert"
            />
            <AdminStatCard
              label="Deja paye"
              value={formatEuros(stats.commissions.paid_cents)}
              hint="Commissions reglees"
              icon={<IconEuro />}
              accent="success"
            />
            <AdminStatCard
              label="Frais plateforme"
              value={formatEuros(stats.commissions.platform_fee_cents)}
              hint="10% sur commissions actives"
              icon={<IconChart />}
              accent="brass"
            />
            <AdminStatCard
              label="Taux conversion"
              value={`${Math.round(stats.commissions.conversion_rate * 100)} %`}
              hint="Leads convertis / total"
              icon={<IconUsers />}
              accent="petrol"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <AdminPanelCard
              title="Editorial"
              icon={<IconFile className="h-4 w-4" />}
              actions={[
                { label: "Gerer la gazette", to: "/admin/articles" },
                { label: "Articles immo", to: "/admin/immo" },
              ]}
            >
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4 rounded-lg bg-paper/50 px-3 py-2">
                  <dt className="text-ink-muted">Articles gazette publies</dt>
                  <dd className="font-semibold text-petrol">{stats.articles.gazette}</dd>
                </div>
                <div className="flex justify-between gap-4 rounded-lg bg-paper/50 px-3 py-2">
                  <dt className="text-ink-muted">Articles immo publies</dt>
                  <dd className="font-semibold text-petrol">{stats.articles.immo}</dd>
                </div>
                <div className="flex justify-between gap-4 rounded-lg bg-paper/50 px-3 py-2">
                  <dt className="text-ink-muted">Brouillons</dt>
                  <dd className="font-semibold text-petrol">{stats.articles.draft}</dd>
                </div>
              </dl>
            </AdminPanelCard>

            <AdminPanelCard title="Scans QR uniques" icon={<IconQr className="h-4 w-4" />}>
              <p className="font-serif text-4xl font-semibold tabular-nums text-petrol">{stats.qr_scans.unique}</p>
              <p className="mt-2 text-sm text-ink-muted">Sessions distinctes sur l&apos;ensemble du reseau.</p>
              {stats.qr_scans.top_merchants.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {stats.qr_scans.top_merchants.map((merchant) => (
                    <StatusRow key={merchant.name} label={merchant.name} count={merchant.scan_count} />
                  ))}
                </ul>
              )}
            </AdminPanelCard>

            <AdminPanelCard
              title="Pipeline leads"
              icon={<IconUsers className="h-4 w-4" />}
              action={{ label: "Ouvrir le pipeline", to: "/admin/leads" }}
            >
              <ul className="space-y-2">
                {Object.entries(stats.leads.by_status).map(([status, count]) => (
                  <StatusRow key={status} label={LEAD_STATUS_LABELS[status] || status} count={count} />
                ))}
              </ul>
            </AdminPanelCard>

            <AdminPanelCard
              title="Commissions"
              icon={<IconChart className="h-4 w-4" />}
              action={{ label: "Gerer les commissions", to: "/admin/commissions" }}
            >
              <dl className="mb-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4 rounded-lg bg-paper/50 px-3 py-2">
                  <dt className="text-ink-muted">Volume total</dt>
                  <dd className="font-semibold tabular-nums text-petrol">
                    {formatEuros(stats.commissions.total_amount_cents)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 rounded-lg bg-paper/50 px-3 py-2">
                  <dt className="text-ink-muted">A payer</dt>
                  <dd className="font-semibold tabular-nums text-petrol">
                    {formatEuros(stats.commissions.payable_cents)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 rounded-lg bg-paper/50 px-3 py-2">
                  <dt className="text-ink-muted">Frais plateforme</dt>
                  <dd className="font-semibold tabular-nums text-petrol">
                    {formatEuros(stats.commissions.platform_fee_cents)}
                  </dd>
                </div>
              </dl>
              <ul className="space-y-2">
                {Object.entries(stats.commissions.by_status).map(([status, count]) => (
                  <StatusRow
                    key={status}
                    label={COMMISSION_STATUS_LABELS[status] || status}
                    count={count}
                  />
                ))}
              </ul>
            </AdminPanelCard>
          </div>
        </>
      )}
    </section>
  );
}
