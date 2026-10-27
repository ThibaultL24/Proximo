// src/lib/place-paths.ts
/** Préfixe path API pour les communes du 07700 (Ardèche). */
export const ARDECHE_PATH_PREFIX = "auvergne-rhone-alpes/ardeche";

export function communePlacePath(communeSlug: string) {
  return `${ARDECHE_PATH_PREFIX}/${communeSlug}`;
}

export function filHref(opts?: { category?: string; commune?: string }) {
  const params = new URLSearchParams();
  if (opts?.category && opts.category !== "all") params.set("category", opts.category);
  if (opts?.commune) params.set("commune", opts.commune);
  const qs = params.toString();
  return qs ? `/fil?${qs}` : "/fil";
}
