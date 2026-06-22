// src/lib/place-labels.ts
export const PLACE_KIND_LABELS: Record<string, string> = {
  country: "Pays",
  region: "Region",
  department: "Departement",
  city: "Ville",
  district: "Quartier",
};

export const PLACE_KIND_PLURAL: Record<string, string> = {
  country: "France",
  region: "Regions",
  department: "Departements",
  city: "Villes",
  district: "Quartiers",
};

export function placeExploreLabel(kind: string) {
  return PLACE_KIND_PLURAL[kind] || "Zones";
}
