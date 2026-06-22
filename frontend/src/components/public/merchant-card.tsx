// src/components/public/merchant-card.tsx
import { Link } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import type { Merchant } from "../../types";

interface MerchantCardProps {
  merchant: Merchant;
}

export function MerchantCard({ merchant }: MerchantCardProps) {
  const coverUrl = merchant.logo_url || merchant.photo_urls?.[0];

  return (
    <Link to={`/commercants/${merchant.slug}`} className="group block">
      <Card hover className="h-full">
        <div className="mb-4 flex h-28 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-sand to-paper-dark">
          {coverUrl ? (
            <img src={coverUrl} alt={merchant.name} className="h-full w-full object-cover" />
          ) : (
            <span className="font-serif text-4xl text-petrol/20">{merchant.name.charAt(0)}</span>
          )}
        </div>
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge variant="partner">Commerce partenaire</Badge>
          {merchant.featured && <Badge variant="featured">Mis en avant</Badge>}
        </div>
        <h2 className="font-serif text-xl font-semibold text-petrol group-hover:text-brass">
          {merchant.name}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          {merchant.place?.name || merchant.sector.name}
          {merchant.city ? ` · ${merchant.city}` : ""}
        </p>
        {merchant.short_description && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink/80">
            {merchant.short_description}
          </p>
        )}
        <p className="mt-4 text-sm font-medium text-brass">Voir la fiche →</p>
      </Card>
    </Link>
  );
}
