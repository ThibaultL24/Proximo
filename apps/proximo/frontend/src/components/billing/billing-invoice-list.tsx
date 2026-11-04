// src/components/billing/billing-invoice-list.tsx
import { useEffect, useState } from "react";
import { Card } from "../ui/card";

export interface BillingInvoice {
  id: string;
  number?: string | null;
  status: string;
  amount_due_cents: number;
  amount_paid_cents: number;
  currency: string;
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
  period_end?: string | null;
  created?: string | null;
}

interface BillingInvoiceListProps {
  fetchInvoices: () => Promise<BillingInvoice[]>;
  title?: string;
}

const STATUS_LABELS: Record<string, string> = {
  paid: "Payee",
  open: "Ouverte",
  draft: "Brouillon",
  uncollectible: "Impayee",
  void: "Annulee",
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BillingInvoiceList({ fetchInvoices, title = "Agenda de facturation" }: BillingInvoiceListProps) {
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvoices()
      .then(setInvoices)
      .catch(() => setInvoices([]))
      .finally(() => setIsLoading(false));
  }, [fetchInvoices]);

  if (isLoading) {
    return <p className="text-sm text-ink-muted">Chargement des factures...</p>;
  }

  if (invoices.length === 0) {
    return (
      <Card tone="panel" className="p-4">
        <p className="text-sm font-medium text-petrol">{title}</p>
        <p className="mt-1 text-sm text-ink-muted">
          Aucune facture Stripe pour le moment. Elle apparaitra apres le premier paiement d&apos;abonnement.
        </p>
      </Card>
    );
  }

  return (
    <Card tone="panel" className="overflow-hidden p-0">
      <div className="border-b border-sand-dark/40 bg-paper/40 px-4 py-3">
        <p className="font-serif text-base font-semibold text-petrol">{title}</p>
      </div>
      <ul className="divide-y divide-line">
        {invoices.map((invoice) => (
          <li key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-petrol">{invoice.number || invoice.id}</p>
              <p className="text-xs text-ink-muted">
                {formatDate(invoice.period_end || invoice.created)} ·{" "}
                {STATUS_LABELS[invoice.status] || invoice.status}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold tabular-nums text-petrol">
                {formatMoney(invoice.amount_paid_cents || invoice.amount_due_cents, invoice.currency)}
              </span>
              {invoice.hosted_invoice_url && (
                <a
                  href={invoice.hosted_invoice_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-tile hover:underline"
                >
                  Voir
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
