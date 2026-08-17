// src/pages/public/boutique-page.tsx
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createProductCheckout, fetchProducts } from "../../api/products";
import { ProductCard } from "../../components/public/product-card";
import { linkButtonClass } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { TERRITORY_HERO } from "../../lib/territory";
import type { Product } from "../../types";

export function BoutiquePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutSlug, setCheckoutSlug] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      setProducts(await fetchProducts());
    } catch {
      setError("Impossible de charger la boutique");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (!payment) return;

    if (payment === "success") {
      setSuccess("Paiement Stripe confirme. Merci pour votre achat demo !");
    } else if (payment === "cancelled") {
      setError("Paiement annule.");
    }

    const next = new URLSearchParams(searchParams);
    next.delete("payment");
    next.delete("order_id");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  async function handleCheckout(slug: string) {
    setCheckoutSlug(slug);
    setError("");
    try {
      const url = await createProductCheckout(slug);
      window.location.href = url;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(message || "Impossible d'ouvrir le paiement Stripe");
      setCheckoutSlug(null);
    }
  }

  return (
    <div className="space-y-10 pb-16">
      <section className="relative overflow-hidden">
        <div className="relative aspect-[21/9] min-h-[180px] max-h-[280px] w-full">
          <img
            src={TERRITORY_HERO.image_url}
            alt={TERRITORY_HERO.image_alt}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-1 pb-6 sm:px-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Boutique</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold text-white sm:text-4xl">
              Produits & services du 07700
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">
              Ventes ponctuelles demo : paiement unique, code promo et paiement en plusieurs fois. Les abonnements
              plateforme (citoyen, commercant, agence) sont sur{" "}
              <Link to="/tarifs" className="font-semibold text-white underline">
                la page Tarifs
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <Card tone="panel" className="p-4 text-sm text-ink-muted">
        <p className="font-semibold text-ink">Cas Stripe illustres</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Produit agence → charge plateforme (guide, audit)</li>
          <li>Produit commercant → destination Connect + 10 % plateforme</li>
          <li>Code promo active sur le coffret fouace</li>
          <li>Paiement en plusieurs fois via methodes Dashboard (audit immo)</li>
          <li>
            Abonnements 2 € / 12 € / 125 € →{" "}
            <Link to="/tarifs" className="font-semibold text-tile hover:underline">
              page Tarifs
            </Link>
            , pas la boutique
          </li>
        </ul>
      </Card>

      {error && (
        <Card className="border-alert/30 bg-alert/5 p-4 text-sm text-alert">{error}</Card>
      )}
      {success && (
        <Card className="border-success/30 bg-success/5 p-4 text-sm text-success">{success}</Card>
      )}

      {isLoading && <p className="text-ink-muted">Chargement...</p>}

      {!isLoading && products.length === 0 && (
        <p className="text-ink-muted">Aucun produit pour le moment.</p>
      )}

      {!isLoading && products.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onCheckout={handleCheckout}
              isLoading={checkoutSlug === product.slug}
            />
          ))}
        </div>
      )}

      <section className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
        <p className="text-sm text-ink-muted">
          Les produits commercants necessitent un Stripe Connect configure en demo.
        </p>
        <Link to="/commerces" className={linkButtonClass("outline")}>
          Voir les commerces
        </Link>
      </section>
    </div>
  );
}
