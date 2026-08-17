// src/lib/territory.ts
/**
 * Territoire de lancement 07700.
 * Photos fournies pour l'habillage éditorial (cartes communes + bandeau).
 * Population : ne pas afficher tant que le millésime n'est pas harmonisé.
 */

export interface TerritoryCommune {
  name: string;
  slug: string;
  insee_code: string;
  postal_code: string;
  blurb: string;
  /** null = placeholder jusqu'à photo licenciée */
  image_url: string | null;
  image_alt: string;
  image_credit?: string;
  image_license?: string;
  image_source_url?: string;
}

export const TERRITORY_POSTAL = "07700";

/** Bandeau d'ambiance — Pont d'Arc, Sud Ardèche */
export const TERRITORY_HERO = {
  image_url: "/territory/hero-pont-d-arc.png",
  image_alt: "Le Pont d'Arc sur l'Ardèche",
  image_credit: "Fonds 07700",
} as const;

export const TERRITORY_COMMUNES: TerritoryCommune[] = [
  {
    name: "Bourg-Saint-Andéol",
    slug: "bourg-saint-andeol",
    insee_code: "07042",
    postal_code: "07700",
    blurb: "Ville-centre entre Rhône et garrigue.",
    image_url: "/territory/bourg-saint-andeol-centre.png",
    image_alt: "Vue sur le centre de Bourg-Saint-Andéol et le clocher",
    image_credit: "Fonds 07700",
  },
  {
    name: "Saint-Marcel-d'Ardèche",
    slug: "saint-marcel-d-ardeche",
    insee_code: "07264",
    postal_code: "07700",
    blurb: "Village médiéval et vignoble des Côtes du Rhône.",
    image_url: "/territory/saint-marcel-d-ardeche.png",
    image_alt: "Vue aérienne du village de Saint-Marcel-d'Ardèche",
    image_credit: "Fonds 07700",
  },
  {
    name: "Saint-Just-d'Ardèche",
    slug: "saint-just-d-ardeche",
    insee_code: "07259",
    postal_code: "07700",
    blurb: "À la confluence du Rhône et de l'Ardèche.",
    image_url: "/territory/saint-just-d-ardeche.png",
    image_alt: "Vue sur le village de Saint-Just-d'Ardèche",
    image_credit: "Fonds 07700",
  },
  {
    name: "Saint-Martin-d'Ardèche",
    slug: "saint-martin-d-ardeche",
    insee_code: "07268",
    postal_code: "07700",
    blurb: "Porte des Gorges, plages et descentes en canoë.",
    image_url: "/territory/saint-martin-belvedere.png",
    image_alt: "Belvédère sur l'Ardèche à Saint-Martin-d'Ardèche",
    image_credit: "Fonds 07700",
  },
  {
    name: "Saint-Remèze",
    slug: "saint-remeze",
    insee_code: "07291",
    postal_code: "07700",
    blurb: "Plateau entre Gorges, Dent de Rez et lavandes.",
    image_url: "/territory/saint-remeze.png",
    image_alt: "Le village de Saint-Remèze et son clocher",
    image_credit: "Fonds 07700",
  },
  {
    name: "Gras",
    slug: "gras",
    insee_code: "07099",
    postal_code: "07700",
    blurb: "Bourg médiéval au pied de la Dent de Rez.",
    image_url: "/territory/gras.png",
    image_alt: "Vue sur le village de Gras",
    image_credit: "Fonds 07700",
  },
  {
    name: "Bidon",
    slug: "bidon",
    insee_code: "07034",
    postal_code: "07700",
    blurb: "Petite commune aux dolines et paysages du Laoul.",
    image_url: "/territory/bidon.png",
    image_alt: "Le village de Bidon dans la verdure",
    image_credit: "Fonds 07700",
  },
];
