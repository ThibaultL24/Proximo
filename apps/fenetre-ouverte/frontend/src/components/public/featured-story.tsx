// src/components/public/featured-story.tsx
import { Link } from "react-router-dom";
import { FEED_CATEGORY_LABELS } from "../../lib/feed-categories";
import type { FeedArticleItem } from "../../types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface FeaturedStoryProps {
  article: FeedArticleItem;
  variant?: "lead" | "secondary";
}

export function FeaturedStory({ article, variant = "lead" }: FeaturedStoryProps) {
  const href = `/gazette/${article.slug}`;

  if (variant === "secondary") {
    return (
      <article className="group border-t border-line pt-4 first:border-0 first:pt-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tile">
          {FEED_CATEGORY_LABELS[article.category]}
        </p>
        <Link to={href}>
          <h3 className="mt-1.5 break-words font-serif text-lg font-semibold leading-snug text-ink group-hover:text-tile">
            {article.title}
          </h3>
        </Link>
        {article.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-muted">{article.excerpt}</p>
        )}
        <time className="mt-2 block text-xs text-ink-muted" dateTime={article.published_at}>
          {formatDate(article.published_at)}
        </time>
      </article>
    );
  }

  return (
    <article className="group">
      <div className="mb-3 flex items-center gap-3">
        <span className="bg-tile px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
          La une
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {FEED_CATEGORY_LABELS[article.category]}
        </p>
      </div>
      <Link to={href}>
        <h2 className="break-words font-serif text-3xl font-semibold leading-[1.12] text-ink group-hover:text-tile sm:text-4xl">
          {article.title}
        </h2>
      </Link>
      {article.excerpt && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
          {article.excerpt}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
        <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
        {article.place?.name && (
          <>
            <span className="text-line-strong" aria-hidden>
              ·
            </span>
            <span>{article.place.name}</span>
          </>
        )}
        <Link to={href} className="font-semibold text-tile hover:underline">
          Lire l&apos;article
        </Link>
      </div>
    </article>
  );
}
