// src/pages/public/home-page.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArticleCard } from "../../components/public/article-card";
import { MerchantCard } from "../../components/public/merchant-card";
import { PlaceGrid } from "../../components/public/place-grid";
import { RegionalMerchantsSection } from "../../components/public/regional-merchants-section";
import { linkButtonClass } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useTerritory } from "../../context/territory-context";
import { fetchArticles, fetchMerchants, fetchPlaces } from "../../api/public";
import { gazetteTitle } from "../../lib/gazette-labels";
import { PLACE_KIND_PLURAL } from "../../lib/place-labels";
import type { Article, Merchant, Place } from "../../types";

export function HomePage() {
  const navigate = useNavigate();
  const { territory, gazetteHref: territoryGazetteHref } = useTerritory();
  const [featured, setFeatured] = useState<Merchant[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [territoryArticles, setTerritoryArticles] = useState<Article[]>([]);
  const [regions, setRegions] = useState<Place[]>([]);

  useEffect(() => {
    fetchMerchants({ featured: true }).then(setFeatured).catch(() => {});
    fetchArticles().then((data) => setArticles(data.slice(0, 6))).catch(() => {});
    fetchPlaces().then(setRegions).catch(() => {});
  }, []);

  useEffect(() => {
    if (!territory?.path) {
      setTerritoryArticles([]);
      return;
    }

    fetchArticles(territory.path, "gazette")
      .then((data) => setTerritoryArticles(data.slice(0, 3)))
      .catch(() => setTerritoryArticles([]));
  }, [territory?.path]);

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-sand-dark/50 bg-surface px-6 py-12 sm:px-10 sm:py-16">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sand/40 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-petrol/5 blur-2xl" />

        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brass">Gazettes locales</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-petrol sm:text-5xl">
            Une gazette pour chaque territoire
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-muted">
            Region, departement, ville ou quartier : chaque territoire peut publier sa propre gazette
            avec portraits de commercants, actualites locales et conseils immobiliers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/annuaire" className={linkButtonClass("primary")}>
              Choisir mon territoire
            </Link>
            {territoryGazetteHref ? (
              <Link to={territoryGazetteHref} className={linkButtonClass("outline")}>
                {gazetteTitle(territory?.name)}
              </Link>
            ) : (
              <Link to="/gazette" className={linkButtonClass("outline")}>
                Parcourir les gazettes
              </Link>
            )}
            <Link to="/connexion" className={linkButtonClass("accent")}>
              J&apos;ai un projet immobilier
            </Link>
          </div>
        </div>
      </section>

      {territory && territoryArticles.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brass">Votre territoire</p>
              <h2 className="font-serif text-2xl font-semibold text-petrol">{gazetteTitle(territory.name)}</h2>
            </div>
            <Link to={territoryGazetteHref || "/gazette"} className="text-sm font-medium text-brass hover:text-petrol">
              Toute la gazette →
            </Link>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {territoryArticles.map((article, index) => (
              <ArticleCard key={article.id} article={article} featured={index === 0} showTerritory={false} />
            ))}
          </div>
        </section>
      )}

      {regions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brass">Territoires</p>
              <h2 className="font-serif text-2xl font-semibold text-petrol">Choisir une region</h2>
            </div>
            <Link to="/annuaire" className="text-sm font-medium text-brass hover:text-petrol">
              Toutes les regions →
            </Link>
          </div>
          <PlaceGrid places={regions.slice(0, 6)} basePath="" title={PLACE_KIND_PLURAL.region} />
          {regions.length > 6 && (
            <button
              type="button"
              onClick={() => navigate("/annuaire")}
              className="text-sm font-medium text-brass hover:text-petrol"
            >
              Voir les {regions.length} regions
            </button>
          )}
        </section>
      )}

      {territory?.regionPath ? (
        <RegionalMerchantsSection previewLimit={6} annuaireHref={`/annuaire/${territory.regionPath}`} />
      ) : (
        featured.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brass">Carnet de quartier</p>
                <h2 className="font-serif text-2xl font-semibold text-petrol">Commercants mis en avant</h2>
              </div>
              <Link to="/annuaire" className="text-sm font-medium text-brass hover:text-petrol">
                Tout voir →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((merchant) => (
                <MerchantCard key={merchant.id} merchant={merchant} />
              ))}
            </div>
          </section>
        )
      )}

      {articles.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brass">A la une</p>
              <h2 className="font-serif text-2xl font-semibold text-petrol">Dernieres parutions</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Articles recents avec leur gazette d&apos;origine.
              </p>
            </div>
            <Link to="/gazette" className="text-sm font-medium text-brass hover:text-petrol">
              Toutes les gazettes →
            </Link>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {articles.map((article, index) => (
              <ArticleCard key={article.id} article={article} featured={index === 0} />
            ))}
          </div>
        </section>
      )}

      <section>
        <Card className="border-petrol/15 bg-gradient-to-br from-petrol to-petrol-light p-8 text-surface sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-sand">Reseau local</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">
            Vous avez un projet immobilier ?
          </h2>
          <p className="mt-3 max-w-xl text-sand/90">
            Nos commercants partenaires transmettent les opportunites de proximite.
            L&apos;equipe Proxi Immo qualifie chaque recommandation avec soin.
          </p>
          <Link to="/connexion" className={`${linkButtonClass("accent")} mt-6`}>
            Echanger avec l&apos;agence
          </Link>
        </Card>
      </section>
    </div>
  );
}
