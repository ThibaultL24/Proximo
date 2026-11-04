import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../api/client";
import { Shell } from "./proximo-workspace-page";
import "./proximo-design.css";

type Organization = { id: number; name: string; membership_role: "owner" | "manager" | "member" };
type Partner = {
  id: number; name: string; slug: string; status: "draft" | "active" | "archived";
  contact_email?: string | null; contact_phone?: string | null;
};
type Commission = {
  id: number; lead_id: number; status: string;
  amount_cents: number; platform_fee_cents: number; currency: string;
};
const formatMoney = (cents: number, currency = "EUR") =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(cents / 100);

export function ProximoGestionPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const managers = organizations.filter(org => org.membership_role !== "member");

  useEffect(() => {
    api.get<Organization[]>("/proximo/organizations").then(({ data }) => {
      setOrganizations(data);
      setOrganizationId(data.find(org => org.membership_role !== "member")?.id ?? null);
    }).catch(() => setError("Chargement des organisations impossible."));
  }, []);

  useEffect(() => {
    if (!organizationId) return;
    let active = true;
    const prefix = "/proximo/organizations/" + organizationId;
    Promise.all([
      api.get<Partner[]>(prefix + "/partners"),
      api.get<Commission[]>(prefix + "/commissions"),
    ]).then(([a, b]) => {
      if (active) { setPartners(a.data); setCommissions(b.data); }
    }).catch(() => {
      if (active) setError("Cette organisation ne donne pas accès à la gestion.");
    });
    return () => { active = false; };
  }, [organizationId]);

  async function addPartner(event: FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const slug = partnerName.trim().toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "").slice(0, 60);
      if (!slug) throw Error("Nom de partenaire non valide");
      const prefix = "/proximo/organizations/" + organizationId;
      await api.post(prefix + "/partners", {
        partner: { name: partnerName.trim(), slug, contact_email: partnerEmail.trim(), status: "draft" },
      });
      setPartners((await api.get<Partner[]>(prefix + "/partners")).data);
      setPartnerName(""); setPartnerEmail("");
      setMessage("Partenaire créé en brouillon. Son statut ne l'autorise pas encore à transmettre des contacts.");
    } catch {
      setError("Création impossible : vérifiez les données et les droits du responsable d'agence.");
    } finally { setBusy(false); }
  }

  return <Shell>
    <p className="proximo-kicker">PROXIMO · RESPONSABLE D'AGENCE</p>
    <h1 className="mt-3 text-4xl font-black">Administration du réseau</h1>
    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/60">
      Organisez les partenaires de l'agence et consultez les commissions enregistrées.
      Cette interface ne déclenche aucun paiement et ne valide pas la rémunération juridique.
    </p>
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-500/15 p-4 text-sm text-red-200">{error}</p>}
    {message && <p role="status" className="mt-5 rounded-xl bg-lime-400/10 p-4 text-sm text-lime-200">{message}</p>}

    {managers.length === 0 ? (
      <div className="proximo-panel mt-8">
        <h2 className="text-xl font-bold">Accès réservé aux responsables</h2>
        <p className="mt-2 text-sm text-white/60">
          Vous pouvez transmettre et suivre vos recommandations dans l'espace apporteur,
          mais seul un responsable d'organisation gère les partenaires et les commissions.
        </p>
      </div>
    ) : (
      <>
        <label className="mt-7 block max-w-md"><span className="proximo-form-label">Organisation à administrer</span>
          <select className="proximo-input mt-2" value={organizationId ?? ""}
            onChange={e => setOrganizationId(Number(e.target.value))}>
            {managers.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
          </select>
        </label>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["PARTENAIRES", partners.length, "Fiches enregistrées"],
            ["PARTENAIRES ACTIFS", partners.filter(p => p.status === "active").length, "Comptes autorisés"],
            ["COMMISSIONS SUIVIES", commissions.length, "Données de suivi, sans paiement automatique"],
          ].map(([label, value, note]) =>
            <div key={label} className="proximo-stat">
              <p className="proximo-stat-label">{label}</p>
              <strong className="proximo-stat-value">{value}</strong>
              <p className="mt-3 text-xs text-white/50">{note}</p>
            </div>
          )}
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-2">
          <section className="proximo-panel space-y-4">
            <h2 className="text-2xl font-bold">Partenaires apporteurs</h2>
            {partners.length === 0 && <p className="text-sm text-white/50">Aucun partenaire enregistré.</p>}
            {partners.map(partner => (
              <div key={partner.id} className="rounded-xl border border-white/10 p-4">
                <div className="flex justify-between gap-3">
                  <strong>{partner.name}</strong>
                  <span className="text-xs text-lime-200">{partner.status}</span>
                </div>
                {partner.contact_email && <p className="mt-2 text-xs text-white/50">{partner.contact_email}</p>}
              </div>
            ))}
            <form onSubmit={addPartner} className="space-y-3 border-t border-white/10 pt-5">
              <h3 className="font-bold">Ajouter un partenaire en brouillon</h3>
              <label className="block"><span className="proximo-form-label">Nom du partenaire</span>
                <input className="proximo-input" required value={partnerName}
                  onChange={e => setPartnerName(e.target.value)} /></label>
              <label className="block"><span className="proximo-form-label">E-mail professionnel (facultatif)</span>
                <input className="proximo-input" type="email" value={partnerEmail}
                  onChange={e => setPartnerEmail(e.target.value)} /></label>
              <button className="proximo-primary" type="submit" disabled={busy}>
                {busy ? "Enregistrement…" : "Créer le partenaire"}
              </button>
            </form>
          </section>
          <section className="proximo-panel space-y-4">
            <h2 className="text-2xl font-bold">Suivi des commissions</h2>
            <p className="text-xs text-white/50">
              Données de l'API Proximo, visibles par les responsables uniquement.
              Les montants n'impliquent pas un paiement effectué.
            </p>
            {commissions.length === 0 && <p className="text-sm text-white/50">Aucune commission.</p>}
            {commissions.map(commission => (
              <div className="rounded-xl border border-white/10 p-4" key={commission.id}>
                <div className="flex justify-between gap-3">
                  <strong>Dossier #{commission.lead_id}</strong>
                  <span className="text-xs text-lime-200">{commission.status}</span>
                </div>
                <p className="mt-3 text-lg font-bold">
                  {formatMoney(commission.amount_cents, commission.currency || "EUR")}
                </p>
                <p className="text-xs text-white/50">
                  Frais plateforme théoriques : {formatMoney(commission.platform_fee_cents, commission.currency || "EUR")}
                </p>
              </div>
            ))}
          </section>
        </div>
      </>
    )}
  </Shell>;
}
