// src/pages/client/client-new-lead-page.tsx
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { fetchMerchant } from "../../api/public";
import { createClientLead } from "../../api/client-leads";
import { fetchClientSubscription } from "../../api/client-billing";
import { ClientSubscriptionCard } from "../../components/client/client-subscription-card";
import {
  AdminAlert,
  AdminFieldset,
  AdminFormShell,
  AdminHint,
  AdminPageHeader,
  AdminSelect,
  adminInputClass,
} from "../../components/admin/admin-ui";
import { buttonClass } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useAuth } from "../../hooks/use-auth";
import type { ClientLeadInput } from "../../types";

const LEAD_TYPES = [
  { value: "buy", label: "Achat" },
  { value: "sell", label: "Vente" },
  { value: "rent", label: "Location" },
  { value: "other", label: "Autre" },
];

export function ClientNewLeadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const merchantSlug = searchParams.get("merchant");

  const [merchantName, setMerchantName] = useState<string | null>(null);
  const [directToAgency, setDirectToAgency] = useState(!merchantSlug);
  const [form, setForm] = useState<ClientLeadInput>({
    contact_name: user?.full_name || "",
    contact_phone: user?.phone || "",
    contact_email: user?.email || "",
    lead_type: "sell",
    property_address: "",
    property_city: "",
    description: "",
    consent_given: true,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);

  useEffect(() => {
    fetchClientSubscription()
      .then((sub) => setSubscriptionActive(sub.active))
      .catch(() => setSubscriptionActive(false));
  }, []);

  useEffect(() => {
    if (!merchantSlug) return;
    fetchMerchant(merchantSlug)
      .then((m) => setMerchantName(m.name))
      .catch(() => setMerchantName(null));
  }, [merchantSlug]);

  function updateField<K extends keyof ClientLeadInput>(key: K, value: ClientLeadInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createClientLead(form, directToAgency ? undefined : merchantSlug || undefined);
      navigate("/espace-client");
    } catch {
      setError("Impossible d'envoyer votre projet. Verifiez les champs obligatoires.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-6">
      <AdminPageHeader
        eyebrow="Projet immobilier"
        title="Transmettre mon projet"
        description="L'agence vous recontacte pour qualifier votre demande."
        backTo="/espace-client"
        backLabel="Mon espace"
      />

      {subscriptionActive === false && <ClientSubscriptionCard />}

      {subscriptionActive !== false && (
        <>
          {merchantSlug && merchantName && (
            <Card className="border-brass/20 bg-brass/5 p-4 text-sm text-petrol">
              Transmission via <strong>{merchantName}</strong>
              <button
                type="button"
                onClick={() => setDirectToAgency(true)}
                className="ml-2 text-brass underline"
              >
                ou directement a l&apos;agence
              </button>
            </Card>
          )}

          {directToAgency && !merchantSlug && (
            <AdminHint>Votre projet sera traite directement par l&apos;agence immobiliere.</AdminHint>
          )}

          <AdminFormShell onSubmit={handleSubmit}>
            <AdminFieldset legend="Vos coordonnees">
              <input
                type="text"
                placeholder="Nom *"
                value={form.contact_name}
                onChange={(e) => updateField("contact_name", e.target.value)}
                className={adminInputClass}
                required
              />
              <input
                type="tel"
                placeholder="Telephone *"
                value={form.contact_phone}
                onChange={(e) => updateField("contact_phone", e.target.value)}
                className={adminInputClass}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={form.contact_email}
                onChange={(e) => updateField("contact_email", e.target.value)}
                className={adminInputClass}
              />
            </AdminFieldset>

            <AdminFieldset legend="Votre projet">
              <AdminSelect
                value={form.lead_type}
                onChange={(e) => updateField("lead_type", e.target.value)}
              >
                {LEAD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </AdminSelect>
              <input
                type="text"
                placeholder="Adresse du bien"
                value={form.property_address}
                onChange={(e) => updateField("property_address", e.target.value)}
                className={adminInputClass}
              />
              <input
                type="text"
                placeholder="Ville"
                value={form.property_city}
                onChange={(e) => updateField("property_city", e.target.value)}
                className={adminInputClass}
              />
              <textarea
                placeholder="Decrivez votre projet (surface, delai, particularites...)"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className={adminInputClass}
                rows={4}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  placeholder="Budget min (€)"
                  value={form.budget_min ?? ""}
                  onChange={(e) => updateField("budget_min", e.target.value ? Number(e.target.value) : undefined)}
                  className={adminInputClass}
                />
                <input
                  type="number"
                  placeholder="Budget max (€)"
                  value={form.budget_max ?? ""}
                  onChange={(e) => updateField("budget_max", e.target.value ? Number(e.target.value) : undefined)}
                  className={adminInputClass}
                />
              </div>
            </AdminFieldset>

            <AdminHint>
              En envoyant ce formulaire, vous acceptez d&apos;etre recontacte par l&apos;agence dans le cadre de votre projet (RGPD).
            </AdminHint>

            {error && <AdminAlert>{error}</AdminAlert>}

            <div className="border-t border-sand-dark/40 pt-5">
              <button type="submit" disabled={isSubmitting} className={`${buttonClass("primary")} w-full`}>
                {isSubmitting ? "Envoi..." : "Envoyer mon projet"}
              </button>
            </div>
          </AdminFormShell>

          {!merchantSlug && (
            <p className="text-center text-sm text-ink-muted">
              Vous venez d&apos;un commercant ?{" "}
              <Link to="/annuaire" className="font-medium text-petrol">
                Retrouvez-le dans l&apos;annuaire
              </Link>
            </p>
          )}
        </>
      )}
    </section>
  );
}
