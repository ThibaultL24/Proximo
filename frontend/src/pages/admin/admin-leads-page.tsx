// src/pages/admin/admin-leads-page.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { convertLead, fetchAdminLeads, qualifyLead, rejectLead } from "../../api/leads";
import {
  AdminAlert,
  AdminLoading,
  AdminPageHeader,
  AdminPipelineColumn,
} from "../../components/admin/admin-ui";
import { buttonClass } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { LEAD_STATUS_COLORS, LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "../../lib/lead-labels";
import type { Lead } from "../../types";

const PIPELINE_COLUMNS = [
  { id: "received", label: "Recus" },
  { id: "qualified", label: "Qualifies" },
  { id: "in_progress", label: "En cours" },
  { id: "converted", label: "Convertis" },
  { id: "rejected", label: "Refuses" },
  { id: "paid", label: "Payes" },
] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function formatBudget(min?: number, max?: number) {
  if (!min && !max) return null;
  if (min && max) return `${min.toLocaleString("fr-FR")} – ${max.toLocaleString("fr-FR")} €`;
  if (min) return `≥ ${min.toLocaleString("fr-FR")} €`;
  return `≤ ${max!.toLocaleString("fr-FR")} €`;
}

function LeadCard({
  lead,
  actionId,
  onQualify,
  onReject,
  onConvert,
}: {
  lead: Lead;
  actionId: number | null;
  onQualify: (id: number) => void;
  onReject: (id: number) => void;
  onConvert: (id: number) => void;
}) {
  const budget = formatBudget(lead.budget_min, lead.budget_max);
  const isBusy = actionId === lead.id;

  return (
    <Card hover className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-sand/70 px-2.5 py-0.5 text-xs font-medium text-petrol">
          {LEAD_TYPE_LABELS[lead.lead_type] || lead.lead_type}
        </span>
        <span className="text-xs text-ink-muted">{formatDate(lead.created_at)}</span>
      </div>

      <div>
        <h3 className="font-semibold text-petrol">{lead.contact_name}</h3>
        <p className="text-sm text-ink-muted">{lead.contact_phone}</p>
      </div>

      {(lead.property_city || lead.property_address) && (
        <p className="text-sm text-ink-muted">
          {[lead.property_address, lead.property_city].filter(Boolean).join(", ")}
        </p>
      )}

      {budget && <p className="text-sm font-medium text-ink">{budget}</p>}

      <p className="text-xs text-ink-muted">
        Apporteur : <span className="font-medium text-ink">{lead.merchant.name}</span>
      </p>

      {lead.status_events && lead.status_events.length > 0 && (
        <details className="text-xs text-ink-muted">
          <summary className="cursor-pointer font-medium text-brass">Historique</summary>
          <ul className="mt-2 space-y-1 border-t border-sand-dark/40 pt-2">
            {lead.status_events.slice(0, 5).map((event) => (
              <li key={event.id}>
                {LEAD_STATUS_LABELS[event.from_status || ""] || event.from_status || "—"}
                {" → "}
                {LEAD_STATUS_LABELS[event.to_status] || event.to_status}
                {event.user_name && ` · ${event.user_name}`}
              </li>
            ))}
          </ul>
        </details>
      )}

      {lead.status === "received" && (
        <div className="flex flex-wrap gap-2 border-t border-sand-dark/40 pt-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onQualify(lead.id)}
            className={buttonClass("primary", "px-2.5 py-1 text-xs")}
          >
            Qualifier
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onReject(lead.id)}
            className="rounded-lg border border-alert/30 px-2.5 py-1 text-xs text-alert disabled:opacity-50"
          >
            Refuser
          </button>
        </div>
      )}

      {(lead.status === "qualified" || lead.status === "in_progress") && (
        <div className="border-t border-sand-dark/40 pt-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onConvert(lead.id)}
            className="rounded-lg bg-success px-2.5 py-1 text-xs text-white disabled:opacity-50"
          >
            Convertir
          </button>
        </div>
      )}
    </Card>
  );
}

export function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchAdminLeads();
      setLeads(data);
    } catch {
      setError("Impossible de charger les leads");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const leadsByStatus = useMemo(() => {
    const grouped: Record<string, Lead[]> = {};
    for (const col of PIPELINE_COLUMNS) grouped[col.id] = [];
    for (const lead of leads) {
      if (grouped[lead.status]) grouped[lead.status].push(lead);
    }
    return grouped;
  }, [leads]);

  async function handleQualify(id: number) {
    setActionId(id);
    try {
      await qualifyLead(id);
      await loadLeads();
    } catch {
      setError("Action impossible");
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: number) {
    const reason = window.prompt("Motif du refus (optionnel) :");
    if (reason === null) return;

    setActionId(id);
    try {
      await rejectLead(id, reason);
      await loadLeads();
    } catch {
      setError("Action impossible");
    } finally {
      setActionId(null);
    }
  }

  async function handleConvert(id: number) {
    const amountStr = window.prompt("Montant indicatif de la commission (EUR, optionnel) :");
    if (amountStr === null) return;
    if (!window.confirm("Marquer ce lead comme converti (vente conclue) ?")) return;

    let amount_cents: number | undefined;
    if (amountStr.trim()) {
      const parsed = parseFloat(amountStr.replace(",", "."));
      if (Number.isNaN(parsed) || parsed < 0) {
        setError("Montant invalide");
        return;
      }
      amount_cents = Math.round(parsed * 100);
    }

    setActionId(id);
    try {
      await convertLead(id, amount_cents);
      await loadLeads();
    } catch {
      setError("Action impossible");
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="space-y-6">
      <AdminPageHeader
        eyebrow="Pipeline"
        title="Recommandations immobilieres"
        description="Suivez et faites avancer les contacts transmis par les commercants."
        backLabel="Vue d'ensemble"
      />

      {error && <AdminAlert>{error}</AdminAlert>}
      {isLoading && <AdminLoading />}

      {!isLoading && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map((column) => {
            const columnLeads = leadsByStatus[column.id] || [];
            return (
              <AdminPipelineColumn
                key={column.id}
                title={column.label}
                count={columnLeads.length}
                countClassName={LEAD_STATUS_COLORS[column.id] || "bg-sand text-petrol"}
              >
                {columnLeads.length === 0 && (
                  <AdminEmptyStateInline>Aucun lead</AdminEmptyStateInline>
                )}
                {columnLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    actionId={actionId}
                    onQualify={handleQualify}
                    onReject={handleReject}
                    onConvert={handleConvert}
                  />
                ))}
              </AdminPipelineColumn>
            );
          })}
        </div>
      )}
    </section>
  );
}

function AdminEmptyStateInline({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-sand-dark/60 bg-surface/50 p-4 text-center text-xs text-ink-muted">
      {children}
    </p>
  );
}
