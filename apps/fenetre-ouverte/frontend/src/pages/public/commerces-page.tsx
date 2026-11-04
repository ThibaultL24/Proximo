// src/pages/public/commerces-page.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchMerchants } from "../../api/public";
import { FilterChips } from "../../components/public/filter-chips";
import { MerchantCard } from "../../components/public/merchant-card";
import { PublicPageHero } from "../../components/public/public-page-hero";
import { BRAND } from "../../lib/brand";
import { FEED_CATEGORIES, type FeedCategory } from "../../lib/feed-categories";
import { PAGE_HEROES, TERRITORY_COMMUNES } from "../../lib/territory";
import type { Merchant } from "../../types";

const COMMUNE_OPTIONS = [
  { id: "all", label: "Toutes les communes" },
  ...TERRITORY_COMMUNES.map((c) => ({ id: c.slug, label: c.name })),
];

const CATEGORY_OPTIONS = [
  { id: "all", label: "Toutes catégories" },
  ...FEED_CATEGORIES.filter((c) => c.id !== "all").map((c) => ({
    id: c.id,
    label: c.label,
  })),
];

function merchantCommuneKey(merchant: Merchant) {
  const placeSlug = merchant.place?.slug;
  if (placeSlug && TERRITORY_COMMUNES.some((c) => c.slug === placeSlug)) return placeSlug;
  const city = (merchant.city || "").toLowerCase();
  const match = TERRITORY_COMMUNES.find(
    (c) => c.name.toLowerCase() === city || city.includes(c.name.toLowerCase().split("-")[0] || "")
  );
  return match?.slug || "autre";
}

function communeLabel(slug: string) {
  if (slug === "autre") return "Autres";
  return TERRITORY_COMMUNES.find((c) => c.slug === slug)?.name || slug;
}

export function CommercesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const commune = searchParams.get("commune") || "all";
  const category = (searchParams.get("category") || "all") as FeedCategory | "all";
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetchMerchants(
      category !== "all" ? { partner_category: category } : undefined
    )
      .then((data) => {
        if (!cancelled) setMerchants(data);
      })
      .catch(() => {
        if (!cancelled) setMerchants([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category]);

  const filtered = useMemo(() => {
    if (commune === "all") return merchants;
    return merchants.filter((m) => merchantCommuneKey(m) === commune);
  }, [commune, merchants]);

  const grouped = useMemo(() => {
    const map = new Map<string, Merchant[]>();
    for (const merchant of filtered) {
      const key = merchantCommuneKey(merchant);
      const list = map.get(key) || [];
      list.push(merchant);
      map.set(key, list);
    }
    const order = TERRITORY_COMMUNES.map((c) => c.slug);
    return [...map.entries()].sort(([a], [b]) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [filtered]);

  function patchParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === "all") next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="space-y-8 pb-10">
      <PublicPageHero
        image={PAGE_HEROES.commerces}
        kicker={BRAND.territoryLabel}
        title="Commerces & partenaires"
      >
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
          Toutes les adresses du 07700, regroupées par commune. Cliquez une fiche pour découvrir le
          commerce.
        </p>
      </PublicPageHero>

      <aside className="space-y-5 rounded-lg border border-line bg-surface p-4 sm:p-5">
        <FilterChips
          label="Commune"
          options={COMMUNE_OPTIONS}
          activeId={commune}
          onChange={(id) => patchParams({ commune: id })}
        />
        <FilterChips
          label="Catégorie"
          options={CATEGORY_OPTIONS}
          activeId={category}
          onChange={(id) => patchParams({ category: id })}
        />
      </aside>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-paper-dark/70" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
          <p className="font-medium text-ink">Aucun commerce pour ces filtres</p>
          <Link
            to="/commerces"
            className="mt-4 inline-block text-sm font-semibold text-tile hover:underline"
          >
            Voir tous les commerces
          </Link>
        </div>
      )}

      {!isLoading &&
        grouped.map(([slug, list]) => (
          <section key={slug} aria-labelledby={`commune-${slug}`} className="space-y-4">
            <div className="flex items-end justify-between gap-4 border-b border-line pb-2">
              <h2 id={`commune-${slug}`} className="font-serif text-2xl font-semibold text-ink">
                {communeLabel(slug)}
              </h2>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-ink-muted">
                  {list.length} adresse{list.length > 1 ? "s" : ""}
                </span>
                {slug !== "autre" && (
                  <Link
                    to={`/communes/${slug}`}
                    className="font-semibold text-tile hover:underline"
                  >
                    Voir la commune
                  </Link>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((merchant) => (
                <MerchantCard key={merchant.id} merchant={merchant} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
