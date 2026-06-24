// src/components/merchant/merchant-stripe-connect-card.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  createMerchantStripeOnboardingLink,
  fetchMerchantStripeDashboardLink,
  fetchMerchantStripeStatus,
} from "../../api/merchant-stripe";
import { AdminHint } from "../admin/admin-ui";
import { linkButtonClass } from "../ui/button";
import { Card } from "../ui/card";
import type { StripeConnectStatus } from "../../types";

export function MerchantStripeConnectCard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<StripeConnectStatus | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadStatus() {
    setIsLoading(true);
    setError("");
    try {
      setStatus(await fetchMerchantStripeStatus());
    } catch {
      setError("Impossible de charger le statut Stripe");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    const stripeParam = searchParams.get("stripe");
    if (!stripeParam) return;

    loadStatus().finally(() => {
      const next = new URLSearchParams(searchParams);
      next.delete("stripe");
      setSearchParams(next, { replace: true });
    });
  }, [searchParams, setSearchParams]);

  async function handleConnect() {
    setIsSubmitting(true);
    setError("");
    try {
      const url = await createMerchantStripeOnboardingLink();
      window.location.href = url;
    } catch {
      setError("Configuration Stripe impossible");
      setIsSubmitting(false);
    }
  }

  async function handleDashboard() {
    setIsSubmitting(true);
    setError("");
    try {
      const url = await fetchMerchantStripeDashboardLink();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Ouverture du tableau de bord Stripe impossible");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-sand-dark/40 bg-paper/40 px-6 py-4">
        <h2 className="font-serif text-lg font-semibold text-petrol">Paiement des commissions</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Connectez votre compte Stripe pour recevoir les commissions sur vos recommandations immobilieres.
        </p>
      </div>

      <div className="space-y-4 p-6">
        {isLoading && <p className="text-sm text-ink-muted">Chargement...</p>}

        {!isLoading && status && (
          <>
            {status.ready_for_payouts ? (
              <div className="rounded-xl border border-success/20 bg-success/5 p-4">
                <p className="text-sm font-medium text-success">Compte Stripe actif</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Vous pouvez recevoir les paiements de commissions de l&apos;agence.
                </p>
              </div>
            ) : status.connected ? (
              <div className="rounded-xl border border-brass/20 bg-brass/5 p-4">
                <p className="text-sm font-medium text-petrol">Configuration en cours</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Terminez l&apos;inscription Stripe pour activer les virements.
                </p>
              </div>
            ) : (
              <AdminHint>
                Sans compte Stripe, l&apos;agence ne pourra pas vous payer automatiquement via la plateforme.
              </AdminHint>
            )}

            <div className="flex flex-wrap gap-3">
              {!status.ready_for_payouts && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConnect}
                  className={linkButtonClass("primary", "text-sm")}
                >
                  {isSubmitting ? "Redirection..." : status.connected ? "Reprendre la configuration" : "Configurer Stripe"}
                </button>
              )}
              {status.ready_for_payouts && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleDashboard}
                  className={linkButtonClass("outline", "text-sm")}
                >
                  Ouvrir Stripe
                </button>
              )}
            </div>
          </>
        )}

        {error && <p className="text-sm text-alert">{error}</p>}
      </div>
    </Card>
  );
}
