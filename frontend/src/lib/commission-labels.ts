// src/lib/commission-labels.ts
export const COMMISSION_STATUS_LABELS: Record<string, string> = {
  eligible: "Eligible",
  approved: "Approuvee",
  paid: "Payee",
  cancelled: "Annulee",
};

export const COMMISSION_STATUS_COLORS: Record<string, string> = {
  eligible: "bg-sand text-petrol",
  approved: "bg-petrol/10 text-petrol",
  paid: "bg-success/15 text-success",
  cancelled: "bg-alert/10 text-alert",
};

export function formatEuros(cents: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
