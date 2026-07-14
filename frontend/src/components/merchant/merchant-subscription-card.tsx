// src/components/merchant/merchant-subscription-card.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  createMerchantSubscriptionCheckout,
  fetchMerchantSubscription,
  openMerchantBillingPortal,
} from "../../api/merchant-billing";
import { AdminHint } from "../admin/admin-ui";
import { linkButtonClass } from "../ui/button";
import { Card } from "../ui/card";
import type { MerchantSubscriptionStatus } from "../../types";

function formatDate(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const STATUS_LABELS: Record<string, string> = {
  trialing: "Essai gratuit",
  active: "Actif",
  past_due: "Paiement en retard",
  canceled: "Annule",
  unpaid: "Impaye",
  incomplete: "En attente",
};

export function MerchantSubscriptionCard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<MerchantSubscriptionStatus | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadStatus() {
    setIsLoading(true);
    setError("");
    try {
      setStatus(await fetchMerchantSubscription());
    } catch {
      setError("Impossible de charger l'abonnement");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    const billingParam = searchParams.get("billing");
    if (!billingParam) return;

    loadStatus().finally(() => {
      const next = new URLSearchParams(searchParams);
      next.delete("billing");
      setSearchParams(next, { replace: true });
    });
  }, [searchParams, setSearchParams]);

  async function handleSubscribe() {
    setIsSubmitting(true);
    setError("");
    try {
      const url = await createMerchantSubscriptionCheckout();
      window.location.href = url;
    } catch {
      setError("Redirection vers Stripe impossible");
      setIsSubmitting(false);
    }
  }

  async function handlePortal() {
    setIsSubmitting(true);
    setError("");
    try {
      const url = await openMerchantBillingPortal();
      window.location.href = url;
    } catch {
      setError("Ouverture du portail de facturation impossible");
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-sand-dark/40 bg-paper/40 px-6 py-4">
        <h2 className="font-serif text-lg font-semibold text-petrol">Abonnement commercant</h2>
        <p className="mt-1 text-sm text-ink-muted">
          12 € / mois — fiche vitrine, QR code, contenu et transmission de leads. Essai gratuit 7 jours.
        </p>
      </div>

      <div className="space-y-4 p-6">
        {isLoading && <p className="text-sm text-ink-muted">Chargement...</p>}

        {!isLoading && status && (
          <>
            {status.active ? (
              <div className="rounded-xl border border-success/20 bg-success/5 p-4">
                <p className="text-sm font-medium text-success">
                  Abonnement {STATUS_LABELS[status.status || ""] || "actif"}
                </p>
                {status.status === "trialing" && status.trial_ends_at && (
                  <p className="mt-1 text-sm text-ink-muted">
                    Fin de l&apos;essai le {formatDate(status.trial_ends_at)}
                  </p>
                )}
                {status.current_period_end && status.status !== "trialing" && (
                  <p className="mt-1 text-sm text-ink-muted">
                    Prochaine echeance le {formatDate(status.current_period_end)}
                  </p>
                )}
              </div>
            ) : (
              <AdminHint>
                Sans abonnement actif, vous ne pouvez pas publier votre fiche, exporter le QR code ni transmettre de leads.
              </AdminHint>
            )}

            <div className="flex flex-wrap gap-3">
              {!status.active ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubscribe}
                  className={linkButtonClass("primary", "text-sm")}
                >
                  {isSubmitting ? "Redirection..." : "S'abonner — essai 7 jours"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePortal}
                  className={linkButtonClass("outline", "text-sm")}
                >
                  Gerer mon abonnement
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
