// src/lib/gazette-labels.ts
import type { Place } from "../types";
import { TERRITORY_COMMUNES } from "./territory";

const ARDECHE_PATH_PREFIX = "auvergne-rhone-alpes/ardeche";

/** @deprecated Prefer /fil and /communes — kept for admin / legacy links */
export function gazetteHref(path?: string) {
  if (!path) return "/fil";
  const slug = path.split("/").pop();
  return slug ? `/communes/${slug}` : "/communes";
}

export function communeGazetteHref(communeSlug: string) {
  return `/communes/${communeSlug}`;
}

export function gazetteTitle(placeName?: string) {
  if (!placeName) return "Fil d'actualités";
  return `Fil · ${placeName}`;
}

export function territoryBadge(place?: Pick<Place, "name" | "kind"> | null, territoryLabel?: string) {
  if (territoryLabel) return territoryLabel;
  if (!place) return "07700";
  return place.name;
}

export const GAZETTE_COMMUNE_FILTERS = TERRITORY_COMMUNES.map((commune) => ({
  name: commune.name,
  slug: commune.slug,
  href: communeGazetteHref(commune.slug),
  placePath: `${ARDECHE_PATH_PREFIX}/${commune.slug}`,
}));
