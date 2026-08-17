// src/components/public/article-card.tsx
import { Link } from "react-router-dom";
import { ARTICLE_CATEGORY_LABELS } from "../../lib/article-labels";
import { territoryBadge } from "../../lib/gazette-labels";
import type { Article } from "../../types";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  showTerritory?: boolean;
  variant?: "card" | "row";
}

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ArticleCard({
  article,
  featured = false,
  showTerritory = true,
  variant = "row",
}: ArticleCardProps) {
  const date = formatDate(article.published_at);
  const provenance = article.place?.name || territoryBadge(article.place, article.territory_label);
  const categoryLabel =
    (article.category && ARTICLE_CATEGORY_LABELS[article.category]) || "Gazette";

  if (variant === "card" || featured) {
    return (
      <article className={featured ? "group" : "group border border-line bg-surface p-5"}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tile">
          {categoryLabel}
          {showTerritory && provenance ? (
            <span className="text-ink-muted"> · {provenance}</span>
          ) : null}
        </p>
        <Link to={`/gazette/${article.slug}`}>
          <h2
            className={[
              "mt-2 break-words font-serif font-semibold leading-snug text-ink group-hover:text-tile",
              featured ? "text-3xl sm:text-4xl" : "text-xl",
            ].join(" ")}
          >
            {article.title}
          </h2>
        </Link>
        {article.excerpt && (
          <p
            className={[
              "mt-3 leading-relaxed text-ink-muted",
              featured ? "max-w-2xl text-base sm:text-lg" : "line-clamp-3 text-sm",
            ].join(" ")}
          >
            {article.excerpt}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
          {date && <time dateTime={article.published_at}>{date}</time>}
          <Link to={`/gazette/${article.slug}`} className="font-semibold text-tile hover:underline">
            Lire l&apos;article
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group border-b border-line py-5 first:pt-0 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tile">
          {categoryLabel}
        </p>
        {date && (
          <time className="text-xs text-ink-muted" dateTime={article.published_at}>
            {date}
          </time>
        )}
      </div>
      <Link to={`/gazette/${article.slug}`} className="mt-2 block">
        <h2 className="font-serif text-xl font-semibold leading-snug text-ink group-hover:text-tile sm:text-2xl">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-muted">{article.excerpt}</p>
        )}
      </Link>
      {showTerritory && provenance && (
        <p className="mt-3 text-xs text-ink-muted">{provenance}</p>
      )}
    </article>
  );
}
