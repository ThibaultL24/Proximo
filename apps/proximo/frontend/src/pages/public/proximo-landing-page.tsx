import { Link } from "react-router-dom";
import "./proximo-design.css";

const plans = [
  { label:"Essentiel", price:49, note:"Pour démarrer seul", features:["1 organisation", "Prospects & partenaires", "Suivi des commissions", "Tableau de bord"], highlight:false },
  { label:"Professionnel", price:129, note:"Pour une agence structurée", features:["Plusieurs collaborateurs", "Fiches clients & cahiers des charges", "Suivi des documents & mandats", "Exports d'annonces préparés"], highlight:true },
  { label:"Réseau", price:249, note:"Pour développer vos apporteurs", features:["Gestion du réseau partenaire", "Organisation multi-équipe", "Pilotage commercial", "Accompagnement à l'intégration"], highlight:false }
];
const features = [
  { number:"01", title:"Apporteurs d'affaires", copy:"Faites remonter les opportunités d'un réseau de partenaires, avec un suivi précis du traitement des prospects." },
  { number:"02", title:"Dossiers clients", copy:"Centralisez les coordonnées, les attentes, le budget, les critères de recherche et les documents. Un dossier, une histoire." },
  { number:"03", title:"Mandats & conformité", copy:"Suivez la réception des mandats et des pièces nécessaires. Aucune mise en annonce sans validation professionnelle." },
  { number:"04", title:"Diffusion maîtrisée", copy:"Préparez vos annonces en vue de leur diffusion. Les connexions SeLoger et autres portails nécessitent des accords fournisseurs." }
];
export function ProximoLandingPage() {
  return (
    <div className="proximo-ui min-h-screen text-white">
      <header className="proximo-nav">
        <Link to="/" className="proximo-logo">PROXIMO<span>.</span></Link>
        <nav className="hidden items-center gap-8 text-sm text-white/65 md:flex">
          <a href="#fonctionnalites" className="hover:text-white">Fonctionnalités</a>
          <a href="#parcours" className="hover:text-white">Le parcours</a>
          <a href="#tarifs" className="hover:text-white">Tarifs</a>
        </nav>
        <Link to="/connexion" className="proximo-outline">Espace professionnel ↗</Link>
      </header>
      <main>
        <section className="proximo-hero">
          <div className="proximo-hero-glow" aria-hidden="true" />
          <div className="proximo-wrap relative z-10 grid gap-12 pt-20 pb-20 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:pt-28 lg:pb-28">
            <div className="relative">
              <p className="proximo-kicker"><span className="proximo-dot"/> IMMOBILIER · RÉSEAU · PERFORMANCE</p>
              <h1 className="mt-8 text-5xl font-black leading-[1.04] tracking-[-.055em] sm:text-6xl xl:text-7xl">L'immobilier, <span className="proximo-gradient-text">sans friction.</span></h1>
              <p className="mt-7 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">De la première recommandation au dossier client, puis au mandat : donnez à chaque opportunité un cadre professionnel, clair et maîtrisé.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link to="/connexion" className="proximo-primary">Explorer la démo <span>↗</span></Link>
                <a href="#tarifs" className="proximo-outline">Découvrir les offres</a>
              </div>
              <p className="mt-7 text-xs text-white/35">Prototype fonctionnel · Tarifs de présentation à confirmer · Aucune souscription active</p>
            </div>
            <div className="proximo-window relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-5"><span className="text-xs font-bold uppercase tracking-[.16em] text-white/45">Vue d'ensemble</span><span className="rounded-full border border-[#f8fd58]/25 bg-[#f8fd58]/10 px-3 py-1 text-[11px] font-bold text-[#f7ff83]">APERÇU</span></div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[["Prospects","24"],["Qualifiés","12"],["Dossiers","08"]].map(([k,v])=><div key={k} className="rounded-2xl border border-white/10 bg-white/[.045] p-4"><span className="block text-[11px] text-white/45">{k}</span><strong className="mt-2 block text-3xl font-extrabold text-white">{v}</strong></div>)}
              </div>
              <div className="mt-7 space-y-3">
                <div className="flex justify-between text-xs text-white/45"><span>Pipeline commercial</span><span>Exemple d'interface</span></div>
                {[["Nouveau contact","100%"],["Qualification","72%"],["Mandat en cours","48%"]].map(([label,width])=><div key={label}><div className="mb-2 text-xs text-white/70">{label}</div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#f5f951]" style={{width}} /></div></div>)}
              </div>
              <div className="mt-7 rounded-2xl border border-[#f4ff73]/20 bg-[#f4ff73]/10 p-4">
                <p className="text-xs font-bold text-[#f9ff8d]">Nouveau dossier client</p><p className="mt-2 text-sm text-white/70">Coordonnées · Cahier des charges · Pièces justificatives · Mandat</p>
              </div>
            </div>
          </div>
        </section>

        <section id="fonctionnalites" className="proximo-wrap py-20">
          <p className="proximo-kicker">UN OUTIL POUR LES PROFESSIONNELS</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4"><h2 className="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">Moins de dispersion.<br/><span className="text-white/45">Plus de maîtrise.</span></h2><p className="max-w-sm text-sm leading-relaxed text-white/50">Une architecture pensée pour l'immobilier, pas pour mélanger annonces, publication locale et e-commerce.</p></div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {features.map(f=><article className="proximo-feature" key={f.number}><span className="text-xs font-black tracking-widest text-[#e7f35e]">{f.number} / FONCTION</span><h3 className="mt-6 text-2xl font-bold">{f.title}</h3><p className="mt-3 max-w-md text-sm leading-relaxed text-white/55">{f.copy}</p></article>)}
          </div>
        </section>

        <section id="parcours" className="border-y border-white/10 bg-white/[.025]">
          <div className="proximo-wrap grid gap-8 py-16 md:grid-cols-4">
            {["Contact reçu", "Prospect qualifié", "Fiche client & pièces", "Mandat vérifié"].map((label,i)=><div key={label}><span className="text-xs font-black text-[#eff75d]">0{i+1} —</span><h3 className="mt-4 text-xl font-bold">{label}</h3><p className="mt-2 text-xs leading-relaxed text-white/40">{i===3 ? "Revue par un professionnel habilité." : "Traçabilité et attribution à votre organisation."}</p></div>)}
          </div>
        </section>

        <section id="tarifs" className="proximo-wrap py-20">
          <p className="proximo-kicker">UNE OFFRE LISIBLE</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Des tarifs. <span className="text-white/40">Sans zones grises.</span></h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/50">Proposition de tarification affichée pour la maquette. Prix HT/mois indicatifs, à valider avant commercialisation ; aucun paiement en ligne n'est activé.</p>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {plans.map(plan=><article key={plan.label} className={`proximo-plan ${plan.highlight?"proximo-plan-featured":""}`}>
              {plan.highlight && <span className="mb-4 inline-block rounded-full bg-[#f2fc62] px-3 py-1 text-xs font-black text-black">LE PLUS COMPLET POUR UNE AGENCE</span>}
              <h3 className="text-xl font-bold">{plan.label}</h3><p className="mt-2 text-sm text-white/50">{plan.note}</p>
              <div className="mt-7"><span className="text-5xl font-black tracking-tight">{plan.price} €</span><span className="ml-2 text-xs text-white/45">HT / mois</span></div>
              <div className="my-7 h-px bg-white/10"/>
              <ul className="space-y-4 text-sm text-white/75">{plan.features.map(item=><li key={item}><span className="mr-3 text-[#edfa60]">✓</span>{item}</li>)}</ul>
              <Link to="/connexion" className={`mt-9 block rounded-xl px-5 py-3 text-center text-sm font-bold ${plan.highlight?"bg-[#ecf95d] text-black":"border border-white/25 text-white hover:bg-white/10"}`}>Voir l'espace démo</Link>
            </article>)}
          </div>
        </section>
      </main>
      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/40">PROXIMO · SaaS immobilier · Version de prévisualisation, sans publication automatique ni signature juridique intégrée.</footer>
    </div>
  );
}
