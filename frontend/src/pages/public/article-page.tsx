// src/pages/public/article-page.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ARTICLE_CATEGORY_LABELS, IMMO_CATEGORIES } from "../../lib/article-labels";
import { fetchArticle } from "../../api/public";
import { ArticleBody } from "../../lib/article-body";
import { ReviewSection } from "../../components/public/review-section";
import { useAuth } from "../../hooks/use-auth";
import { territoryBadge } from "../../lib/gazette-labels";
import type { Article } from "../../types";

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchArticle(slug).then(setArticle).catch(console.error);
  }, [slug]);

  if (!article) return <p className="text-ink-muted">Chargement…</p>;

  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const isImmo = IMMO_CATEGORIES.includes(article.category as (typeof IMMO_CATEGORIES)[number]);
  const backHref = isImmo ? "/immo" : "/fil";
  const backLabel = isImmo ? "Retour à l'actu immo" : "Retour au fil";
  const placeLabel = article.place?.name || territoryBadge(article.place, article.territory_label);
  const categoryLabel =
    (article.category && ARTICLE_CATEGORY_LABELS[article.category]) || "Actu";

  return (
    <article className="mx-auto max-w-3xl pb-16">
      <Link to={backHref} className="text-sm font-semibold text-tile hover:underline">
        &larr; {backLabel}
      </Link>

      <header className="mt-6 border-b border-line pb-8">
        {article.cover_image_url && (
          <img
            src={article.cover_image_url}
            alt=""
            className="mb-6 aspect-[16/10] w-full object-cover"
          />
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
          <span className="text-tile">{categoryLabel}</span>
          {placeLabel && <span className="text-ink-muted">{placeLabel}</span>}
        </div>
        <h1 className="mt-3 font-serif text-3xl font-semibold leading-[1.15] tracking-tight text-ink sm:text-4xl">
          {article.title}
        </h1>
        {date && (
          <p className="mt-4 text-sm text-ink-muted">
            Publié le <time dateTime={article.published_at}>{date}</time>
          </p>
        )}
        {article.excerpt && (
          <p className="mt-6 border-l-2 border-tile pl-4 text-lg leading-relaxed text-ink-muted sm:text-xl">
            {article.excerpt}
          </p>
        )}
      </header>

      {article.body && <ArticleBody body={article.body} />}

      <ReviewSection
        reviewableType="Article"
        reviewableSlug={article.slug}
        canReply={Boolean(user?.role === "admin")}
      />

      <footer className="mt-12 flex flex-wrap gap-4 border-t border-line pt-6 text-sm">
        <Link to={backHref} className="font-semibold text-tile hover:underline">
          {backLabel}
        </Link>
        <Link to="/" className="font-semibold text-ink-muted hover:text-ink">
          Accueil
        </Link>
        {article.merchant?.slug && (
          <Link
            to={`/commercants/${article.merchant.slug}`}
            className="font-semibold text-ink-muted hover:text-ink"
          >
            Voir le partenaire
          </Link>
        )}
      </footer>
    </article>
  );
}
