// src/components/public/merchant-card.tsx
import { Link } from "react-router-dom";
import { Badge } from "../ui/badge";
import { FEED_CATEGORY_LABELS } from "../../lib/feed-categories";
import type { Merchant } from "../../types";

interface MerchantCardProps {
  merchant: Merchant;
}

export function MerchantCard({ merchant }: MerchantCardProps) {
  const coverUrl = merchant.logo_url || merchant.photo_urls?.[0];
  const categoryLabel = merchant.partner_category
    ? FEED_CATEGORY_LABELS[merchant.partner_category]
    : merchant.sector.name;

  return (
    <Link
      to={`/commercants/${merchant.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-ink/30"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-paper-dark">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-4xl text-ink/15">{merchant.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge variant="category">{categoryLabel}</Badge>
          {merchant.featured && <Badge variant="featured">Sélection</Badge>}
        </div>
        <h2 className="font-serif text-xl font-semibold text-ink group-hover:text-tile">
          {merchant.name}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          {merchant.place?.name || merchant.city || merchant.sector.name}
        </p>
        {merchant.short_description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/80">
            {merchant.short_description}
          </p>
        )}
        <p className="mt-auto pt-4 text-sm font-semibold text-tile">Voir la fiche</p>
      </div>
    </Link>
  );
}
