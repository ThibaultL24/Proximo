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

    if (featured) {
      return (
        <article className="border border-line bg-surface p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
            <span className="text-tile">À la une</span>
            <span className="text-ink-muted">{FEED_CATEGORY_LABELS[item.category]}</span>
            <time className="text-ink-muted" dateTime={item.published_at}>
              {formatRelative(item.published_at)}
            </time>
          </div>
          <Link to={href} className="group mt-3 block">
            <h2 className="font-serif text-2xl font-semibold leading-snug text-ink group-hover:text-tile sm:text-3xl">
              {item.title}
            </h2>
            {item.excerpt && (
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-muted">{item.excerpt}</p>
            )}
          </Link>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
            <p className="text-sm text-ink-muted">
              {item.merchant ? (
                <Link
                  to={`/commercants/${item.merchant.slug}`}
                  className="font-semibold text-ink hover:text-tile"
                >
                  {item.merchant.name}
                </Link>
              ) : (
                <span className="font-semibold text-ink">Fenêtre Ouverte</span>
              )}
              {item.place?.name ? <span> · {item.place.name}</span> : null}
            </p>
            <Link to={href} className="text-sm font-semibold text-tile hover:underline">
              Lire l&apos;article →
            </Link>
          </div>
        </article>
      );
    }

    return (
      <article className="border-b border-line py-6 last:border-0">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tile">
            Article · {FEED_CATEGORY_LABELS[item.category]}
          </p>
          <time className="shrink-0 text-xs text-ink-muted" dateTime={item.published_at}>
            {formatRelative(item.published_at)}
          </time>
        </div>
        <Link to={href} className="group mt-2 block">
          <h3 className="font-serif text-xl font-semibold leading-snug text-ink group-hover:text-tile">
            {item.title}
          </h3>
          {item.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">{item.excerpt}</p>
          )}
        </Link>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-ink-muted">
            {item.merchant ? (
              <Link
                to={`/commercants/${item.merchant.slug}`}
                className="font-semibold text-ink hover:text-tile"
              >
                {item.merchant.name}
              </Link>
            ) : (
              <span className="font-semibold text-ink">Fenêtre Ouverte</span>
            )}
            {item.place?.name ? <span> · {item.place.name}</span> : null}
          </p>
          <ShareButton title={item.title} url={href} />
        </div>
      </article>
    );
  }

  const { merchant } = item;
  const href = `/commercants/${merchant.slug}`;

  return (
    <article className="border-b border-line py-6 last:border-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Post · {FEED_CATEGORY_LABELS[item.category]}
        </p>
        <time className="shrink-0 text-xs text-ink-muted" dateTime={item.published_at}>
          {formatRelative(item.published_at)}
        </time>
      </div>

      <header className="mt-3 flex items-center gap-3">
        {merchant.logo_url ? (
          <img
            src={merchant.logo_url}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-dark font-serif text-sm font-semibold text-ink"
            aria-hidden
          >
            {merchant.name.slice(0, 1)}
          </div>
        )}
        <Link to={href} className="truncate text-sm font-semibold text-ink hover:text-tile">
          {merchant.name}
        </Link>
      </header>

      {item.image_url && (
        <img
          src={item.image_url}
          alt=""
          className="mt-4 aspect-[16/10] w-full object-cover"
          loading="lazy"
        />
      )}

      <p className="mt-3 line-clamp-5 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
        {item.body}
      </p>

      <footer className="mt-3 flex items-center justify-between">
        <Link to={href} className="text-xs font-semibold text-tile hover:underline">
          Voir le partenaire →
        </Link>
        <ShareButton title={merchant.name} url={href} />
      </footer>
    </article>
  );
}
