import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { Shell } from "./proximo-workspace-page";
import "./proximo-design.css";

type Organization = { id: number; name: string; membership_role: "owner" | "manager" | "member" };
type PropertyListing = {
  id: number; title: string; description: string; city: string; postal_code?: string;
  transaction_type: "sale" | "rental"; property_kind: string; price_cents?: number | null;
  area_sqm?: string | null; rooms?: number | null; bedrooms?: number | null;
  mandate_reference?: string; status: "draft" | "ready" | "archived";
  external_publication: false; legal_review_required: true; created_at: string;
};
type Portal = { id: string; label: string; mode: "contract" | "paid_partner" | "owner_blog" | "editorial"; notes: string };
const defaults = {
  title: "", description: "", city: "", postal_code: "", transaction_type: "sale",
  property_kind: "appartement", price_eur: "", area_sqm: "", rooms: "",
  bedrooms: "", mandate_reference: "", energy_class: "", ghg_class: "",
};
const currency = (cents?: number | null) =>
  cents == null ? "Prix à préciser" : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
const stageLabels = { draft: "Brouillon", ready: "Préparée pour contrôle", archived: "Archivée" };
const exportPath = (orgId: number, listingId: number, kind: "csv" | "json") =>
  `/proximo/organizations/${orgId}/property_listings/${listingId}/export?kind=${kind}`;

export function ProximoListingsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [portals, setPortals] = useState<Portal[]>([]);
  const [form, setForm] = useState(defaults);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Organization[]>("/proximo/organizations")
      .then(({ data }) => {
        setOrganizations(data);
        setOrganizationId(data.find(o => o.membership_role !== "member")?.id ?? null);
      })
      .catch(() => setError("Impossible de charger les organisations."));
  }, []);

  useEffect(() => {
    if (!organizationId) { setListings([]); setPortals([]); return; }
    setError("");
    const base = "/proximo/organizations/" + organizationId + "/property_listings";
    void Promise.all([api.get<PropertyListing[]>(base), api.get<Portal[]>(base + "/channels")])
      .then(([items, providers]) => { setListings(items.data); setPortals(providers.data); })
      .catch(() => setError("Accès réservé aux responsables de l'organisation."));
  }, [organizationId]);

  const base = organizationId ? "/proximo/organizations/" + organizationId + "/property_listings" : "";
  const refresh = async () => {
    if (!organizationId) return;
    const { data } = await api.get<PropertyListing[]>(base);
    setListings(data);
  };

  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (!organizationId) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const priceCents = form.price_eur ? Math.round(Number(form.price_eur.replace(",", ".")) * 100) : null;
      const payload = {
        title: form.title.trim(), description: form.description.trim(), city: form.city.trim(),
        postal_code: form.postal_code.trim(), transaction_type: form.transaction_type,
        property_kind: form.property_kind, mandate_reference: form.mandate_reference.trim(),
        price_cents: priceCents, area_sqm: form.area_sqm || null,
        rooms: form.rooms || null, bedrooms: form.bedrooms || null,
        energy_class: form.energy_class || null, ghg_class: form.ghg_class || null,
      };
      await api.post(base, { property_listing: payload });
      setForm(defaults);
      setNotice("Brouillon enregistré. Aucune annonce n'a été envoyée à un portail.");
      await refresh();
    } catch {
      setError("Enregistrement refusé : vérifiez les champs, le prix et les droits de l'organisation.");
    } finally { setSaving(false); }
  };

  const changeStatus = async (listingId: number, action: "prepare" | "archive") => {
    setSaving(true); setError(""); setNotice("");
    try {
      await api.patch(base + "/" + listingId + "/" + action);
      setNotice(action === "prepare"
        ? "Dossier préparé. Contrôle légal et contrat de diffusion toujours nécessaires."
        : "Annonce archivée.");
      await refresh();
    } catch {
      setError("Impossible de préparer ce dossier. Vérifiez la référence du mandat, le prix, la surface et le code postal.");
    } finally { setSaving(false); }
  };

  const exportListing = async (listing: PropertyListing, kind: "csv" | "json") => {
    if (!organizationId) return;
    try {
      const { data } = await api.get(exportPath(organizationId, listing.id, kind), { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([data], {
        type: kind === "csv" ? "text/csv;charset=utf-8" : "application/json",
      }));
      const a = document.createElement("a");
      a.href = url; a.download = `proximo-annonce-${listing.id}.${kind}`;
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
      setNotice("Export générique téléchargé. Il n'est pas directement compatible avec les portails.");
    } catch { setError("Export impossible. Seuls les dossiers préparés sont exportables."); }
  };

  const copyListing = async (listing: PropertyListing) => {
    const text = [
      listing.title, listing.city, currency(listing.price_cents),
      listing.area_sqm ? `${listing.area_sqm} m²` : "",
      listing.description,
    ].filter(Boolean).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Annonce copiée pour une publication manuelle autorisée.");
      setError("");
    } catch { setError("Copie impossible. Sélectionnez manuellement le texte."); }
  };

  const field = (name: keyof typeof defaults, value: string) =>
    setForm(current => ({ ...current, [name]: value }));

  return <Shell>
    <Link to="/espace" className="text-sm text-[#eafa64]">← Tableau de bord</Link>
    <p className="proximo-kicker mt-7">PROXIMO · DIFFUSION IMMOBILIÈRE</p>
    <h1 className="mt-3 text-4xl font-black">Atelier des annonces</h1>
    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/60">
      Préparez une seule annonce et distribuez ses informations à vos partenaires contractuels.
      Aucun envoi vers SeLoger, Logic-Immo ou un autre portail n'est activé sans accord officiel.
    </p>

    <div className="proximo-workflow mt-7">
      {[
        ["01", "Préparer", "Titre, prix, bien et photographies à réunir"],
        ["02", "Contrôler", "Mandat, mentions légales et diagnostics"],
        ["03", "Exporter", "Format générique CSV / JSON"],
        ["04", "Diffuser", "Contrat portail, partenaire ou blog autorisé"],
      ].map(([index, name, detail]) =>
        <div className="proximo-workflow-step" key={index}>
          <span className="proximo-workflow-step-index">ÉTAPE {index}</span>
          <strong>{name}</strong><p>{detail}</p>
        </div>
      )}
    </div>

    <div className="mt-7 max-w-md">
      <label className="proximo-form-label">Organisation
        <select value={organizationId ?? ""} onChange={e => setOrganizationId(Number(e.target.value))}
          className="proximo-input mt-2">
          {organizations.filter(o => o.membership_role !== "member").map(o =>
            <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </label>
    </div>
    {notice && <p role="status" className="mt-5 rounded-xl bg-[#eafa64]/15 p-4 text-sm text-[#eafa64]">{notice}</p>}
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-500/15 p-4 text-sm text-red-200">{error}</p>}

    <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <form className="proximo-panel space-y-4" onSubmit={create}>
        <h2 className="text-2xl font-bold">Créer un brouillon d'annonce</h2>
        <p className="text-xs text-white/55">Ne saisissez pas de données personnelles de propriétaires dans la description.</p>
        <label className="block"><span className="proximo-form-label">Titre du bien</span>
          <input required maxLength={140} className="proximo-input" value={form.title} onChange={e => field("title", e.target.value)} /></label>
        <label className="block"><span className="proximo-form-label">Description</span>
          <textarea required rows={4} maxLength={8000} className="proximo-input"
            value={form.description} onChange={e => field("description", e.target.value)} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="proximo-form-label">Opération</span>
            <select className="proximo-input" value={form.transaction_type} onChange={e => field("transaction_type", e.target.value)}>
              <option value="sale">Vente</option><option value="rental">Location</option>
            </select>
          </label>
          <label><span className="proximo-form-label">Type de bien</span>
            <select className="proximo-input" value={form.property_kind} onChange={e => field("property_kind", e.target.value)}>
              {["appartement","maison","terrain","immeuble","local_commercial","autre"].map(kind =>
                <option key={kind} value={kind}>{kind.replaceAll("_"," ")}</option>)}
            </select>
          </label>
          {([
            ["city","Ville","text"],["postal_code","Code postal","text"],
            ["price_eur","Prix (€)","number"],["area_sqm","Surface (m²)","number"],
            ["rooms","Pièces","number"],["bedrooms","Chambres","number"],
            ["mandate_reference","Référence du mandat","text"],
          ] as const).map(([name,label,type]) =>
            <label key={name}><span className="proximo-form-label">{label}</span>
              <input className="proximo-input" value={form[name]} type={type}
                step={name === "area_sqm" ? "0.01" : undefined}
                min={type === "number" ? "0" : undefined}
                onChange={e => field(name,e.target.value)} /></label>)}
          {(["energy_class","ghg_class"] as const).map(name =>
            <label key={name}><span className="proximo-form-label">{name === "energy_class" ? "Classe énergie" : "Émissions GES"}</span>
              <select className="proximo-input" value={form[name]} onChange={e => field(name,e.target.value)}>
                <option value="">À préciser</option>
                {["A","B","C","D","E","F","G","non_soumis"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>)}
        </div>
        <button disabled={!organizationId || saving} className="proximo-primary w-full" type="submit">
          {saving ? "Enregistrement…" : "Enregistrer le brouillon"}
        </button>
      </form>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Vos annonces préparées</h2>
        {listings.length === 0 && <p className="proximo-panel text-sm text-white/50">Aucun brouillon pour cette organisation.</p>}
        {listings.map(listing => <article className="proximo-panel" key={listing.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="proximo-kicker">{listing.city} · {listing.property_kind}</p>
              <h3 className="mt-2 text-lg font-bold">{listing.title}</h3>
              <p className="mt-1 text-sm text-white/65">{currency(listing.price_cents)} · {listing.area_sqm || "—"} m²</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-[#eafa64]">{stageLabels[listing.status]}</span>
          </div>
          <p className="mt-3 text-xs text-white/50">{listing.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {listing.status === "draft" && <button type="button" disabled={saving}
              className="proximo-outline" onClick={() => void changeStatus(listing.id,"prepare")}>Préparer pour contrôle</button>}
            {listing.status === "ready" && <>
              <button type="button" className="proximo-outline" onClick={() => void exportListing(listing,"csv")}>Exporter CSV</button>
              <button type="button" className="proximo-outline" onClick={() => void exportListing(listing,"json")}>Exporter JSON</button>
              <button type="button" className="proximo-primary" onClick={() => void copyListing(listing)}>Copier l'annonce</button>
            </>}
            {listing.status !== "archived" && <button type="button" className="proximo-outline"
              disabled={saving} onClick={() => void changeStatus(listing.id,"archive")}>Archiver</button>}
          </div>
          {listing.status === "ready" && <p className="mt-3 text-xs text-white/45">
            Non publiée sur les portails. Vérification juridique, des photographies et du contrat de diffusion obligatoire.
          </p>}
        </article>)}
      </section>
    </div>
    <section className="mt-12">
      <p className="proximo-kicker">DESTINATIONS POSSIBLES</p>
      <h2 className="mt-2 text-2xl font-bold">Où diffuser ?</h2>
      <p className="mt-2 max-w-3xl text-sm text-white/55">
        Les destinations ci-dessous indiquent des possibilités commerciales ou éditoriales, pas des connexions activées.
        Un export générique n'est pas un flux officiellement accepté par ces plateformes.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {portals.map(portal => <article className="proximo-panel" key={portal.id}>
          <strong className="text-lg">{portal.label}</strong>
          <p className="mt-2 text-xs text-[#eafa64]">{portal.mode === "contract"
            ? "Contrat / passerelle requis"
            : portal.mode === "paid_partner" ? "Prestataire payant"
            : portal.mode === "owner_blog" ? "Blog avec autorisation"
            : "Partenariat éditorial"}</p>
          <p className="mt-3 text-sm leading-relaxed text-white/55">{portal.notes}</p>
        </article>)}
      </div>
    </section>
  </Shell>;
}
