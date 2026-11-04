// src/components/public/feed-card.tsx
import { Link } from "react-router-dom";
import { FEED_CATEGORY_LABELS } from "../../lib/feed-categories";
import type { FeedItem } from "../../types";

function formatRelative(iso: string) {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

function ShareButton({ title, url }: { title: string; url: string }) {
  async function share() {
    const absolute = `${window.location.origin}${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url: absolute });
        return;
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard?.writeText(absolute);
  }

  return (
    <button
      type="button"
      onClick={share}
      className="text-xs font-semibold text-ink-muted transition hover:text-ink"
    >
      Partager
    </button>
  );
}

interface FeedCardProps {
  item: FeedItem;
  /** Première entrée mise en avant */
  featured?: boolean;
}

export function FeedCard({ item, featured = false }: FeedCardProps) {
  if (item.type === "article") {
    const href = `/gazette/${item.slug}`;
    const byline = item.merchant?.name ?? "Fenêtre Ouverte";

    if (featured) {
      return (
        <article className="overflow-hidden border border-line bg-surface">
          <div className="grid sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-stretch">
            {item.cover_image_url && (
              <Link to={href} className="block bg-paper-dark sm:min-h-full">
                <img
                  src={item.cover_image_url}
                  alt=""
                  className="h-36 w-full object-cover sm:h-full sm:min-h-[9.5rem]"
                  loading="lazy"
                />
              </Link>
            )}
            <div className="flex flex-col p-4">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
                <span className="text-tile">À la une</span>
                <span className="text-ink-muted">{FEED_CATEGORY_LABELS[item.category]}</span>
                <time className="text-ink-muted" dateTime={item.published_at}>
                  {formatRelative(item.published_at)}
                </time>
              </div>
              <Link to={href} className="group mt-1.5 block">
                <h2 className="font-serif text-xl font-semibold leading-snug text-ink group-hover:text-tile">
                  {item.title}
                </h2>
                {item.excerpt && (
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-muted">{item.excerpt}</p>
                )}
              </Link>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="truncate text-xs text-ink-muted">
                  {item.merchant ? (
                    <Link
                      to={`/commercants/${item.merchant.slug}`}
                      className="font-semibold text-ink hover:text-tile"
                    >
                      {byline}
                    </Link>
                  ) : (
                    <span className="font-semibold text-ink">{byline}</span>
                  )}
                  {item.place?.name ? <span> · {item.place.name}</span> : null}
                </p>
                <Link to={href} className="shrink-0 text-xs font-semibold text-tile hover:underline">
                  Lire →
                </Link>
              </div>
            </div>
          </div>
        </article>
      );
    }

    return (
      <article className="border-b border-line py-3.5 last:border-0">
        <div className="flex gap-3">
          {item.cover_image_url && (
            <Link to={href} className="shrink-0">
              <img
                src={item.cover_image_url}
                alt=""
                className="h-16 w-24 object-cover sm:h-[4.5rem] sm:w-28"
                loading="lazy"
              />
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-tile">
                Article · {FEED_CATEGORY_LABELS[item.category]}
              </p>
              <time className="shrink-0 text-xs text-ink-muted" dateTime={item.published_at}>
                {formatRelative(item.published_at)}
              </time>
            </div>
            <Link to={href} className="group mt-1 block">
              <h3 className="font-serif text-base font-semibold leading-snug text-ink group-hover:text-tile sm:text-lg">
                {item.title}
              </h3>
              {item.excerpt && (
                <p className="mt-1 line-clamp-1 text-sm leading-relaxed text-ink-muted">{item.excerpt}</p>
              )}
            </Link>
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <p className="truncate text-xs text-ink-muted">
                {item.merchant ? (
                  <Link
                    to={`/commercants/${item.merchant.slug}`}
                    className="font-semibold text-ink hover:text-tile"
                  >
                    {byline}
                  </Link>
                ) : (
                  <span className="font-semibold text-ink">{byline}</span>
                )}
                {item.place?.name ? <span> · {item.place.name}</span> : null}
              </p>
              <ShareButton title={item.title} url={href} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  const { merchant } = item;
  const href = `/fil/post/${item.id}`;

  return (
    <article className="border-b border-line py-3.5 last:border-0">
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Post · {FEED_CATEGORY_LABELS[item.category]} · {merchant.name}
            </p>
            <time className="shrink-0 text-xs text-ink-muted" dateTime={item.published_at}>
              {formatRelative(item.published_at)}
            </time>
          </div>
          <Link to={href} className="group mt-1 block">
            <p className="line-clamp-2 whitespace-pre-wrap text-sm leading-relaxed text-ink group-hover:text-tile">
              {item.body}
            </p>
          </Link>
          <div className="mt-1.5 flex items-center justify-between">
            <Link to={href} className="text-xs font-semibold text-tile hover:underline">
              Voir le post →
            </Link>
            <ShareButton title={merchant.name} url={href} />
          </div>
        </div>
        {item.image_url && (
          <Link to={href} className="shrink-0">
            <img
              src={item.image_url}
              alt=""
              className="h-16 w-24 object-cover sm:h-[4.5rem] sm:w-28"
              loading="lazy"
            />
          </Link>
        )}
      </div>
    </article>
  );
}
