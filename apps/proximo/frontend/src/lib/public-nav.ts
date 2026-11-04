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
      "Consultez le fil, les commerces et les communes du 07700. Un projet immobilier se confie à un commerçant partenaire, en magasin.",
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
    price: "Gratuit",
    period: "",
    description:
      "Gratuit pour tout habitant du 07700 : fil, commerces et avis, sans abonnement. Un projet immo se confie au commerçant, en magasin — pas sur le site.",
    trial: "0 € — toujours, pour le citoyen",
    features: [
      "Compte habitant gratuit",
      "Fil d'actualites",
      "Annuaire commerces",
      "Avis sur les fiches",
      "Projet immo via le commercant",
    ],
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

export const HOW_IT_WORKS = {
  eyebrow: "Le concept",
  title: "Comment ça marche",
  lead: "Fenêtre Ouverte est un média de territoire : une adresse unique pour l’information locale, les commerces du 07700 et l’immobilier du Sud Ardèche.",
  paragraphs: [
    "Habitants, commerçants partenaires et agence y partagent un même fil éditorial. On y lit ce qui se passe dans les communes, on y tient sa vitrine. Un projet immobilier se confie au commerçant, qui le transmet à l’agence — chacun à sa place, sans bruit inutile.",
    "La fiche du commerçant s’ouvre en ligne et, en magasin, par un QR code. L’habitant peut y laisser un avis ; le partenaire y répond. Articles de l’agence et publications des commerces s’y croisent, classés par commune et par rubrique.",
    "Une publication peut également être relayée sur Facebook, Instagram et TikTok. Un seul geste, plusieurs canaux — pour rester visible sans multiplier les outils.",
  ],
} as const;
