// src/pages/public/rubrique-page.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchFeed } from "../../api/feed";
import { fetchMerchants } from "../../api/public";
import { FeedCard } from "../../components/public/feed-card";
import { FilterChips } from "../../components/public/filter-chips";
import { MerchantCard } from "../../components/public/merchant-card";
import { BRAND } from "../../lib/brand";
import { FEED_CATEGORY_LABELS, RUBRIQUES, type FeedCategory } from "../../lib/feed-categories";
import { communePlacePath, filHref } from "../../lib/place-paths";
import { TERRITORY_COMMUNES } from "../../lib/territory";
import type { FeedItem, Merchant } from "../../types";

const COMMUNE_OPTIONS = [
  { id: "all", label: "Tout le 07700" },
  ...TERRITORY_COMMUNES.map((c) => ({ id: c.slug, label: c.name })),
];

interface RubriquePageProps {
  category: FeedCategory;
}

export function RubriquePage({ category }: RubriquePageProps) {
  const meta = RUBRIQUES.find((r) => r.id === category)!;
  const [searchParams, setSearchParams] = useSearchParams();
  const commune = searchParams.get("commune") || "all";
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const placePath = commune !== "all" ? communePlacePath(commune) : undefined;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      fetchFeed({ category, place_path: placePath, limit: 60 }),
      fetchMerchants({
        partner_category: category,
        ...(placePath ? { place_path: placePath } : {}),
      }),
    ])
      .then(([feedData, merchantsData]) => {
        if (cancelled) return;
        setFeed(feedData);
        setMerchants(merchantsData);
      })
      .catch(() => {
        if (cancelled) return;
        setFeed([]);
        setMerchants([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, placePath]);

  const communeName = useMemo(
    () => TERRITORY_COMMUNES.find((c) => c.slug === commune)?.name,
    [commune]
  );

  return (
    <div className="space-y-8 pb-10">
      <header className="space-y-3 border-b border-line pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Rubrique · {BRAND.territoryLabel}
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {meta.label}
          {communeName ? ` · ${communeName}` : ""}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
          {meta.description} Sur toutes les communes du 07700 — affinez par ville si besoin.
        </p>
        <Link
          to={filHref({ category })}
          className="inline-block text-sm font-semibold text-tile hover:underline"
        >
          Ouvrir dans le fil →
        </Link>
      </header>

      <aside className="rounded-lg border border-line bg-surface p-4 sm:p-5">
        <FilterChips
          label="Commune"
          options={COMMUNE_OPTIONS}
          activeId={commune}
          onChange={(id) => {
            const next = new URLSearchParams(searchParams);
            if (id === "all") next.delete("commune");
            else next.set("commune", id);
            setSearchParams(next, { replace: true });
          }}
        />
      </aside>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-paper-dark/70" />
          ))}
        </div>
      )}

      {!isLoading && (
        <>
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Actualités · {FEED_CATEGORY_LABELS[category]}
            </h2>
            {feed.length === 0 ? (
              <p className="text-sm text-ink-muted">Pas encore de contenu dans cette rubrique.</p>
            ) : (
              <div className="mx-auto max-w-2xl">
                {feed.map((item) => (
                  <FeedCard key={`${item.type}-${item.id}`} item={item} />
                ))}
              </div>
            )}
          </section>

          {merchants.length > 0 && (
            <section className="space-y-4 border-t border-line pt-8">
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-serif text-2xl font-semibold text-ink">Adresses</h2>
                <Link
                  to={`/commerces?category=${category}${commune !== "all" ? `&commune=${commune}` : ""}`}
                  className="text-sm font-semibold text-tile hover:underline"
                >
                  Tous les commerces
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {merchants.slice(0, 9).map((m) => (
                  <MerchantCard key={m.id} merchant={m} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
