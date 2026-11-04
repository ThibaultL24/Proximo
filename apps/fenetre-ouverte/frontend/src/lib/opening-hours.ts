// src/lib/opening-hours.ts
const DAY_LABELS: Record<string, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
  samedi: "Samedi",
  dimanche: "Dimanche",
};

const DAY_ORDER = Object.keys(DAY_LABELS);

export function formatOpeningHours(openingHours: Record<string, string>) {
  return DAY_ORDER.filter((day) => openingHours[day]).map((day) => ({
    day,
    label: DAY_LABELS[day],
    hours: openingHours[day],
  }));
}
