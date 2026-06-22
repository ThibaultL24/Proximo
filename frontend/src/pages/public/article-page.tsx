// src/pages/public/article-page.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ARTICLE_CATEGORY_LABELS, IMMO_CATEGORIES } from "../../lib/article-labels";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { fetchArticle } from "../../api/public";
import { ArticleBody } from "../../lib/article-body";
import { territoryBadge } from "../../lib/gazette-labels";
import type { Article } from "../../types";

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchArticle(slug).then(setArticle).catch(console.error);
  }, [slug]);

  if (!article) return <p className="text-ink-muted">Chargement...</p>;

  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const isImmo = IMMO_CATEGORIES.includes(article.category as typeof IMMO_CATEGORIES[number]);

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        to={isImmo ? "/gazette/immo" : "/gazette"}
        className="text-sm font-medium text-brass hover:text-petrol"
      >
        &larr; {isImmo ? "Retour aux articles immo" : "Retour a la gazette"}
      </Link>

      <Card className="mt-4 p-6 sm:p-10">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="category" className="mb-0">
            {(article.category && ARTICLE_CATEGORY_LABELS[article.category]) || "Gazette"}
          </Badge>
          {(article.gazette_label || article.territory_label || article.place) && (
            <Badge variant="partner">
              {article.gazette_label || territoryBadge(article.place, article.territory_label)}
            </Badge>
          )}
        </div>
        <h1 className="font-serif text-3xl font-semibold leading-tight text-petrol sm:text-4xl">
          {article.title}
        </h1>
        {date && <p className="mt-3 text-sm text-ink-muted">Publié le {date}</p>}
        {article.excerpt && (
          <p className="mt-6 border-l-2 border-brass pl-4 font-serif text-xl italic text-ink-muted">
            {article.excerpt}
          </p>
        )}
        {article.body && <ArticleBody body={article.body} />}
      </Card>
    </article>
  );
}
