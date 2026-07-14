// src/components/admin/agency-subscription-card.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  createAgencySubscriptionCheckout,
  fetchAgencySubscription,
  openAgencyBillingPortal,
} from "../../api/agency-billing";
import { AdminHint } from "./admin-ui";
import { linkButtonClass } from "../ui/button";
import { Card } from "../ui/card";
import type { AgencySubscriptionStatus } from "../../types";

function formatDate(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AgencySubscriptionCard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<AgencySubscriptionStatus | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadStatus() {
    setIsLoading(true);
    setError("");
    try {
      setStatus(await fetchAgencySubscription());
    } catch {
      setError("Impossible de charger l'abonnement agence");
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
      const url = await createAgencySubscriptionCheckout();
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
      const url = await openAgencyBillingPortal();
      window.location.href = url;
    } catch {
      setError("Ouverture du portail impossible");
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-sand-dark/40 bg-paper/40 px-6 py-4">
        <h2 className="font-serif text-lg font-semibold text-petrol">Licence agence Proxi Immo</h2>
        <p className="mt-1 text-sm text-ink-muted">
          125 € / mois — votre annuaire, gazette, pipeline leads et reseau commercants. Essai gratuit 14 jours.
        </p>
      </div>

      <div className="space-y-4 p-6">
        {isLoading && <p className="text-sm text-ink-muted">Chargement...</p>}

        {!isLoading && status && (
          <>
            {status.active ? (
              <div className="rounded-xl border border-success/20 bg-success/5 p-4">
                <p className="text-sm font-medium text-success">Licence active</p>
                {status.current_period_end && (
                  <p className="mt-1 text-sm text-ink-muted">
                    Prochaine echeance le {formatDate(status.current_period_end)}
                  </p>
                )}
              </div>
            ) : (
              <AdminHint>
                Sans licence active, vous ne pouvez pas gerer commercants, contenus ni leads.
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
                  {isSubmitting ? "Redirection..." : "Activer la licence — essai 14 jours"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePortal}
                  className={linkButtonClass("outline", "text-sm")}
                >
                  Gerer la facturation
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
