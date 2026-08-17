// src/pages/public/fil-page.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchFeed } from "../../api/feed";
import { FeedCard } from "../../components/public/feed-card";
import { linkButtonClass } from "../../components/ui/button";
import { BRAND } from "../../lib/brand";
import { FEED_CATEGORIES, FEED_CATEGORY_LABELS, type FeedCategory } from "../../lib/feed-categories";
import { groupFeedByPeriod } from "../../lib/feed-groups";
import { communePlacePath, filHref } from "../../lib/place-paths";
import { TERRITORY_COMMUNES } from "../../lib/territory";
import type { FeedArticleItem, FeedItem } from "../../types";

type KindFilter = "all" | "article" | "publication";

const KIND_OPTIONS: { id: KindFilter; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "article", label: "Articles" },
  { id: "publication", label: "Posts" },
];

const PAGE_SIZE = 8;

export function FilPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = (searchParams.get("category") || "all") as FeedCategory | "all";
  const commune = searchParams.get("commune") || "all";
  const kind = (searchParams.get("kind") || "all") as KindFilter;

  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const placePath = commune !== "all" ? communePlacePath(commune) : undefined;
  const apiCategory = category !== "all" ? category : undefined;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setVisibleCount(PAGE_SIZE);

    fetchFeed({ category: apiCategory, place_path: placePath, limit: 80 })
      .then((data) => {
        if (!cancelled) setFeed(data);
      })
      .catch(() => {
        if (!cancelled) setFeed([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiCategory, placePath]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [kind, category, commune]);

  const items = useMemo(() => {
    if (kind === "all") return feed;
    return feed.filter((item) => item.type === kind);
  }, [feed, kind]);

  const lead = useMemo(() => {
    if (kind === "publication") return null;
    return items.find((item): item is FeedArticleItem => item.type === "article") || null;
  }, [items, kind]);

  const listItems = useMemo(() => {
    if (!lead) return items;
    return items.filter((item) => !(item.type === "article" && item.id === lead.id));
  }, [items, lead]);

  const visibleItems = listItems.slice(0, visibleCount);
  const groups = useMemo(() => groupFeedByPeriod(visibleItems), [visibleItems]);
  const hasMore = visibleCount < listItems.length;

  const communeName = TERRITORY_COMMUNES.find((c) => c.slug === commune)?.name;
  const isFiltered = category !== "all" || commune !== "all" || kind !== "all";

  function patchParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === "all") next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  }

  const titleParts = [
    category !== "all" ? FEED_CATEGORY_LABELS[category] : null,
    communeName,
  ].filter(Boolean);

  return (
    <div className="space-y-8 pb-10">
      <header className="space-y-2 border-b border-line pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          {BRAND.territoryLabel}
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {titleParts.length ? `Fil · ${titleParts.join(" · ")}` : "Fil d'actualités"}
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-ink-muted">
          Une lecture claire : une à la une, puis le fil par période.
        </p>
      </header>

      <div className="sticky top-[3.25rem] z-20 -mx-4 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur-sm sm:top-[4.5rem]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div
            role="tablist"
            aria-label="Type de contenu"
            className="no-scrollbar flex gap-0 overflow-x-auto border-b border-transparent sm:border-0"
          >
            {KIND_OPTIONS.map((opt) => {
              const active = kind === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => patchParams({ kind: opt.id })}
                  className={[
                    "shrink-0 border-b-2 px-3 py-2 text-sm font-semibold transition",
                    active ? "border-tile text-ink" : "border-transparent text-ink-muted hover:text-ink",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="fil-category">
              Rubrique
            </label>
            <select
              id="fil-category"
              value={category}
              onChange={(e) => patchParams({ category: e.target.value })}
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-ink"
            >
              {FEED_CATEGORIES.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.id === "all" ? "Toutes rubriques" : opt.label}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="fil-commune">
              Commune
            </label>
            <select
              id="fil-commune"
              value={commune}
              onChange={(e) => patchParams({ commune: e.target.value })}
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-ink"
            >
              <option value="all">Tout le 07700</option>
              {TERRITORY_COMMUNES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {isFiltered && (
              <Link to={filHref()} className="text-sm font-semibold text-tile hover:underline">
                Réinitialiser
              </Link>
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-6">
          <div className="h-48 animate-pulse bg-paper-dark/70" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse bg-paper-dark/50" />
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
          <p className="font-medium text-ink">Rien pour ces filtres</p>
          <p className="mt-1 text-sm text-ink-muted">Élargissez la rubrique ou la commune.</p>
          <Link to={filHref()} className={`${linkButtonClass("outline")} mt-5`}>
            Voir tout le fil
          </Link>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="space-y-10">
          {lead && (
            <section aria-labelledby="une-fil">
              <h2 id="une-fil" className="sr-only">
                À la une
              </h2>
              <FeedCard item={lead} featured />
            </section>
          )}

          <section aria-live="polite" className="space-y-8">
            <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
              <h2 className="font-serif text-xl font-semibold text-ink">
                {lead ? "La suite du fil" : "Le fil"}
              </h2>
              <p className="text-sm text-ink-muted">
                {listItems.length} actualité{listItems.length > 1 ? "s" : ""}
              </p>
            </div>

            {groups.map((group) => (
              <div key={group.key}>
                <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  {group.label}
                </h3>
                <div className="border-t border-line">
                  {group.items.map((item) => (
                    <FeedCard key={`${item.type}-${item.id}`} item={item} />
                  ))}
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className={linkButtonClass("outline")}
                >
                  Voir la suite ({listItems.length - visibleCount} restantes)
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
