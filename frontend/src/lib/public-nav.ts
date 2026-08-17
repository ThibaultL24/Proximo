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
    id: "boutique",
    label: "Boutique",
    href: "/boutique",
    match: (p) => p === "/boutique" || p.startsWith("/boutique/"),
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

export const PRICING_TIERS = [
  {
    id: "citoyen",
    title: "Citoyen",
    price: "2 €",
    period: "/ mois",
    description: "Pour les habitants du 07700 qui veulent suivre l'actu locale et transmettre un projet immo.",
    trial: "Essai gratuit 7 jours",
    features: ["Fil d'actualites", "Annuaire commerces", "Transmission de leads immo", "Avis sur les fiches"],
    cta: { label: "Creer un compte", href: "/inscription" },
    accent: "outline" as const,
  },
  {
    id: "commercant",
    title: "Commercant partenaire",
    price: "12 €",
    period: "/ mois",
    description: "Visibilite locale, QR code, publications multi-reseaux et apport d'affaires.",
    trial: "Essai gratuit 7 jours",
    features: [
      "Fiche vitrine photo",
      "QR code + compteur scans",
      "Publication fil + Facebook, Instagram, TikTok",
      "Gestion des leads et commissions",
      "Reponse aux avis clients",
    ],
    cta: { label: "Espace partenaire", href: "/connexion" },
    accent: "accent" as const,
    featured: true,
  },
  {
    id: "agence",
    title: "Agence immobiliere",
    price: "125 €",
    period: "/ mois",
    description: "Licence reseau pour piloter commercants, editorial, leads et commissions.",
    trial: "Demo sur demande",
    features: [
      "Back-office complet",
      "Articles gazette et immo",
      "Pipeline leads et commissions Stripe",
      "Analytics QR et conversion",
      "Moderation des avis",
    ],
    cta: { label: "Inscription agence", href: "/agence/inscription" },
    accent: "outline" as const,
  },
] as const;

export const HOW_IT_WORKS = [
  { step: "1", title: "Scan QR", text: "Le client scanne le QR code en vitrine ou sur un flyer." },
  { step: "2", title: "Fiche commercant", text: "Il decouvre la fiche photo, les horaires et les contacts." },
  { step: "3", title: "Fil local", text: "Il lit les posts et articles du territoire 07700." },
  { step: "4", title: "Avis", text: "Il laisse un avis ; le commercant ou l'agence repond." },
  { step: "5", title: "1 clic reseaux", text: "Le commercant publie sur Facebook, Instagram et TikTok en un envoi." },
] as const;
