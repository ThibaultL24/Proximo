// src/pages/public/commune-detail-page.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { fetchFeed } from "../../api/feed";
import { fetchMerchants } from "../../api/public";
import { FeedCard } from "../../components/public/feed-card";
import { FilterChips } from "../../components/public/filter-chips";
import { MerchantCard } from "../../components/public/merchant-card";
import { BRAND } from "../../lib/brand";
import { FEED_CATEGORIES, type FeedCategory } from "../../lib/feed-categories";
import { communePlacePath, filHref } from "../../lib/place-paths";
import { TERRITORY_COMMUNES } from "../../lib/territory";
import type { FeedItem, Merchant } from "../../types";

const VIEW_OPTIONS = [
  { id: "tout", label: "Tout" },
  { id: "commerces", label: "Commerces" },
  { id: "actus", label: "Actus" },
] as const;

type ViewId = (typeof VIEW_OPTIONS)[number]["id"];

export function CommuneDetailPage() {
  const { slug = "" } = useParams();
  const commune = TERRITORY_COMMUNES.find((c) => c.slug === slug);
  const [view, setView] = useState<ViewId>("tout");
  const [category, setCategory] = useState<FeedCategory | "all">("all");
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const placePath = commune ? communePlacePath(commune.slug) : "";

  useEffect(() => {
    if (!commune) return;
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      fetchMerchants({ place_path: placePath }),
      fetchFeed({
        place_path: placePath,
        category: category !== "all" ? category : undefined,
        limit: 40,
      }),
    ])
      .then(([merchantsData, feedData]) => {
        if (cancelled) return;
        setMerchants(merchantsData);
        setFeed(feedData);
      })
      .catch(() => {
        if (cancelled) return;
        setMerchants([]);
        setFeed([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [commune, placePath, category]);

  const categoryMerchants = useMemo(() => {
    if (category === "all") return merchants;
    return merchants.filter((m) => m.partner_category === category);
  }, [category, merchants]);

  if (!commune) return <Navigate to="/communes" replace />;

  const showCommerces = view === "tout" || view === "commerces";
  const showActus = view === "tout" || view === "actus";

  return (
    <div className="space-y-8 pb-10">
      <header className="overflow-hidden border border-line bg-surface">
        {commune.image_url && (
          <div className="relative aspect-[21/9] max-h-64 w-full overflow-hidden bg-paper-dark sm:max-h-72">
            <img
              src={commune.image_url}
              alt={commune.image_alt}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/55 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/80">
                {commune.postal_code} · {BRAND.territoryLabel}
              </p>
              <h1 className="mt-1 font-serif text-3xl font-semibold text-white sm:text-4xl">
                {commune.name}
              </h1>
            </div>
          </div>
        )}
        <div className="space-y-3 p-5 sm:p-6">
          {!commune.image_url && (
            <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">{commune.name}</h1>
          )}
          <p className="max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
            {commune.blurb}
          </p>
          <Link
            to={filHref({ commune: commune.slug })}
            className="inline-block text-sm font-semibold text-tile hover:underline"
          >
            Fil filtré sur {commune.name} →
          </Link>
        </div>
      </header>

      <aside className="space-y-5 rounded-lg border border-line bg-surface p-4 sm:p-5">
        <FilterChips
          label="Afficher"
          options={[...VIEW_OPTIONS]}
          activeId={view}
          onChange={(id) => setView(id as ViewId)}
        />
        <FilterChips
          label="Rubrique"
          options={FEED_CATEGORIES}
          activeId={category}
          onChange={(id) => setCategory(id as FeedCategory | "all")}
        />
      </aside>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-paper-dark/70" />
          ))}
        </div>
      )}

      {!isLoading && showCommerces && (
        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            Commerces {category !== "all" ? `· ${FEED_CATEGORIES.find((c) => c.id === category)?.label}` : ""}
          </h2>
          {categoryMerchants.length === 0 ? (
            <p className="text-sm text-ink-muted">Aucun commerce listé pour l’instant.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryMerchants.map((m) => (
                <MerchantCard key={m.id} merchant={m} />
              ))}
            </div>
          )}
        </section>
      )}

      {!isLoading && showActus && (
        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-ink">Actualités</h2>
          {feed.length === 0 ? (
            <p className="text-sm text-ink-muted">Pas encore d’actualité pour cette commune.</p>
          ) : (
            <div className="mx-auto max-w-2xl">
              {feed.map((item) => (
                <FeedCard key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          )}
        </section>
      )}

      <p className="text-sm">
        <Link to="/communes" className="font-semibold text-ink-muted hover:text-ink">
          ← Toutes les communes
        </Link>
      </p>
    </div>
  );
}
