// src/pages/admin/admin-commissions-page.tsx
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createCommissionCheckout } from "../../api/admin-commission-payments";
import {
  exportAdminCommissions,
  fetchAdminCommissions,
  updateAdminCommission,
} from "../../api/admin-commissions";
import {
  AdminAlert,
  AdminEmptyState,
  AdminFilters,
  AdminLoading,
  AdminPageHeader,
  AdminSelect,
  AdminTable,
  AdminTableActions,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "../../components/admin/admin-ui";
import { linkButtonClass } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  COMMISSION_STATUS_COLORS,
  COMMISSION_STATUS_LABELS,
  formatEuros,
} from "../../lib/commission-labels";
import { LEAD_TYPE_LABELS } from "../../lib/lead-labels";
import type { Commission } from "../../types";

const STATUS_FILTERS = [
  { value: "", label: "Tous" },
  { value: "eligible", label: "Eligibles" },
  { value: "approved", label: "Approuvees" },
  { value: "paid", label: "Payees" },
  { value: "cancelled", label: "Annulees" },
];

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminCommissionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const loadCommissions = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchAdminCommissions(statusFilter || undefined);
      setCommissions(data);
    } catch {
      setError("Impossible de charger les commissions");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadCommissions();
  }, [loadCommissions]);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (!payment) return;

    if (payment === "success") {
      setSuccess("Paiement Stripe confirme. La commission sera marquee payee apres verification.");
      loadCommissions();
    } else if (payment === "cancelled") {
      setError("Paiement Stripe annule.");
    }

    const next = new URLSearchParams(searchParams);
    next.delete("payment");
    next.delete("commission_id");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, loadCommissions]);

  async function handleApprove(commission: Commission) {
    const amountStr = window.prompt(
      "Montant de la commission (EUR) :",
      commission.amount_cents > 0 ? String(commission.amount_cents / 100) : ""
    );
    if (amountStr === null) return;

    const parsed = parseFloat(amountStr.replace(",", "."));
    if (Number.isNaN(parsed) || parsed <= 0) {
      setError("Montant invalide");
      return;
    }

    setActionId(commission.id);
    try {
      await updateAdminCommission(commission.id, {
        status: "approved",
        amount_cents: Math.round(parsed * 100),
      });
      await loadCommissions();
    } catch {
      setError("Action impossible");
    } finally {
      setActionId(null);
    }
  }

  async function handlePayViaStripe(commission: Commission) {
    setActionId(commission.id);
    setError("");
    try {
      const url = await createCommissionCheckout(commission.id);
      window.location.href = url;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(message || "Impossible d'ouvrir le paiement Stripe");
      setActionId(null);
    }
  }

  async function handleMarkPaid(id: number) {
    if (!window.confirm("Marquer cette commission comme payee ?")) return;

    setActionId(id);
    try {
      await updateAdminCommission(id, { status: "paid" });
      await loadCommissions();
    } catch {
      setError("Action impossible");
    } finally {
      setActionId(null);
    }
  }

  async function handleCancel(id: number) {
    if (!window.confirm("Annuler cette commission ?")) return;

    setActionId(id);
    try {
      await updateAdminCommission(id, { status: "cancelled" });
      await loadCommissions();
    } catch {
      setError("Action impossible");
    } finally {
      setActionId(null);
    }
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      await exportAdminCommissions(statusFilter || undefined);
    } catch {
      setError("Export impossible");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="space-y-6">
      <AdminPageHeader
        eyebrow="Finance"
        title="Commissions commercants"
        description="Commissions creees a la conversion d'un lead. Paiement Stripe ou manuel."
        backLabel="Vue d'ensemble"
      />

      <AdminFilters>
        <AdminSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUS_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>{filter.label}</option>
          ))}
        </AdminSelect>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className={linkButtonClass("outline")}
        >
          {isExporting ? "Export..." : "Exporter CSV"}
        </button>
      </AdminFilters>

      {error && <AdminAlert>{error}</AdminAlert>}
      {success && (
        <Card className="border-success/30 bg-success/5 p-4 text-sm text-success">{success}</Card>
      )}
      {isLoading && <AdminLoading />}

      {!isLoading && commissions.length === 0 && (
        <AdminEmptyState>
          Aucune commission pour ce filtre. Les commissions sont creees lors de la conversion d&apos;un lead.
        </AdminEmptyState>
      )}

      {!isLoading && commissions.length > 0 && (
        <AdminTable>
          <AdminTableHead>
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Commercant</th>
              <th className="px-4 py-3 font-medium">Contact / projet</th>
              <th className="px-4 py-3 font-medium">Montant</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </AdminTableHead>
          <tbody>
            {commissions.map((commission) => (
              <AdminTableRow key={commission.id}>
                <AdminTableCell className="text-ink-muted">{formatDate(commission.created_at)}</AdminTableCell>
                <AdminTableCell className="font-medium text-petrol">{commission.merchant.name}</AdminTableCell>
                <AdminTableCell>
                  <p>{commission.lead.contact_name}</p>
                  <p className="text-xs text-ink-muted">
                    {LEAD_TYPE_LABELS[commission.lead.lead_type] || commission.lead.lead_type}
                  </p>
                </AdminTableCell>
                <AdminTableCell className="font-medium tabular-nums text-petrol">
                  {formatEuros(commission.amount_cents)}
                </AdminTableCell>
                <AdminTableCell>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COMMISSION_STATUS_COLORS[commission.status] || ""}`}>
                    {COMMISSION_STATUS_LABELS[commission.status] || commission.status}
                  </span>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminTableActions>
                    {commission.status === "eligible" && (
                      <button
                        type="button"
                        disabled={actionId === commission.id}
                        onClick={() => handleApprove(commission)}
                        className={linkButtonClass("primary", "px-2.5 py-1 text-xs")}
                      >
                        Approuver
                      </button>
                    )}
                    {commission.status === "approved" && (
                      <>
                        <button
                          type="button"
                          disabled={actionId === commission.id || !commission.merchant.stripe_ready}
                          onClick={() => handlePayViaStripe(commission)}
                          className={linkButtonClass("primary", "px-2.5 py-1 text-xs disabled:opacity-50")}
                          title={
                            commission.merchant.stripe_ready
                              ? undefined
                              : "Le commercant doit configurer Stripe"
                          }
                        >
                          {actionId === commission.id ? "Redirection..." : "Payer via Stripe"}
                        </button>
                        {!commission.merchant.stripe_ready && (
                          <span className="text-xs text-ink-muted">Stripe non configure</span>
                        )}
                        <button
                          type="button"
                          disabled={actionId === commission.id}
                          onClick={() => handleMarkPaid(commission.id)}
                          className="rounded-lg bg-success px-2.5 py-1 text-xs text-white disabled:opacity-50"
                        >
                          Marquer payee
                        </button>
                      </>
                    )}
                    {(commission.status === "eligible" || commission.status === "approved") && (
                      <button
                        type="button"
                        disabled={actionId === commission.id}
                        onClick={() => handleCancel(commission.id)}
                        className="rounded-lg border border-alert/30 px-2.5 py-1 text-xs text-alert disabled:opacity-50"
                      >
                        Annuler
                      </button>
                    )}
                  </AdminTableActions>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </tbody>
        </AdminTable>
      )}
    </section>
  );
}
