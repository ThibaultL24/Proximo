// src/pages/public/home-page.tsx
import { Link } from "react-router-dom";
import { TerritoryHeroBand } from "../../components/public/territory-hero-band";
import { linkButtonClass } from "../../components/ui/button";
import { BRAND } from "../../lib/brand";
import { OFFER_TIERS, PUBLIC_NAV } from "../../lib/public-nav";

const PILLARS = [
  {
    title: "Commerçants du 07700",
    text: "Fiches vitrine, publications et bonnes adresses — une fenêtre ouverte sur les acteurs locaux.",
    href: "/commerces",
    cta: "Voir les commerces",
  },
  {
    title: "Fil d'actualités",
    text: "Articles et posts partenaires, filtrables par rubrique et par commune.",
    href: "/fil",
    cta: "Lire le fil",
  },
  {
    title: "Actu immobilière",
    text: "Conseils et projets immo dans le territoire — une rubrique claire, pas toute la plateforme.",
    href: "/immo",
    cta: "Rubrique Immo",
  },
] as const;

export function HomePage() {
  return (
    <div className="space-y-14 pb-16 md:pb-10">
      <section className="space-y-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          {BRAND.territoryLabel}
        </p>
        <h1 className="max-w-3xl font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {BRAND.name}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
          {BRAND.tagline} Une fenêtre ouverte sur les commerçants, la vie locale et l&apos;immobilier
          du 07700.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/fil" className={linkButtonClass("accent")}>
            Voir le fil
          </Link>
          <Link to="/commerces" className={linkButtonClass("outline")}>
            Les commerces
          </Link>
        </div>
        <TerritoryHeroBand />
      </section>

      <section aria-labelledby="quoi-heading" className="space-y-6">
        <div className="max-w-2xl">
          <h2 id="quoi-heading" className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Ce que vous trouvez ici
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Trois entrées simples — sans empiler toute l&apos;actu sur la page d&apos;accueil.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.href}
              className="flex flex-col border border-line bg-surface p-5"
            >
              <h3 className="font-serif text-xl font-semibold text-ink">{pillar.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{pillar.text}</p>
              <Link
                to={pillar.href}
                className="mt-4 text-sm font-semibold text-tile hover:underline"
              >
                {pillar.cta} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="nav-heading" className="border border-line bg-paper px-5 py-6 sm:px-8">
        <h2 id="nav-heading" className="font-serif text-2xl font-semibold text-ink">
          Parcourir
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Fil, commerces, communes et rubriques — toujours dans la barre de navigation.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {PUBLIC_NAV.map((item) => (
            <li key={item.id}>
              <Link
                to={item.href}
                className="inline-block border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink transition hover:border-ink/40"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="offres-heading" className="space-y-6">
        <div className="max-w-2xl">
          <h2 id="offres-heading" className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Services & modèles
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Habitants, commerçants partenaires ou simple lecture — choisissez comment vous utilisez
            Fenêtre Ouverte. Les tarifs d&apos;abonnement se précisent à l&apos;inscription.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {OFFER_TIERS.map((tier) => (
            <article key={tier.id} className="flex flex-col border border-line bg-surface p-5">
              <h3 className="font-serif text-xl font-semibold text-ink">{tier.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{tier.description}</p>
              <Link to={tier.cta.href} className={`${linkButtonClass("outline")} mt-5 self-start`}>
                {tier.cta.label}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 border-t-2 border-ink pt-8 sm:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">Vous êtes commerçant ?</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-muted">
            Publiez dans le fil, soyez visible dans votre commune, partagez votre fiche et votre QR
            code. La republication Facebook arrivera bientôt.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/connexion" className={linkButtonClass("accent")}>
              Espace partenaire
            </Link>
            <Link to="/communes" className={linkButtonClass("outline")}>
              Voir les communes
            </Link>
          </div>
        </div>
        <aside className="border border-line bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Territoire</p>
          <p className="mt-2 font-serif text-xl font-semibold text-ink">7 communes · 07700</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Bourg-Saint-Andéol et ses voisines — un seul média local pour l&apos;info, les adresses et
            l&apos;immo.
          </p>
        </aside>
      </section>
    </div>
  );
}
