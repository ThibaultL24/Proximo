// src/pages/public/gazette-page.tsx
import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ArticleCard } from "../../components/public/article-card";
import { PlaceBreadcrumb } from "../../components/public/place-breadcrumb";
import { PlaceGrid } from "../../components/public/place-grid";
import { PageHeader } from "../../components/public/page-header";
import { syncTerritoryFromPlace, useTerritory } from "../../context/territory-context";
import { usePlacePath } from "../../hooks/use-place-path";
import { fetchArticles, fetchPlaces, lookupPlace } from "../../api/public";
import { gazetteHref, gazetteTitle } from "../../lib/gazette-labels";
import { PLACE_KIND_PLURAL } from "../../lib/place-labels";
import type { Article, Place } from "../../types";

export function GazettePage() {
  const [searchParams] = useSearchParams();
  const legacyPlacePath = searchParams.get("lieu") || "";
  const { path: placePath } = usePlacePath();
  const { setTerritory } = useTerritory();
  const [articles, setArticles] = useState<Article[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<Place[]>([]);
  const [placeName, setPlaceName] = useState("");
  const [regions, setRegions] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (placePath) return;
    fetchPlaces().then(setRegions).catch(() => {});
  }, [placePath]);

  useEffect(() => {
    setIsLoading(true);

    fetchArticles(placePath || undefined, "gazette")
      .then(setArticles)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [placePath]);

  useEffect(() => {
    if (!placePath) {
      setBreadcrumb([]);
      setPlaceName("");
      return;
    }

    lookupPlace(placePath)
      .then((data) => {
        setBreadcrumb(data.breadcrumb);
        setPlaceName(data.place.name);
        syncTerritoryFromPlace(data.place, placePath, data.breadcrumb, setTerritory);
      })
      .catch(() => {
        setBreadcrumb([]);
        setPlaceName("");
      });
  }, [placePath, setTerritory]);

  if (legacyPlacePath && !placePath) {
    return <Navigate to={gazetteHref(legacyPlacePath)} replace />;
  }

  const title = placeName ? gazetteTitle(placeName) : "Gazettes locales";

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow={placeName ? "Gazette territoriale" : "Editorial"}
        title={title}
        description={
          placeName
            ? `Actualites, portraits de commercants et vie locale pour ${placeName} et ses sous-zones.`
            : "Chaque region, departement et commune peut publier sa propre gazette. Parcourez les territoires ou choisissez le votre."
        }
      />

      {breadcrumb.length > 0 && <PlaceBreadcrumb breadcrumb={breadcrumb} />}

      {!placePath && regions.length > 0 && (
        <PlaceGrid places={regions} basePath="" title={PLACE_KIND_PLURAL.region} />
      )}

      {!placePath && (
        <div className="rounded-2xl border border-petrol/15 bg-paper/40 px-6 py-5">
          <p className="text-sm leading-relaxed text-ink-muted">
            Les articles ci-dessous proviennent de gazettes locales sur tout le territoire.
            Selectionnez une region pour lire la gazette de votre territoire.
          </p>
          <Link to="/gazette/immo" className="mt-3 inline-block text-sm font-medium text-brass hover:text-petrol">
            Voir les articles immobilier agence →
          </Link>
        </div>
      )}

      {isLoading && <p className="text-sm text-ink-muted">Chargement...</p>}

      {!isLoading && articles.length === 0 && (
        <p className="rounded-2xl border border-dashed border-sand-dark bg-surface/50 px-6 py-10 text-center text-ink-muted">
          {placeName
            ? `Aucun article publie pour la gazette de ${placeName} pour le moment.`
            : "Aucun article publie pour le moment."}
        </p>
      )}

      {!isLoading && articles.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          {articles.map((article, index) => (
            <ArticleCard key={article.id} article={article} featured={index === 0} showTerritory={!placePath} />
          ))}
        </div>
      )}

      {placePath && (
        <div className="flex flex-wrap gap-3">
          <Link to={`/annuaire/${placePath}`} className="text-sm font-medium text-brass hover:text-petrol">
            Voir les commercants du territoire →
          </Link>
          <Link to="/gazette" className="text-sm font-medium text-ink-muted hover:text-petrol">
            Toutes les gazettes locales
          </Link>
        </div>
      )}
    </section>
  );
}
