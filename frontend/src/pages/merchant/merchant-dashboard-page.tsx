// src/pages/merchant/merchant-dashboard-page.tsx
import { useEffect, useState } from "react";
import { fetchMerchantLeads } from "../../api/leads";
import { fetchMerchantStats } from "../../api/merchant-stats";
import { IconQr, IconUsers } from "../../components/admin/admin-icons";
import { AdminPanelCard } from "../../components/admin/admin-panel-card";
import { AdminStatCard } from "../../components/admin/admin-stat-card";
import {
  AdminAlert,
  AdminBadge,
  AdminEmptyState,
  AdminLoading,
  AdminPageHeader,
  AdminPrimaryLink,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "../../components/admin/admin-ui";
import { linkButtonClass } from "../../components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/use-auth";
import { LEAD_STATUS_COLORS, LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "../../lib/lead-labels";
import type { Lead } from "../../types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function MerchantDashboardPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [scanCount, setScanCount] = useState<number | null>(null);
  const [uniqueScans, setUniqueScans] = useState<number | null>(null);
  const [scansThisWeek, setScansThisWeek] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchMerchantLeads(), fetchMerchantStats()])
      .then(([leadsData, stats]) => {
        setLeads(leadsData);
        setScanCount(stats.qr_scan_count);
        setUniqueScans(stats.qr_unique_scans);
        setScansThisWeek(stats.qr_scans_this_week);
      })
      .catch(() => setError("Impossible de charger vos donnees"))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="Espace commercant"
        title={`Bonjour, ${user?.full_name || user?.email}`}
        description="Transmettez simplement vos recommandations immobilieres et suivez leur avancement."
        backTo=""
        action={
          <div className="flex flex-wrap gap-3">
            <AdminPrimaryLink to="/espace-commercant/ma-fiche">Gerer ma fiche</AdminPrimaryLink>
            <Link to="/espace-commercant/leads/nouveau" className={linkButtonClass("accent")}>
              Transmettre un contact
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {scanCount !== null && (
          <AdminStatCard
            label="Scans totaux"
            value={scanCount}
            hint="Depuis le QR code"
            icon={<IconQr />}
            accent="brass"
          />
        )}
        {uniqueScans !== null && (
          <AdminStatCard
            label="Visiteurs uniques"
            value={uniqueScans}
            hint="Sessions distinctes"
            icon={<IconQr />}
            accent="petrol"
          />
        )}
        {scansThisWeek !== null && (
          <AdminStatCard
            label="Cette semaine"
            value={scansThisWeek}
            hint="Scans sur 7 jours"
            icon={<IconQr />}
            accent="success"
          />
        )}
        <AdminStatCard
          label="Recommandations"
          value={leads.length}
          hint="Contacts transmis"
          icon={<IconUsers />}
          accent="alert"
        />
      </div>

      <AdminPanelCard
        title="Mes recommandations"
        icon={<IconUsers className="h-4 w-4" />}
        action={{ label: "Transmettre un contact", to: "/espace-commercant/leads/nouveau" }}
      >
        {isLoading && <AdminLoading />}
        {error && <AdminAlert>{error}</AdminAlert>}

        {!isLoading && !error && leads.length === 0 && (
          <AdminEmptyState>Aucune recommandation pour le moment.</AdminEmptyState>
        )}

        {leads.length > 0 && (
          <AdminTable>
            <AdminTableHead>
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Projet</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </AdminTableHead>
            <tbody>
              {leads.map((lead) => (
                <AdminTableRow key={lead.id}>
                  <AdminTableCell className="text-ink-muted">{formatDate(lead.created_at)}</AdminTableCell>
                  <AdminTableCell>
                    <p className="font-medium">{lead.contact_name}</p>
                    <p className="text-ink-muted">{lead.contact_phone}</p>
                  </AdminTableCell>
                  <AdminTableCell>{LEAD_TYPE_LABELS[lead.lead_type] || lead.lead_type}</AdminTableCell>
                  <AdminTableCell>
                    <AdminBadge className={LEAD_STATUS_COLORS[lead.status] || "bg-sand text-petrol"}>
                      {LEAD_STATUS_LABELS[lead.status] || lead.status}
                    </AdminBadge>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </tbody>
          </AdminTable>
        )}
      </AdminPanelCard>
    </section>
  );
}
