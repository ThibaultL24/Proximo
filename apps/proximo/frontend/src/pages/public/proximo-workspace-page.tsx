import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../hooks/use-auth";
import "./proximo-design.css";

interface Organization { id:number; name:string; slug:string; }
interface Dossier { id:number; full_name:string; project_type:string; property_city?:string; mandate_status:string; created_at:string; }
function Shell({ children }: {children:React.ReactNode}) {
  const {user,logout}=useAuth();
  const navigate=useNavigate();
  return <div className="proximo-ui min-h-screen">
    <header className="proximo-nav">
      <Link to="/" className="proximo-logo">PROXIMO<span>.</span></Link>
      <div className="flex items-center gap-4 text-sm"><span className="hidden text-white/50 sm:inline">{user?.email}</span><button onClick={() => {logout();navigate("/");}} className="proximo-outline" type="button">Déconnexion</button></div>
    </header>
    <main className="proximo-wrap py-12">{children}</main>
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
  const [organizations,setOrganizations]=useState<Organization[]>([]);
  const [selected,setSelected]=useState<number|null>(null);
  const [dossiers,setDossiers]=useState<Dossier[]>([]);
  const [error,setError]=useState("");
  useEffect(()=>{ api.get<Organization[]>("/proximo/organizations").then(({data})=>{
    setOrganizations(data);setSelected(data[0]?.id??null);
  }).catch(()=>setError("Impossible de charger vos organisations.")); },[]);
  useEffect(()=>{if(!selected)return;api.get<Dossier[]>(`/proximo/organizations/${selected}/client_dossiers`).then(({data})=>{setDossiers(data);setError("");}).catch(()=>{setDossiers([]);setError("Les dossiers clients sont réservés aux responsables de l'organisation.");});},[selected]);
  return <Shell>
    <p className="proximo-kicker">LE COCKPIT IMMOBILIER</p>
    <h1 className="mt-3 text-4xl font-black tracking-tight">Votre espace professionnel</h1>
    <p className="mt-3 text-white/55">Dossiers, clients et réseau d'apporteurs, classés par organisation.</p>
    <div className="mt-8 flex flex-wrap items-end gap-4">
      <label className="min-w-[240px]"><span className="proximo-form-label">Organisation</span><select className="proximo-input" value={selected??""} onChange={e=>setSelected(Number(e.target.value))}>{organizations.map(o=><option value={o.id} key={o.id}>{o.name}</option>)}</select></label>
      {selected&&<Link to={`/dossiers/nouveau?organization_id=${selected}`} className="proximo-primary">+ Créer une fiche client</Link>}
    </div>
    {error&&<p className="mt-5 rounded-xl border border-white/20 bg-white/10 p-4 text-sm text-white/70">{error}</p>}
    <section className="mt-10">
      <div className="flex justify-between"><h2 className="text-2xl font-bold">Dossiers clients</h2><span className="text-sm text-white/50">{dossiers.length} dossier(s)</span></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {dossiers.length===0&&<p className="proximo-panel text-sm text-white/55">Aucun dossier à afficher. Commencez par une nouvelle fiche client.</p>}
        {dossiers.map(d=><div key={d.id} className="proximo-panel">
          <span className="proximo-kicker">{d.project_type.toUpperCase()}</span>
          <h3 className="mt-3 text-xl font-bold">{d.full_name}</h3>
          <p className="mt-2 text-sm text-white/50">{d.property_city||"Localisation à préciser"}</p>
          <p className="mt-4 text-xs text-white/50">Mandat : {d.mandate_status.replaceAll("_"," ")} · Dossier #{d.id}</p>
        </div>)}
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
