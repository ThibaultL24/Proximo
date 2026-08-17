// src/lib/feed-groups.ts
import type { FeedItem } from "../types";

export interface FeedDayGroup {
  key: string;
  label: string;
  items: FeedItem[];
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function groupLabel(iso: string, now = new Date()) {
  const date = new Date(iso);
  const day = startOfDay(date);
  const today = startOfDay(now);
  const diffDays = Math.round((today - day) / 86_400_000);

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return "Cette semaine";
  if (diffDays < 30) return "Ce mois-ci";
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function groupKey(iso: string, now = new Date()) {
  const label = groupLabel(iso, now);
  if (label === "Aujourd'hui") return "0-today";
  if (label === "Hier") return "1-yesterday";
  if (label === "Cette semaine") return "2-week";
  if (label === "Ce mois-ci") return "3-month";
  const date = new Date(iso);
  return `4-${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
}

/** Regroupe le fil par période pour aérer la lecture. */
export function groupFeedByPeriod(items: FeedItem[]): FeedDayGroup[] {
  const now = new Date();
  const map = new Map<string, FeedDayGroup>();

  for (const item of items) {
    const key = groupKey(item.published_at, now);
    const label = groupLabel(item.published_at, now);
    const group = map.get(key) || { key, label, items: [] };
    group.items.push(item);
    map.set(key, group);
  }

  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}
