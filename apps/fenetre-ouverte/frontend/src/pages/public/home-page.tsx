import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchFeed } from "../../api/feed";
import { BRAND } from "../../lib/brand";
import type { FeedItem } from "../../types";

const villages = [
  { name: "Bourg-Saint-Andéol", image: "/territory/bourg-saint-andeol-centre.png" },
  { name: "Saint-Remèze", image: "/territory/saint-remeze-village.png" },
  { name: "Saint-Martin-d'Ardèche", image: "/territory/saint-martin-gorges.png" },
];

export function HomePage() {
  const [posts, setPosts] = useState<FeedItem[]>([]);
  useEffect(() => {
    fetchFeed({ limit: 6 }).then(setPosts).catch(() => setPosts([]));
  }, []);

  return (
    <div className="space-y-10 pb-12 sm:space-y-14">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#0b4c93] text-white shadow-xl sm:rounded-[2.5rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(58,165,245,.35),transparent_48%)]" aria-hidden="true" />
        <div className="relative grid lg:grid-cols-[1fr_.92fr]">
          <div className="relative z-10 flex flex-col justify-center px-7 py-10 sm:px-11 sm:py-16">
            <span className="w-fit rounded-full bg-[#ffbd24] px-4 py-2 text-xs font-extrabold uppercase tracking-[.13em] text-[#083b6d]">Sud Ardèche · Drôme · Vaucluse</span>
            <p className="mt-7 text-sm font-bold uppercase tracking-[.22em] text-[#c4e8ff]">Bienvenue chez nous</p>
            <h1 className="mt-3 max-w-xl font-sans text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              La vie locale <span className="text-[#ffd047]">a son réseau.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-blue-50/90 sm:text-lg">
              Les gens d'ici, les commerçants, les découvertes et les histoires de nos villages. Une fenêtre ouverte sur notre territoire.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/fil" className="rounded-full bg-[#ffbd24] px-6 py-3 text-sm font-extrabold text-[#073a68] transition hover:bg-[#ffd45b]">Découvrir le fil local</Link>
              <Link to="/commerces" className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20">Explorer les commerces</Link>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-3 text-xs font-semibold text-blue-100">
              <span className="rounded-full border border-white/25 px-3 py-1.5">Fiches commerçantes</span>
              <span className="rounded-full border border-white/25 px-3 py-1.5">Publications locales</span>
              <span className="rounded-full border border-white/25 px-3 py-1.5">Gazette</span>
            </div>
          </div>
          <div className="relative min-h-64 lg:min-h-[480px]">
            <img src="/territory/hero-gorges.png" className="absolute inset-0 h-full w-full object-cover" alt="Panorama des gorges et de la nature en Ardèche" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#052951]/75 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0b4c93] lg:to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-widest text-[#ffe49b]">Notre région à l'honneur</p>
              <strong className="mt-1 block text-xl">L'Ardèche, ses villages, ses visages</strong>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Trois portes d'entrée" className="grid gap-4 md:grid-cols-3">
        {[
          { icon: "✦", title: "Le fil du territoire", body: "Les nouvelles, les découvertes et les événements qui rythment nos communes.", href: "/fil", cta: "Lire les publications" },
          { icon: "⌂", title: "Nos commerçants", body: "Leur univers, leurs nouveautés, leurs photos et leurs adresses, accessibles aussi par QR code.", href: "/commerces", cta: "Trouver une adresse" },
          { icon: "▤", title: "La Gazette", body: "Des portraits, des reportages et des histoires locales sélectionnés par la rédaction.", href: "/fil?kind=article", cta: "Ouvrir la Gazette" },
        ].map(item => (
          <Link key={item.title} to={item.href} className="fo-card fo-hover group block p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1cd] text-2xl font-bold text-[#0b4c93]">{item.icon}</span>
            <h2 className="mt-4 font-sans text-xl font-extrabold">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.body}</p>
            <p className="mt-5 text-sm font-bold text-[#1165aa]">{item.cta} <span aria-hidden="true">→</span></p>
          </Link>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <div className="flex items-end justify-between gap-3">
            <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#d47e18]">Le réseau vit</p><h2 className="mt-2 font-sans text-3xl font-extrabold">En ce moment, chez nous</h2></div>
            <Link to="/fil" className="shrink-0 text-sm font-bold text-[#0b4c93]">Tout voir →</Link>
          </div>
          {posts.length === 0 ? (
            <div className="fo-card p-7 text-ink-muted">Le fil des articles et publications approuvées apparaîtra ici. <Link to="/fil" className="font-bold text-[#0b4c93]">Voir le fil</Link>.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {posts.slice(0, 4).map(post => {
                const article = post.type === "article";
                const image = article ? post.cover_image_url : post.image_url;
                const title = article ? post.title : post.merchant?.name || "Une nouvelle du territoire";
                const text = article ? post.excerpt || post.body : post.body;
                const link = article ? `/gazette/${post.slug}` : `/fil/post/${post.id}`;
                return <Link key={post.type + post.id} to={link} className="fo-card fo-hover overflow-hidden">
                  {image ? <img className="h-40 w-full object-cover" src={image} alt="" /> : <div className="h-28 bg-gradient-to-br from-[#ffe2a1] via-[#a5dff8] to-[#60a9de]" />}
                  <div className="p-5">
                    <p className="text-[11px] font-extrabold uppercase tracking-[.15em] text-[#dd810f]">{article ? "La Gazette" : "Publication partenaire"}</p>
                    <h3 className="mt-2 line-clamp-2 font-sans text-base font-extrabold">{title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-muted">{text}</p>
                  </div>
                </Link>;
              })}
            </div>
          )}
        </div>
        <aside className="space-y-4">
          <div className="rounded-[1.75rem] bg-[#ffcf4b] p-6 text-[#083b6d]">
            <span className="text-xs font-extrabold uppercase tracking-widest">Commerçants & artisans</span>
            <h3 className="mt-3 font-sans text-2xl font-extrabold">Votre vitrine, votre communauté.</h3>
            <p className="mt-3 text-sm leading-relaxed">Gérez votre fiche, recevez les visiteurs de vos QR codes, publiez vos actualités et préparez vos posts pour plusieurs réseaux. La rédaction valide avant diffusion.</p>
            <Link to="/connexion" className="mt-5 inline-flex rounded-full bg-[#0b4c93] px-5 py-3 text-sm font-bold text-white">Accéder à l'espace commerçant</Link>
          </div>
          <div className="fo-card p-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#dd810f]">La Gazette</p>
            <h3 className="mt-2 font-sans text-xl font-extrabold">Les histoires qui nous rapprochent</h3>
            <p className="mt-3 text-sm text-ink-muted">Portraits de producteurs, patrimoine, vie locale : des articles sélectionnés et mis en page avec soin.</p>
            <Link to="/fil?kind=article" className="mt-4 inline-block text-sm font-bold text-[#0b4c93]">Lire les articles →</Link>
          </div>
        </aside>
      </section>

      <section className="space-y-5">
        <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#d47e18]">Au fil des villages</p><h2 className="mt-2 font-sans text-3xl font-extrabold">Nos communes, notre fierté</h2></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {villages.map(village => <Link to="/communes" key={village.name} className="fo-card fo-hover group relative block h-52 overflow-hidden">
            <img src={village.image} alt={village.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#03294f]/85 via-transparent to-transparent" />
            <strong className="absolute bottom-5 left-5 text-lg font-bold text-white">{village.name}</strong>
          </Link>)}
        </div>
      </section>
      <p className="text-center text-sm text-ink-muted">{BRAND.tagline} · Sud Ardèche</p>
    </div>
  );
}
