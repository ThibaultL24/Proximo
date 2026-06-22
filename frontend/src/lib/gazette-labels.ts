// src/lib/gazette-labels.ts
import type { Place } from "../types";

export function gazetteHref(path?: string) {
  return path ? `/gazette/territoire/${path}` : "/gazette";
}

export function gazetteTitle(placeName?: string) {
  if (!placeName) return "Gazettes locales";
  return `Gazette · ${placeName}`;
}

export function territoryBadge(place?: Pick<Place, "name" | "kind"> | null, territoryLabel?: string) {
  if (territoryLabel) return territoryLabel;
  if (!place) return "France";
  return place.name;
}
