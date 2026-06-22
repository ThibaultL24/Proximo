// src/lib/lead-labels.ts
export const LEAD_TYPE_LABELS: Record<string, string> = {
  buy: "Achat",
  sell: "Vente",
  rent: "Location",
  other: "Autre",
};

export const LEAD_STATUS_LABELS: Record<string, string> = {
  received: "Recu",
  qualified: "Qualifie",
  in_progress: "En cours",
  converted: "Converti",
  rejected: "Refuse",
  paid: "Paye",
};

export const LEAD_STATUS_COLORS: Record<string, string> = {
  received: "bg-slate-100 text-slate-700",
  qualified: "bg-blue-100 text-blue-800",
  in_progress: "bg-amber-100 text-amber-800",
  converted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  paid: "bg-emerald-100 text-emerald-800",
};
