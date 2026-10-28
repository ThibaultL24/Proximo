// src/pages/public/immo-articles-page.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArticleCard } from "../../components/public/article-card";
import { linkButtonClass } from "../../components/ui/button";
import { fetchArticles } from "../../api/public";
import { BRAND } from "../../lib/brand";
import type { Article } from "../../types";

export function ImmoArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticles(undefined, "immo")
      .then(setArticles)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const lead = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="space-y-10 pb-10">
      <header className="space-y-3 border-b border-line pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Rubrique · {BRAND.territoryLabel}
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Actu immobilier
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
          Conseils, marché et projets immo dans le 07700 — une rubrique parmi d&apos;autres.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link to="/?category=immo" className="text-sm font-semibold text-tile hover:underline">
            Fil Immo
          </Link>
          <Link to="/gazette" className="text-sm font-semibold text-ink-muted hover:text-ink">
            ← La gazette
          </Link>
        </div>
      </header>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-paper-dark/70" />
          ))}
        </div>
      )}

      {!isLoading && articles.length === 0 && (
        <div className="border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
          <p className="font-medium text-ink">Aucun article immobilier publié pour le moment.</p>
          <Link to="/gazette" className={`${linkButtonClass("outline")} mt-5`}>
            Lire la gazette
          </Link>
        </div>
      )}

      {!isLoading && lead && (
        <section>
          <ArticleCard article={lead} featured showTerritory={false} />
        </section>
      )}

      {!isLoading && rest.length > 0 && (
        <section className="border-t border-line pt-8">
          <h2 className="mb-4 font-serif text-2xl font-semibold text-ink">Autres articles</h2>
          <div className="mx-auto max-w-2xl">
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article} variant="row" showTerritory={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
