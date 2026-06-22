// src/pages/merchant/new-lead-page.tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createMerchantLead } from "../../api/leads";
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
import type { LeadInput } from "../../types";

const LEAD_TYPES = [
  { value: "buy", label: "Achat" },
  { value: "sell", label: "Vente" },
  { value: "rent", label: "Location" },
  { value: "other", label: "Autre" },
];

const emptyForm: LeadInput = {
  contact_name: "",
  contact_phone: "",
  contact_email: "",
  lead_type: "sell",
  property_address: "",
  property_city: "",
  description: "",
  consent_given: false,
};

export function NewLeadPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<LeadInput>(emptyForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof LeadInput>(key: K, value: LeadInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.consent_given) {
      setError("Vous devez confirmer le consentement du contact.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createMerchantLead({
        ...form,
        budget_min: form.budget_min ? Number(form.budget_min) : undefined,
        budget_max: form.budget_max ? Number(form.budget_max) : undefined,
      });
      navigate("/espace-commercant");
    } catch {
      setError("Impossible d'enregistrer le lead. Verifiez les champs obligatoires.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-6">
      <AdminPageHeader
        eyebrow="Recommandation"
        title="Transmettre un contact immobilier"
        description="Partagez les coordonnees d'une personne interessee par un projet immobilier."
        backTo="/espace-commercant"
        backLabel="Tableau de bord"
      />

      <AdminFormShell onSubmit={handleSubmit}>
        <AdminFieldset legend="Contact client">
          <input
            type="text"
            placeholder="Nom du client *"
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
            placeholder="Email (optionnel)"
            value={form.contact_email}
            onChange={(e) => updateField("contact_email", e.target.value)}
            className={adminInputClass}
          />
        </AdminFieldset>

        <AdminFieldset legend="Projet">
          <AdminSelect
            value={form.lead_type}
            onChange={(e) => updateField("lead_type", e.target.value)}
            className="w-full"
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
            placeholder="Description du projet"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className={adminInputClass}
            rows={3}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              placeholder="Budget min (EUR)"
              value={form.budget_min ?? ""}
              onChange={(e) =>
                updateField("budget_min", e.target.value ? Number(e.target.value) : undefined)
              }
              className={adminInputClass}
            />
            <input
              type="number"
              placeholder="Budget max (EUR)"
              value={form.budget_max ?? ""}
              onChange={(e) =>
                updateField("budget_max", e.target.value ? Number(e.target.value) : undefined)
              }
              className={adminInputClass}
            />
          </div>
        </AdminFieldset>

        <label className="flex items-start gap-3 rounded-xl border border-sand-dark/50 bg-paper/40 p-4 text-sm">
          <input
            type="checkbox"
            checked={form.consent_given}
            onChange={(e) => updateField("consent_given", e.target.checked)}
            className="mt-0.5"
            required
          />
          <span>
            Je confirme que cette personne accepte d&apos;etre recontactee par l&apos;agence
            immobiliere dans le cadre de son projet (RGPD).
          </span>
        </label>

        <AdminHint>
          L&apos;agence sera notifiee et vous pourrez suivre l&apos;avancement depuis votre tableau de bord.
        </AdminHint>

        {error && <AdminAlert>{error}</AdminAlert>}

        <div className="border-t border-sand-dark/40 pt-5">
          <button type="submit" disabled={isSubmitting} className={`${buttonClass("primary")} w-full`}>
            {isSubmitting ? "Envoi..." : "Envoyer la recommandation"}
          </button>
        </div>
      </AdminFormShell>
    </section>
  );
}
