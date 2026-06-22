// src/lib/article-labels.ts
export const ARTICLE_CATEGORY_LABELS: Record<string, string> = {
  local_news: "Actu locale",
  merchant_spotlight: "Portrait commercant",
  real_estate: "Immobilier",
  agency_news: "Agence",
};

export const ARTICLE_STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  published: "Publie",
  archived: "Archive",
};

export const ARTICLE_STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  published: "bg-green-100 text-green-800",
  archived: "bg-amber-100 text-amber-800",
};

export const ARTICLE_CATEGORY_COLORS: Record<string, string> = {
  local_news: "bg-petrol/10 text-petrol border-petrol/15",
  merchant_spotlight: "bg-brass/15 text-brass border-brass/25",
  real_estate: "bg-success/10 text-success border-success/15",
  agency_news: "bg-sand text-petrol border-sand-dark/40",
};

export const GAZETTE_CATEGORIES = ["local_news", "merchant_spotlight"] as const;
export const IMMO_CATEGORIES = ["real_estate", "agency_news"] as const;

export const GAZETTE_CATEGORY_OPTIONS = GAZETTE_CATEGORIES.map((value) => ({
  value,
  label: ARTICLE_CATEGORY_LABELS[value],
}));

export const IMMO_CATEGORY_OPTIONS = IMMO_CATEGORIES.map((value) => ({
  value,
  label: ARTICLE_CATEGORY_LABELS[value],
}));
