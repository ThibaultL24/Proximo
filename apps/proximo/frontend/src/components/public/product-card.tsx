// src/components/public/product-card.tsx
import { BrandImageFallback } from "../brand/brand-image-fallback";
import { linkButtonClass } from "../ui/button";
import type { Product } from "../../types";

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

interface ProductCardProps {
  product: Product;
  onCheckout: (slug: string) => void;
  isLoading?: boolean;
}

export function ProductCard({ product, onCheckout, isLoading = false }: ProductCardProps) {
  const canCheckout =
    product.seller_type === "agency" ||
    (product.merchant?.stripe_ready ?? false);

  return (
    <article className="flex h-full flex-col overflow-hidden border border-line bg-surface">
      <div className="relative aspect-[16/10] bg-paper-dark">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <BrandImageFallback />
        )}
        <span className="absolute left-3 top-3 bg-surface/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-tile">
          {product.checkout_label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {product.seller_type === "agency" ? "Agence Fenêtre Ouverte" : product.merchant?.name}
        </p>
        <h2 className="mt-1 font-serif text-xl font-semibold text-ink">{product.name}</h2>
        {product.description && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-muted">
            {product.description}
          </p>
        )}

        <div className="mt-4 space-y-2">
          <p className="font-serif text-2xl font-semibold tabular-nums text-ink">
            {product.checkout_mode === "custom"
              ? `À partir de ${formatPrice(product.price_cents, product.currency)}`
              : formatPrice(product.price_cents, product.currency)}
          </p>

          {product.seller_type === "merchant" && (
            <p className="text-xs text-ink-muted">
              Split demo : {formatPrice(product.platform_fee_cents, product.currency)} plateforme ·{" "}
              {formatPrice(product.merchant_amount_cents, product.currency)} commercant
            </p>
          )}

          {!canCheckout && (
            <p className="text-xs text-alert">
              Paiement indisponible : le commercant doit configurer Stripe Connect.
            </p>
          )}

          <button
            type="button"
            disabled={!canCheckout || isLoading}
            onClick={() => onCheckout(product.slug)}
            className={`${linkButtonClass("accent", "w-full text-sm")} disabled:opacity-50`}
          >
            {isLoading ? "Redirection..." : "Acheter via Stripe"}
          </button>
        </div>
      </div>
    </article>
  );
}
