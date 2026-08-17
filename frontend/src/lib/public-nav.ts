// src/lib/public-nav.ts
import type { FeedCategory } from "./feed-categories";

export interface PublicNavItem {
  id: string;
  label: string;
  href: string;
  match: (pathname: string) => boolean;
  /** Si défini, la page est une rubrique de fil */
  category?: FeedCategory;
}

/** Navbar publique : Fil · Commerces · Communes · Loisirs · Bien-être · Immo */
export const PUBLIC_NAV: PublicNavItem[] = [
  {
    id: "fil",
    label: "Fil",
    href: "/fil",
    match: (p) => p === "/fil" || p.startsWith("/fil/"),
  },
  {
    id: "commerces",
    label: "Commerces",
    href: "/commerces",
    match: (p) => p === "/commerces" || p.startsWith("/commerces/"),
  },
  {
    id: "communes",
    label: "Communes",
    href: "/communes",
    match: (p) => p === "/communes" || p.startsWith("/communes/"),
  },
  {
    id: "loisirs",
    label: "Loisirs",
    href: "/loisirs",
    category: "loisirs",
    match: (p) => p === "/loisirs",
  },
  {
    id: "bien_etre",
    label: "Bien-être",
    href: "/bien-etre",
    category: "bien_etre",
    match: (p) => p === "/bien-etre",
  },
  {
    id: "immo",
    label: "Immo",
    href: "/immo",
    category: "immo",
    match: (p) => p === "/immo",
  },
];

export const OFFER_TIERS = [
  {
    id: "habitant",
    title: "Habitant",
    description:
      "Consultez le fil, les commerces et les communes du 07700. Transmettez un projet immobilier quand vous êtes prêt.",
    cta: { label: "Créer un compte", href: "/inscription" },
  },
  {
    id: "partenaire",
    title: "Partenaire commerçant",
    description:
      "Fiche vitrine, publications dans le fil, QR code et visibilité dans votre commune. Abonnement pour publier et gérer vos leads.",
    cta: { label: "Espace partenaire", href: "/connexion" },
  },
  {
    id: "decouvrir",
    title: "Découvrir librement",
    description:
      "Parcourez le fil d’actus, les bonnes adresses et l’immobilier local sans compte — la lecture reste ouverte.",
    cta: { label: "Voir le fil", href: "/fil" },
  },
] as const;
