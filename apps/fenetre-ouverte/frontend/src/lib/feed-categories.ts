// src/lib/feed-categories.ts
export type FeedCategory = "vie_locale" | "commerces" | "loisirs" | "immo" | "bien_etre";

export interface FeedCategoryMeta {
  id: FeedCategory;
  label: string;
  shortLabel: string;
  description: string;
  href: string;
}

export const RUBRIQUES: FeedCategoryMeta[] = [
  {
    id: "vie_locale",
    label: "Vie locale",
    shortLabel: "Vie locale",
    description: "Associations, événements et initiatives citoyennes.",
    href: "/fil?category=vie_locale",
  },
  {
    id: "commerces",
    label: "Commerces",
    shortLabel: "Commerces",
    description: "Restaurants, artisans, producteurs et boutiques.",
    href: "/commerces",
  },
  {
    id: "loisirs",
    label: "Loisirs et activités",
    shortLabel: "Loisirs",
    description: "Tourisme, guides, sorties et découvertes.",
    href: "/loisirs",
  },
  {
    id: "immo",
    label: "Actu immo",
    shortLabel: "Immo",
    description: "Conseils, ventes, locations et projets immobiliers.",
    href: "/immo",
  },
  {
    id: "bien_etre",
    label: "Bien-être",
    shortLabel: "Bien-être",
    description: "Spas, soins, massages et pratiques de bien-être.",
    href: "/bien-etre",
  },
];

export const FEED_CATEGORIES: { id: FeedCategory | "all"; label: string }[] = [
  { id: "all", label: "Tout" },
  ...RUBRIQUES.map((r) => ({ id: r.id, label: r.shortLabel })),
];

export const FEED_CATEGORY_LABELS: Record<FeedCategory, string> = {
  vie_locale: "Vie locale",
  commerces: "Commerces",
  loisirs: "Loisirs et activités",
  immo: "Actu immo",
  bien_etre: "Bien-être",
};

/** Réseaux commerçant V1 — Facebook, Instagram, TikTok */
export const SOCIAL_PROVIDERS = [
  { id: "facebook", label: "Facebook", field: "facebook_page_url", placeholder: "https://facebook.com/votre-page" },
  { id: "instagram", label: "Instagram", field: "instagram_handle", placeholder: "@votre_compte" },
  { id: "tiktok", label: "TikTok", field: "tiktok_handle", placeholder: "@votre_compte" },
] as const;

export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number]["id"];

export const SOCIAL_POST_STATUS_LABELS: Record<string, string> = {
  pending: "En cours",
  published: "Publié",
  failed: "Échec",
  skipped: "Ignoré",
};
