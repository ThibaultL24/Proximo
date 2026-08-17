// src/pages/public/gazette-page.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ArticleCard } from "../../components/public/article-card";
import { linkButtonClass } from "../../components/ui/button";
import { syncTerritoryFromPlace, useTerritory } from "../../context/territory-context";
import { usePlacePath } from "../../hooks/use-place-path";
import { fetchArticles, lookupPlace } from "../../api/public";
import { BRAND } from "../../lib/brand";
import {
  GAZETTE_COMMUNE_FILTERS,
  gazetteHref,
  gazetteTitle,
} from "../../lib/gazette-labels";
import type { Article } from "../../types";

export function GazettePage() {
  const [searchParams] = useSearchParams();
  const legacyPlacePath = searchParams.get("lieu") || "";
  const { path: placePath } = usePlacePath();
  const { setTerritory } = useTerritory();
  const [articles, setArticles] = useState<Article[]>([]);
  const [placeName, setPlaceName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    fetchArticles(placePath || undefined, "gazette")
      .then(setArticles)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [placePath]);

  useEffect(() => {
    if (!placePath) {
      setPlaceName("");
      return;
    }

    lookupPlace(placePath)
      .then((data) => {
        setPlaceName(data.place.name);
        syncTerritoryFromPlace(data.place, placePath, data.breadcrumb, setTerritory);
      })
      .catch(() => {
        setPlaceName("");
      });
  }, [placePath, setTerritory]);

  const activeCommuneSlug = useMemo(() => {
    if (!placePath) return null;
    const parts = placePath.split("/");
    return parts[parts.length - 1] || null;
  }, [placePath]);

  if (legacyPlacePath && !placePath) {
    return <Navigate to={gazetteHref(legacyPlacePath)} replace />;
  }

  const title = gazetteTitle(placeName || undefined);
  const lead = articles[0];
  const secondary = articles.slice(1, 3);
  const rest = articles.slice(3);

  return (
    <div className="space-y-10 pb-10">
      <header className="space-y-3 border-b border-line pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          {BRAND.territoryLabel}
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
          {placeName
            ? `Actualités, portraits et vie de village à ${placeName}.`
            : "Le journal éditorial de Fenêtre Ouverte : actus, portraits de commerçants et vie du 07700."}
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link to="/?category=vie_locale" className="text-sm font-semibold text-tile hover:underline">
            Fil Vie locale
          </Link>
          <Link to="/gazette/immo" className="text-sm font-semibold text-ink-muted hover:text-ink">
            Actu immo →
          </Link>
        </div>
      </header>

      <nav aria-label="Filtrer par commune" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto pb-1">
        <Link
          to="/gazette"
          aria-current={!activeCommuneSlug ? "page" : undefined}
          className={[
            "shrink-0 border px-3 py-1.5 text-sm font-semibold transition",
            !activeCommuneSlug
              ? "border-ink bg-ink text-white"
              : "border-line bg-surface text-ink-muted hover:border-ink/30 hover:text-ink",
          ].join(" ")}
        >
          Tout le 07700
        </Link>
        {GAZETTE_COMMUNE_FILTERS.map((commune) => {
          const active = activeCommuneSlug === commune.slug;
          return (
            <Link
              key={commune.slug}
              to={commune.href}
              aria-current={active ? "page" : undefined}
              className={[
                "shrink-0 border px-3 py-1.5 text-sm font-semibold transition",
                active
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-surface text-ink-muted hover:border-ink/30 hover:text-ink",
              ].join(" ")}
            >
              {commune.name}
            </Link>
          );
        })}
      </nav>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-paper-dark/70" />
          ))}
        </div>
      )}

      {!isLoading && articles.length === 0 && (
        <div className="border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
          <p className="font-medium text-ink">
            {placeName
              ? `Aucun article pour ${placeName} pour le moment.`
              : "Aucun article publié pour le moment."}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Revenez bientôt, ou parcourez le fil du 07700.
          </p>
          <Link to="/" className={`${linkButtonClass("outline")} mt-5`}>
            Retour à l&apos;accueil
          </Link>
        </div>
      )}

      {!isLoading && articles.length > 0 && (
        <>
          {(lead || secondary.length > 0) && (
            <section aria-labelledby="gazette-une">
              <h2 id="gazette-une" className="sr-only">
                À la une de la gazette
              </h2>
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-10">
                {lead ? (
                  <ArticleCard article={lead} featured showTerritory={!placePath} />
                ) : (
                  <div />
                )}
                <div className="min-w-0 space-y-0 lg:border-l lg:border-line lg:pl-10">
                  {secondary.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="row"
                      showTerritory={!placePath}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section aria-labelledby="gazette-suite" className="border-t border-line pt-8">
              <h2 id="gazette-suite" className="mb-4 font-serif text-2xl font-semibold text-ink">
                Dans la gazette
              </h2>
              <div className="mx-auto max-w-2xl">
                {rest.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="row"
                    showTerritory={!placePath}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <footer className="flex flex-wrap gap-4 border-t border-line pt-6 text-sm">
        <Link to="/annuaire" className="font-semibold text-tile hover:underline">
          Annuaire des partenaires →
        </Link>
        {placePath && (
          <Link to="/gazette" className="font-semibold text-ink-muted hover:text-ink">
            Toute la gazette
          </Link>
        )}
      </footer>
    </div>
  );
}
