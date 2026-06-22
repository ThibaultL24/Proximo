// src/pages/public/immo-articles-page.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArticleCard } from "../../components/public/article-card";
import { PageHeader } from "../../components/public/page-header";
import { fetchArticles } from "../../api/public";
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

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Proxi Immo"
        title="Articles immobilier"
        description="Conseils techniques, reglementation et actualites agence — contenus edites par le detenteur de la plateforme."
      />

      <Link to="/gazette" className="text-sm font-medium text-brass hover:text-petrol">
        &larr; Retour aux gazettes locales
      </Link>

      {isLoading && <p className="text-sm text-ink-muted">Chargement...</p>}

      {!isLoading && articles.length === 0 && (
        <p className="rounded-2xl border border-dashed border-sand-dark bg-surface/50 px-6 py-10 text-center text-ink-muted">
          Aucun article immobilier publie pour le moment.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {articles.map((article, index) => (
          <ArticleCard key={article.id} article={article} featured={index === 0} />
        ))}
      </div>
    </section>
  );
}
