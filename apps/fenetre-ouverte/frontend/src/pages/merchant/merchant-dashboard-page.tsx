// src/pages/merchant/merchant-dashboard-page.tsx
import { useEffect, useState } from "react";
import { fetchMerchantLeads } from "../../api/leads";
import { fetchMerchantStats } from "../../api/merchant-stats";
import { IconQr, IconUsers } from "../../components/admin/admin-icons";
import { MerchantSubscriptionCard } from "../../components/merchant/merchant-subscription-card";
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
        eyebrow="FENÊTRE OUVERTE · ESPACE COMMERÇANT"
        title={`Votre vitrine locale · ${user?.full_name || user?.email}`}
        description="Présentez votre activité, proposez des actualités à la rédaction et consultez les visites issues de votre QR code."
        backTo=""
        action={
          <div className="flex flex-wrap gap-3">
            <AdminPrimaryLink to="/espace-commercant/publier">Publier une actu</AdminPrimaryLink>
            <AdminPrimaryLink to="/espace-commercant/ma-fiche">Gérer ma fiche</AdminPrimaryLink>
          </div>
        }
      />

      <section aria-label="Les trois actions du commerçant" className="grid gap-4 md:grid-cols-3">
        {[
          {
            to:"/espace-commercant/ma-fiche", step:"01", title:"Ma fiche",
            description:"Mettez à jour votre présentation, vos coordonnées et vos photos.",
          },
          {
            to:"/espace-commercant/publier", step:"02", title:"Mes publications",
            description:"Proposez une actualité. La rédaction la valide avant diffusion.",
          },
          {
            to:"/espace-commercant", step:"03", title:"Ma visibilité",
            description:"Retrouvez ci-dessous les statistiques QR disponibles.",
          },
        ].map(item => <Link key={item.step} to={item.to}
          className="rounded-2xl border border-[#dbe5ee] bg-white p-5 shadow-sm transition hover:border-[#0b4c93] hover:shadow-md">
          <span className="text-xs font-extrabold tracking-widest text-[#d47e18]">ÉTAPE {item.step}</span>
          <h2 className="mt-3 font-sans text-lg font-extrabold text-[#0b4c93]">{item.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.description}</p>
        </Link>)}
      </section>
      <div className="rounded-2xl bg-[#0b4c93] p-5 text-white">
        <h2 className="text-lg font-bold">Votre visibilité en un regard</h2>
        <p className="mt-1 text-sm text-blue-100">Ces compteurs correspondent aux scans enregistrés pour votre fiche, pas à des clients garantis.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>

      <details className="rounded-2xl border border-line bg-white p-5">
        <summary className="cursor-pointer font-semibold text-petrol">Ancien module de recommandations immobilières</summary>
        <p className="mb-4 mt-3 text-xs text-ink-muted">Ce suivi existe encore dans la branche de refactorisation. La gestion immobilière doit à terme se concentrer dans Proximo.</p>
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
      </details>
      <details className="rounded-2xl border border-line bg-white p-5">
        <summary className="cursor-pointer font-semibold text-petrol">Informations d'abonnement de la version actuelle</summary>
        <p className="mb-4 mt-3 text-xs text-ink-muted">Les offres doivent encore être harmonisées avec le nouveau cahier des charges.</p>
        <MerchantSubscriptionCard />
      </details>
    </section>
  );
}
