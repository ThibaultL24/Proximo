// src/pages/public/directory-page.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArticleCard } from "../../components/public/article-card";
import { MerchantCard } from "../../components/public/merchant-card";
import { PlaceBreadcrumb } from "../../components/public/place-breadcrumb";
import { PlaceGrid } from "../../components/public/place-grid";
import { RegionalMerchantsSection } from "../../components/public/regional-merchants-section";
import { PageHeader } from "../../components/public/page-header";
import { syncTerritoryFromPlace, useTerritory } from "../../context/territory-context";
import { usePlacePath } from "../../hooks/use-place-path";
import { fetchArticles, fetchMerchants, fetchPlaces, lookupPlace } from "../../api/public";
import { gazetteHref, gazetteTitle } from "../../lib/gazette-labels";
import { PLACE_KIND_PLURAL, placeExploreLabel } from "../../lib/place-labels";
import type { Article, Merchant, Place, PlaceLookup } from "../../types";

export function DirectoryPage() {
  const { path: placePath } = usePlacePath();
  const { territory, setTerritory } = useTerritory();
  const [lookup, setLookup] = useState<PlaceLookup | null>(null);
  const [rootPlaces, setRootPlaces] = useState<Place[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const useRegionalPriority = !placePath && Boolean(territory?.regionPath);

  useEffect(() => {
    if (placePath) return;

    fetchPlaces()
      .then(setRootPlaces)
      .catch(() => setError("Impossible de charger les regions"));
  }, [placePath]);

  useEffect(() => {
    setIsLoading(true);
    setError("");

    if (!placePath) {
      if (useRegionalPriority) {
        fetchArticles()
          .then((articlesData) => {
            setLookup(null);
            setMerchants([]);
            setArticles(articlesData);
          })
          .catch(() => setError("Impossible de charger le contenu"))
          .finally(() => setIsLoading(false));
        return;
      }

      Promise.all([fetchMerchants(), fetchArticles()])
        .then(([merchantsData, articlesData]) => {
          setLookup(null);
          setMerchants(merchantsData);
          setArticles(articlesData);
        })
        .catch(() => setError("Impossible de charger le contenu"))
        .finally(() => setIsLoading(false));
      return;
    }

    Promise.all([
      lookupPlace(placePath),
      fetchMerchants({ place_path: placePath }),
      fetchArticles(placePath, "gazette"),
    ])
      .then(([lookupData, merchantsData, articlesData]) => {
        setLookup(lookupData);
        setMerchants(merchantsData);
        setArticles(articlesData);
        syncTerritoryFromPlace(lookupData.place, placePath, lookupData.breadcrumb, setTerritory);
      })
      .catch(() => setError("Territoire introuvable"))
      .finally(() => setIsLoading(false));
  }, [placePath, setTerritory, useRegionalPriority]);

  const currentPlace = lookup?.place;
  const childKind = lookup?.children[0]?.kind;
  const childTitle = childKind ? placeExploreLabel(childKind) : "Sous-zones";
  const localGazetteTitle = currentPlace ? gazetteTitle(currentPlace.name) : "Gazette locale";

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Explorer la France"
        title={currentPlace?.name || "Commercants partenaires"}
        description={
          currentPlace
            ? `Commercants et ${localGazetteTitle.toLowerCase()} pour ${currentPlace.name} et ses sous-zones.`
            : territory?.regionName
              ? `Commercants prioritaires en ${territory.regionName}, puis le reste de la France si vous le souhaitez.`
              : "Choisissez une region pour decouvrir les commercants et la gazette de votre territoire."
        }
      />

      {lookup?.breadcrumb && <PlaceBreadcrumb breadcrumb={lookup.breadcrumb} />}

      {!placePath && rootPlaces.length > 0 && (
        <PlaceGrid places={rootPlaces} basePath="" title={PLACE_KIND_PLURAL.region} />
      )}

      {lookup && lookup.children.length > 0 && (
        <PlaceGrid places={lookup.children} basePath={placePath} title={childTitle} />
      )}

      {error && <p className="text-alert">{error}</p>}
      {isLoading && !useRegionalPriority && <p className="text-sm text-ink-muted">Chargement...</p>}

      {!error && useRegionalPriority && (
        <RegionalMerchantsSection showAnnuaireLink={false} />
      )}

      {!isLoading && !error && !useRegionalPriority && (
        <>
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-serif text-xl font-semibold text-petrol">
                Commercants {currentPlace ? `· ${currentPlace.name}` : "· France"}
              </h2>
              <p className="text-sm text-ink-muted">
                {merchants.length} resultat{merchants.length > 1 ? "s" : ""}
              </p>
            </div>

            {merchants.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-sand-dark bg-surface/50 px-6 py-10 text-center text-ink-muted">
                Aucun commercant dans cette zone pour le moment.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {merchants.map((merchant) => (
                  <MerchantCard key={merchant.id} merchant={merchant} />
                ))}
              </div>
            )}
          </section>

          {placePath && (
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brass">Editorial local</p>
                  <h2 className="font-serif text-xl font-semibold text-petrol">{localGazetteTitle}</h2>
                </div>
                <Link to={gazetteHref(placePath)} className="text-sm font-medium text-brass hover:text-petrol">
                  Lire toute la gazette →
                </Link>
              </div>

              {articles.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-sand-dark bg-surface/50 px-6 py-10 text-center text-ink-muted">
                  Aucun article publie pour {currentPlace?.name} pour le moment.
                </p>
              ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                  {articles.slice(0, 4).map((article, index) => (
                    <ArticleCard key={article.id} article={article} featured={index === 0} showTerritory={false} />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </section>
  );
}
