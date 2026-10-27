// src/lib/merchant-labels.ts
export const MERCHANT_STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  published: "Publie",
  archived: "Archive",
};

export const MERCHANT_STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  published: "bg-green-100 text-green-800",
  archived: "bg-amber-100 text-amber-800",
};
