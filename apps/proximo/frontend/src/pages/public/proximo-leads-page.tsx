import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { Shell } from "./proximo-workspace-page";
import "./proximo-design.css";

type Organization = { id: number; name: string; slug: string; membership_role: "owner" | "manager" | "member" };
type Partner = { id: number; name: string; status: string };
type LeadStatus = "received" | "qualified" | "in_progress" | "converted" | "rejected" | "paid";
type Lead = {
  id: number; contact_name: string; contact_phone: string; contact_email?: string;
  lead_type: "buy" | "sell" | "rent" | "other"; description?: string;
  property_city?: string; status: LeadStatus; partner_id?: number;
  submitted_by_id: number; created_at: string;
};
type LeadDetail = Lead & { history?: { from_status: string | null; to_status: string; note?: string; created_at: string }[] };
type Commission = { id: number; lead_id: number; amount_cents: number; platform_fee_cents: number; status: string; currency: string };
const LABEL: Record<LeadStatus, string> = {
  received: "Reçue", qualified: "Qualifiée", in_progress: "En cours",
  converted: "Convertie", rejected: "Refusée", paid: "Payée (ancien statut)",
};
const TYPES = { buy: "Achat", sell: "Vente", rent: "Location", other: "Autre" } as const;
const fmt = (cents: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

export function ProximoLeadsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [leadType, setLeadType] = useState<Lead["lead_type"]>("sell");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [consent, setConsent] = useState(false);

  const org = organizations.find((item) => item.id === selected);
  const canManage = org?.membership_role === "owner" || org?.membership_role === "manager";
  const base = selected ? "/proximo/organizations/" + selected : "";

  useEffect(() => {
    api.get<Organization[]>("/proximo/organizations").then(({ data }) => {
      setOrganizations(data);
      setSelected(data[0]?.id ?? null);
    }).catch(() => setError("Impossible de charger les organisations."));
  }, []);

  useEffect(() => {
    if (!selected) return;
    const orgInfo = organizations.find((item) => item.id === selected);
    const path = "/proximo/organizations/" + selected;
    Promise.all([
      api.get<Lead[]>(path + "/leads"),
      api.get<Partner[]>(path + "/partners"),
      orgInfo?.membership_role === "owner" || orgInfo?.membership_role === "manager"
        ? api.get<Commission[]>(path + "/commissions")
        : Promise.resolve({ data: [] as Commission[] }),
    ]).then(([leadResponse, partnerResponse, commissionResponse]) => {
      setLeads(leadResponse.data);
      setPartners(partnerResponse.data);
      setCommissions(commissionResponse.data);
      setError("");
      setDetail(null);
    }).catch(() => setError("L'accès aux recommandations de cette organisation a échoué."));
  }, [selected, organizations]);

  async function reload() {
    if (!selected) return;
    const [all, commissionResult] = await Promise.all([
      api.get<Lead[]>(base + "/leads"),
      canManage ? api.get<Commission[]>(base + "/commissions") : Promise.resolve({ data: [] as Commission[] }),
    ]);
    setLeads(all.data);
    setCommissions(commissionResult.data);
    if (detail) {
      const response = await api.get<LeadDetail>(base + "/leads/" + detail.id);
      setDetail(response.data);
    }
  }

  async function openLead(id: number) {
    try {
      const { data } = await api.get<LeadDetail>(base + "/leads/" + id);
      setDetail(data);
    } catch { setError("Impossible de consulter le détail de cette recommandation."); }
  }

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!selected || !consent) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.post<Lead>(base + "/leads", {
        lead: {
          contact_name: contactName.trim(), contact_phone: contactPhone.trim(),
          contact_email: contactEmail.trim(), lead_type: leadType,
          property_city: city.trim(), description: description.trim(),
          consent_given: true, ...(partnerId ? { partner_id: Number(partnerId) } : {}),
        },
      });
      setContactName(""); setContactPhone(""); setContactEmail("");
      setDescription(""); setCity(""); setConsent(false); setPartnerId("");
      setMessage("Recommandation fictive créée : #" + data.id + ". Elle attend une qualification.");
      await reload();
      await openLead(data.id);
    } catch { setError("Création impossible : vérifiez les champs et les droits d'accès."); }
    finally { setBusy(false); }
  }

  async function advance(id: number, action: "qualify" | "start" | "convert" | "reject") {
    setBusy(true); setError(""); setMessage("");
    const note = action === "qualify" ? "Coordonnées et projet vérifiés (simulation)"
      : action === "start" ? "Prise en charge par l'agence (simulation)"
      : action === "convert" ? "Conversion enregistrée pour la démonstration"
      : "Hors périmètre ou contact non pertinent (simulation)";
    try {
      await api.patch(base + "/leads/" + id + "/" + action,
        action === "reject" ? { reason: note } : { note });
      await reload();
      setMessage("Le suivi de la recommandation a été actualisé.");
    } catch { setError("Transition refusée. Vérifiez votre rôle et le statut courant."); }
    finally { setBusy(false); }
  }

  return <Shell>
    <Link className="text-sm text-[#eafa64]" to="/espace">← Retour au cockpit</Link>
    <p className="proximo-kicker mt-7">RÉSEAU D'APPORTEURS · DÉMONSTRATION</p>
    <h1 className="mt-3 text-4xl font-black">Du contact à l'opportunité</h1>
    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/60">
      Déposez une recommandation, suivez sa qualification, puis visualisez son historique. Cette démonstration
      doit utiliser exclusivement des coordonnées fictives. La conversion et les commissions ne constituent
      ni une transaction réelle ni une validation du droit à rémunération.
    </p>
    <div className="mt-7 grid gap-4 md:grid-cols-3">
      <div className="proximo-panel"><p className="proximo-kicker">RECOMMANDATIONS</p><p className="mt-2 text-3xl font-black">{leads.length}</p></div>
      <div className="proximo-panel"><p className="proximo-kicker">À QUALIFIER</p><p className="mt-2 text-3xl font-black">{leads.filter((lead) => lead.status === "received").length}</p></div>
      <div className="proximo-panel"><p className="proximo-kicker">DOSSIERS CONVERTIS</p><p className="mt-2 text-3xl font-black">{leads.filter((lead) => lead.status === "converted").length}</p></div>
    </div>
    <div className="mt-7 max-w-md">
      <label className="proximo-form-label">Organisation
        <select className="proximo-input mt-2" value={selected ?? ""} onChange={(event) => setSelected(Number(event.target.value))}>
          {organizations.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.membership_role}</option>)}
        </select>
      </label>
    </div>
    {message && <p role="status" className="mt-5 rounded-xl bg-[#eafa64]/15 p-4 text-sm text-[#eafa64]">{message}</p>}
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-500/15 p-4 text-sm text-red-200">{error}</p>}
    <div className="mt-9 grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <form onSubmit={create} className="proximo-panel space-y-4">
        <h2 className="text-2xl font-bold">Nouvelle recommandation</h2>
        <p className="text-xs text-white/50">Exemple fictif : un habitant souhaite vendre un bien à Bourg-Saint-Andéol.</p>
        <label className="block"><span className="proximo-form-label">Nom du contact fictif</span>
          <input required className="proximo-input" value={contactName} onChange={(event) => setContactName(event.target.value)} /></label>
        <label className="block"><span className="proximo-form-label">Téléphone fictif</span>
          <input required type="tel" className="proximo-input" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} /></label>
        <label className="block"><span className="proximo-form-label">E-mail fictif (facultatif)</span>
          <input type="email" className="proximo-input" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="proximo-form-label">Projet</span><select className="proximo-input" value={leadType} onChange={(event) => setLeadType(event.target.value as Lead["lead_type"])}>
            {Object.entries(TYPES).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select></label>
          <label><span className="proximo-form-label">Commune</span><input className="proximo-input" value={city} onChange={(event) => setCity(event.target.value)} /></label>
        </div>
        {partners.length > 0 && <label className="block"><span className="proximo-form-label">Partenaire à l'origine du contact (facultatif)</span>
          <select value={partnerId} onChange={(event) => setPartnerId(event.target.value)} className="proximo-input">
            <option value="">Aucun partenaire externe</option>
            {partners.filter((partner) => partner.status === "active").map((partner) => <option key={partner.id} value={partner.id}>{partner.name}</option>)}
          </select></label>}
        <label className="block"><span className="proximo-form-label">Description du projet</span>
          <textarea className="proximo-input" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <label className="flex gap-3 text-xs text-white/70"><input className="mt-1 accent-lime-300" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
          <span>Je confirme que ce scénario utilise des données fictives. Pour un vrai prospect, sa transmission nécessite une information claire et une base légale appropriée.</span></label>
        <button disabled={busy || !selected} type="submit" className="proximo-primary w-full">
          {busy ? "Enregistrement…" : "Transmettre la recommandation"}
        </button>
      </form>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Suivi des recommandations</h2>
        {leads.length === 0 && <p className="proximo-panel text-sm text-white/60">Aucune recommandation visible pour ce compte.</p>}
        {leads.map((lead) => <article className="proximo-panel" key={lead.id}>
          <div className="flex flex-wrap justify-between gap-3">
            <div><span className="proximo-kicker">{TYPES[lead.lead_type]} · {lead.property_city || "Commune à préciser"}</span>
              <h3 className="mt-2 text-lg font-bold">{lead.contact_name}</h3>
              <p className="mt-1 text-xs text-white/40">Dossier #{lead.id} · {new Date(lead.created_at).toLocaleDateString("fr-FR")}</p>
            </div>
            <span className="h-fit rounded-full bg-white/10 px-3 py-1 text-xs text-[#eafa64]">{LABEL[lead.status]}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="proximo-outline" onClick={() => openLead(lead.id)}>Historique</button>
            {canManage && lead.status === "received" && <button disabled={busy} type="button" className="proximo-outline" onClick={() => advance(lead.id, "qualify")}>Qualifier</button>}
            {canManage && lead.status === "qualified" && <button disabled={busy} type="button" className="proximo-outline" onClick={() => advance(lead.id, "start")}>Prendre en charge</button>}
            {canManage && (lead.status === "qualified" || lead.status === "in_progress") && <button disabled={busy} type="button" className="proximo-primary" onClick={() => advance(lead.id, "convert")}>Convertir (démo)</button>}
            {canManage && (lead.status === "received" || lead.status === "qualified" || lead.status === "in_progress") && <button disabled={busy} type="button" className="proximo-outline" onClick={() => advance(lead.id, "reject")}>Refuser</button>}
          </div>
          {canManage && commissions.filter((commission) => commission.lead_id === lead.id).map((commission) => (
            <div key={commission.id} className="mt-4 border-t border-white/10 pt-3 text-xs text-white/60">
              Commission théorique : <strong className="text-white">{fmt(commission.amount_cents)}</strong>
              {" · "}Statut : {commission.status}{" · "}Frais plateforme simulés : {fmt(commission.platform_fee_cents)}
            </div>
          ))}
          {detail?.id === lead.id && <div className="mt-4 border-t border-white/10 pt-3">
            <p className="proximo-kicker">HISTORIQUE DES ÉTAPES</p>
            {(!detail.history || detail.history.length === 0) && <p className="mt-2 text-xs text-white/50">Aucun événement enregistré.</p>}
            {detail.history?.map((step, index) => <div key={index} className="mt-2 text-xs text-white/60">
              <strong className="text-white">{step.to_status}</strong> · {new Date(step.created_at).toLocaleString("fr-FR")}
              {step.note && <p>{step.note}</p>}
            </div>)}
          </div>}
        </article>)}
      </section>
    </div>
  </Shell>;
}
