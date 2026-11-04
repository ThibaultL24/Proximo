import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../hooks/use-auth";
import "./proximo-design.css";

interface Organization { id:number; name:string; slug:string; membership_role?: "owner" | "manager" | "member"; }
interface Dossier { id:number; full_name:string; project_type:string; property_city?:string; mandate_status:string; created_at:string; }
interface LeadSummary { id:number; status:string; contact_name:string; lead_type:string; property_city?:string; }
export function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [canManage, setCanManage] = useState(false);
  useEffect(() => {
    let active = true;
    api.get<Organization[]>("/proximo/organizations")
      .then(({data}) => {
        if (active) setCanManage(data.some(o => o.membership_role === "owner" || o.membership_role === "manager"));
      })
      .catch(() => { if (active) setCanManage(false); });
    return () => { active = false; };
  }, []);
  const navigation: Array<{to:string;label:string;symbol:string;end:boolean;managerOnly?:boolean}> = [
    { to: "/espace", label: "Vue d'ensemble", symbol: "▦", end: true },
    { to: "/recommandations", label: "Recommandations", symbol: "◎", end: false },
    { to: "/annonces", label: "Diffusion d'annonces", symbol: "▣", end: false, managerOnly:true },
    { to: "/gestion", label: "Administration agence", symbol: "⌘", end: false, managerOnly:true },
    { to: "/espace#dossiers", label: "Dossiers clients", symbol: "▤", end: false, managerOnly:true },
    { to: "/dossiers/nouveau", label: "Nouvelle fiche client", symbol: "+", end: false, managerOnly:true },
  ];

  return <div className="proximo-ui proximo-app-shell min-h-screen">
    <aside className="proximo-app-sidebar" aria-label="Navigation de Proximo">
      <Link to="/espace" className="proximo-logo proximo-sidebar-brand">PROXIMO<span>.</span></Link>
      <div className="proximo-sidebar-subtitle">ESPACE IMMOBILIER</div>
      <nav className="proximo-app-nav" aria-label="Navigation métier">
        {navigation.filter(item => !item.managerOnly || canManage).map((item) => {
          if (item.to.includes("#")) {
            return <Link key={item.label} to={item.to} className="proximo-app-navlink">
              <span aria-hidden="true">{item.symbol}</span>{item.label}
            </Link>;
          }
          return <NavLink key={item.to} to={item.to} end={item.end}
            className={({ isActive }) => "proximo-app-navlink" + (isActive ? " is-active" : "")}>
            <span aria-hidden="true">{item.symbol}</span>{item.label}
          </NavLink>;
        })}
      </nav>
      <div className="proximo-sidebar-bottom">
        <p>Réseau, prospects et dossiers dans un seul espace.</p>
        <Link to="/" className="proximo-sidebar-public">Découvrir Proximo ↗</Link>
      </div>
    </aside>
    <div className="proximo-app-main">
      <header className="proximo-app-topbar">
        <span className="proximo-app-topbar-label">Votre espace professionnel</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden max-w-[230px] truncate text-white/50 sm:inline">{user?.email}</span>
          <button type="button" onClick={() => { logout(); navigate("/"); }}
            className="proximo-outline">Déconnexion</button>
        </div>
      </header>
      <main className="proximo-app-content">{children}</main>
    </div>
  </div>;
}
export function ProximoLoginPage() {
  const {login}=useAuth();
  const navigate=useNavigate();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  async function submit(e:FormEvent) {
    e.preventDefault();setLoading(true);setError("");
    try {await login(email,password);navigate("/espace");}
    catch {setError("Identifiants invalides ou compte inaccessible.");}
    finally{setLoading(false);}
  }
  return <div className="proximo-ui flex min-h-screen items-center justify-center px-4">
    <div className="proximo-panel w-full max-w-md p-8">
      <Link to="/" className="proximo-logo">PROXIMO<span>.</span></Link>
      <p className="proximo-kicker mt-8">ESPACE PROFESSIONNEL</p>
      <h1 className="mt-3 text-3xl font-black">Connexion</h1>
      <p className="mt-2 text-sm text-white/50">Accédez à vos organisations, prospects et dossiers.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block"><span className="proximo-form-label">Adresse e-mail</span><input type="email" required className="proximo-input" value={email} onChange={e=>setEmail(e.target.value)}/></label>
        <label className="block"><span className="proximo-form-label">Mot de passe</span><input type="password" required className="proximo-input" value={password} onChange={e=>setPassword(e.target.value)}/></label>
        {error&&<p role="alert" className="text-sm text-red-300">{error}</p>}
        <button disabled={loading} type="submit" className="proximo-primary w-full">{loading?"Connexion...":"Accéder au tableau de bord"}</button>
      </form>
      <p className="mt-7 text-xs text-white/35">Prévisualisation locale : compte administrateur des données de démonstration. Aucun paiement actif.</p>
    </div>
  </div>;
}
export function ProximoWorkspacePage() {
  const [organizations,setOrganizations] = useState<Organization[]>([]);
  const [selected,setSelected] = useState<number | null>(null);
  const [dossiers,setDossiers] = useState<Dossier[] | null>(null);
  const [leads,setLeads] = useState<LeadSummary[] | null>(null);
  const [error,setError] = useState("");

  useEffect(() => {
    api.get<Organization[]>("/proximo/organizations")
      .then(({data}) => { setOrganizations(data); setSelected(data[0]?.id ?? null); })
      .catch(() => setError("Impossible de charger vos organisations."));
  }, []);
  useEffect(() => {
    if (!selected) { setDossiers(null); setLeads(null); return; }
    let active = true;
    setDossiers(null); setLeads(null); setError("");
    const base = "/proximo/organizations/" + selected;
    void Promise.allSettled([
      api.get<Dossier[]>(base + "/client_dossiers"),
      api.get<LeadSummary[]>(base + "/leads"),
    ]).then(([cases, recommendations]) => {
      if (!active) return;
      if (cases.status === "fulfilled") setDossiers(cases.value.data);
      if (recommendations.status === "fulfilled") setLeads(recommendations.value.data);
      if (cases.status === "rejected" && recommendations.status === "rejected") {
        setError("Les données de cette organisation ne sont pas accessibles avec vos droits.");
      }
    });
    return () => { active = false; };
  }, [selected]);

  const pending = leads?.filter(lead => lead.status === "received").length;
  const converted = leads?.filter(lead => lead.status === "converted").length;

  return <Shell>
    <p className="proximo-kicker">PROXIMO · PILOTAGE IMMOBILIER</p>
    <h1 className="mt-3 text-4xl font-black tracking-tight">Votre vue d'ensemble</h1>
    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
      Du premier contact au dossier client : retrouvez vos recommandations,
      vos opportunités à qualifier et les besoins de votre organisation.
    </p>
    <div className="mt-8 flex flex-wrap items-end gap-3">
      <label className="min-w-[240px]">
        <span className="proximo-form-label">Organisation</span>
        <select className="proximo-input" value={selected ?? ""}
          onChange={event => setSelected(Number(event.target.value))}>
          {organizations.length === 0 && <option value="">Aucune organisation</option>}
          {organizations.map(org => <option value={org.id} key={org.id}>{org.name}</option>)}
        </select>
      </label>
      <Link to="/recommandations" className="proximo-primary">Voir les recommandations ↗</Link>
      {selected && organizations.some(org => org.id === selected && org.membership_role !== "member") &&
        <Link to={`/dossiers/nouveau?organization_id=${selected}`}
        className="proximo-outline">+ Nouvelle fiche client</Link>}
    </div>
    {error && <p role="alert" className="mt-5 rounded-xl border border-red-300/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</p>}
    <div className="mt-9 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { label:"Recommandations", value: leads?.length, description:"Contacts accessibles" },
        { label:"À qualifier", value: pending, description:"Nouvelles recommandations" },
        { label:"Converties", value: converted, description:"Suivi des opportunités" },
        { label:"Dossiers clients", value: dossiers?.length, description:"Dossiers consultables" },
      ].map(metric => <div className="proximo-stat" key={metric.label}>
        <p className="proximo-stat-label">{metric.label}</p>
        <strong className="proximo-stat-value">{metric.value ?? "—"}</strong>
        <p className="mt-3 text-xs text-white/45">
          {metric.value === undefined ? "Chargement ou accès limité" : metric.description}
        </p>
      </div>)}
    </div>
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="proximo-kicker">UN PARCOURS TRAÇABLE</p>
          <h2 className="mt-2 text-2xl font-bold">De la recommandation à l'opportunité</h2>
        </div>
        <Link className="text-sm font-semibold text-[#eafa64]" to="/recommandations">
          Accéder au suivi ↗
        </Link>
      </div>
      <div className="proximo-workflow mt-5">
        {[
          ["01","Reçue","Un contact est transmis au réseau."],
          ["02","Qualifiée","L'agence examine le projet."],
          ["03","En cours","Le contact est pris en charge."],
          ["04","Convertie","L'opportunité est suivie comme convertie."],
        ].map(([index,title,description]) =>
          <div className="proximo-workflow-step" key={index}>
            <span className="proximo-workflow-step-index">ÉTAPE {index}</span>
            <strong>{title}</strong>
            <p>{description}</p>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-white/40">
        Le suivi des étapes existe dans le code. Une conversion ne constitue
        ni une transaction finalisée ni une validation de commission.
      </p>
    </section>
    <section id="dossiers" className="mt-12 scroll-mt-8">
      <div className="flex flex-wrap justify-between gap-3">
        <h2 className="text-2xl font-bold">Dossiers clients</h2>
        <span className="text-sm text-white/50">{dossiers?.length ?? "—"} dossier(s) visible(s)</span>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {dossiers === null && <p className="proximo-panel text-sm text-white/50">
          Chargement des dossiers ou accès réservé aux responsables.
        </p>}
        {dossiers?.length === 0 && <p className="proximo-panel text-sm text-white/55">
          Aucun dossier à afficher. Vous pouvez commencer par une nouvelle fiche client.
        </p>}
        {dossiers?.map(dossier => <article key={dossier.id} className="proximo-panel">
          <span className="proximo-kicker">{dossier.project_type.toUpperCase()}</span>
          <h3 className="mt-3 text-xl font-bold">{dossier.full_name}</h3>
          <p className="mt-2 text-sm text-white/50">{dossier.property_city || "Localisation à préciser"}</p>
          <p className="mt-4 text-xs text-white/50">
            Mandat : {dossier.mandate_status.replaceAll("_"," ")} · Dossier #{dossier.id}
          </p>
        </article>)}
      </div>
    </section>
  </Shell>;
}
export function ProximoNewDossierPage() {
  const [search]=useSearchParams();
  const organizationId=search.get("organization_id")||"";
  const [values,setValues]=useState({full_name:"",email:"",phone:"",project_type:"achat",property_city:"",budget_min:"",budget_max:"",requirements:"",mandate_reference:""});
  const [docs,setDocs]=useState<File[]>([]);
  const [consent,setConsent]=useState(false);
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState<string>("");
  const [error,setError]=useState("");
  const fields = [
    {key:"full_name",label:"Nom et prénom du client",type:"text",required:true},
    {key:"email",label:"E-mail",type:"email",required:false},
    {key:"phone",label:"Téléphone",type:"tel",required:false},
    {key:"property_city",label:"Ville / secteur recherché",type:"text",required:false},
    {key:"budget_min",label:"Budget minimum (€)",type:"number",required:false},
    {key:"budget_max",label:"Budget maximum (€)",type:"number",required:false},
    {key:"mandate_reference",label:"Référence du mandat (si existant)",type:"text",required:false}
  ] as const;
  async function submit(event:FormEvent) {
    event.preventDefault();setBusy(true);setError("");setResult("");
    if(!organizationId){setError("Aucune organisation sélectionnée.");setBusy(false);return;}
    try{
      const form=new FormData();
      Object.entries(values).forEach(([key,value])=>{if(value.trim())form.append(`client_dossier[${key}]`,value);});
      form.append("client_dossier[data_consent]",consent?"true":"false");
      docs.forEach(file=>form.append("client_dossier[documents][]",file));
      const {data}=await api.post<{id:number}>(`/proximo/organizations/${organizationId}/client_dossiers`,form);
      setResult(`Dossier client #${data.id} créé. Les pièces restent privées dans l'espace de votre organisation.`);
    }catch{setError("Impossible de créer le dossier. Vérifiez les champs, les droits et le consentement.");}
    finally{setBusy(false);}
  }
  return <Shell>
    <Link to="/espace" className="text-sm text-[#eafa64]">← Retour aux dossiers</Link>
    <p className="proximo-kicker mt-8">CONNAISSANCE CLIENT</p>
    <h1 className="mt-3 text-4xl font-black">Nouvelle fiche client</h1>
    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">Centralisez l'identité, le cahier des charges et les pièces reçues. Les données et documents sensibles doivent être traités conformément aux obligations applicables ; cette version n'automatise pas la vérification des mandats.</p>
    <form onSubmit={submit} className="mt-9 grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="proximo-panel space-y-5">
        <h2 className="text-xl font-bold">Informations et recherche</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map(f=><label key={f.key} className="block"><span className="proximo-form-label">{f.label}</span><input required={f.required} type={f.type} min={f.type==="number"?"0":undefined} value={values[f.key]} className="proximo-input" onChange={e=>setValues(v=>({...v,[f.key]:e.target.value}))}/></label>)}
          <label><span className="proximo-form-label">Type de projet</span><select className="proximo-input" value={values.project_type} onChange={e=>setValues(v=>({...v,project_type:e.target.value}))}><option value="achat">Achat</option><option value="vente">Vente</option><option value="location">Location</option><option value="investissement">Investissement</option></select></label>
        </div>
        <label className="block"><span className="proximo-form-label">Cahier des charges / critères essentiels</span><textarea rows={6} className="proximo-input" value={values.requirements} onChange={e=>setValues(v=>({...v,requirements:e.target.value}))} placeholder="Surface, nombre de pièces, secteurs, contraintes, souhaits..."/></label>
      </div>
      <aside className="proximo-panel h-fit space-y-5">
        <h2 className="text-xl font-bold">Pièces du dossier</h2>
        <p className="text-xs text-white/50">Mandat signé, documents client et justificatifs uniquement si leur collecte est nécessaire. Ne stockez pas de véritables pièces sensibles dans une installation de démonstration.</p>
        <label className="block"><span className="proximo-form-label">Joindre des fichiers (prototype)</span><input multiple type="file" onChange={e=>setDocs(Array.from(e.target.files||[]))} className="mt-2 block w-full text-xs text-white/60"/></label>
        <p className="text-xs text-white/40">Statut mandat initial : non reçu / à vérifier. Aucun document n'est considéré comme vérifié automatiquement.</p>
        <label className="flex gap-3 text-xs leading-relaxed text-white/75"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1 accent-lime-300"/><span>Je confirme disposer d'une base légale pour collecter les coordonnées et informations de ce client, et l'avoir informé du traitement.</span></label>
        {error&&<p role="alert" className="text-xs text-red-300">{error}</p>}
        {result&&<p role="status" className="rounded-xl bg-[#ecfa60]/15 p-3 text-sm text-[#eafa64]">{result}</p>}
        <button type="submit" disabled={busy} className="proximo-primary w-full">{busy?"Enregistrement...":"Créer le dossier client"}</button>
      </aside>
    </form>
  </Shell>;
}
