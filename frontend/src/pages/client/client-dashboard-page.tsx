// src/pages/client/client-dashboard-page.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchClientLeads } from "../../api/client-leads";
import { IconUsers } from "../../components/admin/admin-icons";
import { ClientSubscriptionCard } from "../../components/client/client-subscription-card";
import { AdminPanelCard } from "../../components/admin/admin-panel-card";
import {
  AdminAlert,
  AdminBadge,
  AdminEmptyState,
  AdminLoading,
  AdminPageHeader,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "../../components/admin/admin-ui";
import { linkButtonClass } from "../../components/ui/button";
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

export function ClientDashboardPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClientLeads()
      .then(setLeads)
      .catch(() => setError("Impossible de charger vos projets"))
      .finally(() => setIsLoading(false));
  }, []);

  const subscriptionActive = user?.subscription?.active;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        eyebrow="Espace citoyen"
        title={`Bonjour, ${user?.full_name || user?.email}`}
        description="Consultez l'annuaire gratuitement et transmettez vos projets immobiliers a l'agence."
        backTo=""
        action={
          subscriptionActive ? (
            <Link to="/espace-client/leads/nouveau" className={linkButtonClass("accent")}>
              Nouveau projet immo
            </Link>
          ) : undefined
        }
      />

      <ClientSubscriptionCard />

      <AdminPanelCard
        title="Mes projets transmis"
        icon={<IconUsers className="h-4 w-4" />}
        action={
          subscriptionActive
            ? { label: "Nouveau projet", to: "/espace-client/leads/nouveau" }
            : undefined
        }
      >
        {isLoading && <AdminLoading />}
        {error && <AdminAlert>{error}</AdminAlert>}

        {!isLoading && !error && leads.length === 0 && (
          <AdminEmptyState>
            {subscriptionActive
              ? "Aucun projet transmis pour le moment."
              : "Abonnez-vous pour transmettre votre premier projet."}
          </AdminEmptyState>
        )}

        {leads.length > 0 && (
          <AdminTable>
            <AdminTableHead>
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Projet</th>
                <th className="px-4 py-3 font-medium">Canal</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </AdminTableHead>
            <tbody>
              {leads.map((lead) => (
                <AdminTableRow key={lead.id}>
                  <AdminTableCell className="text-ink-muted">{formatDate(lead.created_at)}</AdminTableCell>
                  <AdminTableCell>{LEAD_TYPE_LABELS[lead.lead_type] || lead.lead_type}</AdminTableCell>
                  <AdminTableCell className="text-sm text-ink-muted">
                    {lead.merchant ? lead.merchant.name : "Direct agence"}
                  </AdminTableCell>
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
