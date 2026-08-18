// src/pages/public/boutique-page.tsx
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createProductCheckout, fetchProducts } from "../../api/products";
import { ProductCard } from "../../components/public/product-card";
import { linkButtonClass } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { PublicPageHero } from "../../components/public/public-page-hero";
import { PAGE_HEROES } from "../../lib/territory";
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
      <PublicPageHero image={PAGE_HEROES.boutique} kicker="Boutique" title="Produits & services du 07700">
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
          Ventes ponctuelles demo : paiement unique, code promo et paiement en plusieurs fois. Les
          abonnements plateforme (citoyen, commercant, agence) sont sur{" "}
          <Link to="/tarifs" className="font-semibold text-white underline">
            la page Tarifs
          </Link>
          .
        </p>
      </PublicPageHero>

      <Card tone="panel" className="p-4 text-sm text-ink-muted">
        <p className="font-semibold text-ink">Cas Stripe illustres</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Produit agence → charge plateforme (guide, audit, don)</li>
          <li>Produit commercant → destination Connect + 10 % plateforme</li>
          <li>Code promo FOUACE10 (−10 %) sur le coffret fouace</li>
          <li>Paiement en plusieurs fois via methodes Dashboard (audit immo)</li>
          <li>Montant libre (don) via prix Stripe custom_unit_amount</li>
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
