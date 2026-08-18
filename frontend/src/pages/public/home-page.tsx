// src/pages/public/home-page.tsx
import { Link } from "react-router-dom";
import { linkButtonClass } from "../../components/ui/button";
import { BRAND } from "../../lib/brand";
import { HowItWorks } from "../../components/public/how-it-works";
import { PublicPageHero } from "../../components/public/public-page-hero";
import { OFFER_TIERS, PRICING_TIERS } from "../../lib/public-nav";
import { PAGE_HEROES } from "../../lib/territory";

const AUDIENCES = [
  {
    id: "habitant",
    title: "Habitant",
    text: "Suivez le fil local, decouvrez les commerces du 07700 et transmettez votre projet immo.",
    href: "/inscription",
    cta: "Compte citoyen",
  },
  {
    id: "commercant",
    title: "Commercant",
    text: "Fiche photo, QR code, publications multi-reseaux et visibilite dans votre commune.",
    href: "/connexion",
    cta: "Espace partenaire",
  },
  {
    id: "agence",
    title: "Agence",
    text: "Pilotez le reseau, l'editorial, les leads et les commissions depuis un back-office.",
    href: "/agence/inscription",
    cta: "Licence agence",
  },
] as const;

export function HomePage() {
  return (
    <div className="space-y-16 pb-16 md:pb-10">
      <PublicPageHero
        image={PAGE_HEROES.home}
        kicker={BRAND.territoryLabel}
        title={BRAND.name}
        size="lg"
      >
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
          {BRAND.tagline} Commerces, actu locale et immobilier du 07700 — avec QR code, avis et
          publication multi-reseaux.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/fil" className={linkButtonClass("accent")}>
            Voir le fil
          </Link>
          <Link
            to="/tarifs"
            className={linkButtonClass("outline", "border-white/40 bg-white/10 text-white hover:bg-white/20")}
          >
            Voir les tarifs
          </Link>
        </div>
      </PublicPageHero>

      <section aria-labelledby="pour-qui-heading" className="space-y-6">
        <div className="max-w-2xl">
          <h2 id="pour-qui-heading" className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Pour qui ?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Une plateforme locale pour les habitants, les commercants partenaires et l&apos;agence du territoire.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map((item) => (
            <article key={item.id} className="flex flex-col border border-line bg-surface p-5">
              <h3 className="font-serif text-xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{item.text}</p>
              <Link to={item.href} className="mt-4 text-sm font-semibold text-tile hover:underline">
                {item.cta} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <HowItWorks />

      <section aria-labelledby="tarifs-heading" className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 id="tarifs-heading" className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
              Tarifs
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Citoyen 2 €, commercant 12 €, agence 125 € — essai gratuit 7 jours sur les abonnements individuels.
            </p>
          </div>
          <Link to="/tarifs" className={linkButtonClass("outline")}>
            Voir le detail
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={[
                "flex flex-col border bg-surface p-5",
                "featured" in tier && tier.featured ? "border-tile" : "border-line",
              ].join(" ")}
            >
              <h3 className="font-serif text-xl font-semibold text-ink">{tier.title}</h3>
              <p className="mt-2 font-serif text-3xl font-semibold tabular-nums text-ink">
                {tier.price}
                <span className="text-sm font-normal text-ink-muted">{tier.period}</span>
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">{tier.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="quoi-heading" className="space-y-6">
        <div className="max-w-2xl">
          <h2 id="quoi-heading" className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Explorer le territoire
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {OFFER_TIERS.map((tier) => (
            <article key={tier.id} className="flex flex-col border border-line bg-surface p-5">
              <h3 className="font-serif text-xl font-semibold text-ink">{tier.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{tier.description}</p>
              <Link to={tier.cta.href} className="mt-4 text-sm font-semibold text-tile hover:underline">
                {tier.cta.label} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 border-t-2 border-ink pt-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">Vous etes commercant ?</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-muted">
            Publiez dans le fil, partagez en un clic sur Facebook, Instagram et TikTok, et suivez vos scans QR
            depuis votre espace partenaire.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/connexion" className={linkButtonClass("accent")}>
              Espace partenaire
            </Link>
            <Link to="/tarifs" className={linkButtonClass("outline")}>
              Voir les tarifs
            </Link>
          </div>
        </div>
        <aside className="border border-line bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Territoire</p>
          <p className="mt-2 font-serif text-xl font-semibold text-ink">7 communes · 07700</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Bourg-Saint-Andeol et ses voisines — un media local pour l&apos;info, les adresses et l&apos;immo.
          </p>
        </aside>
      </section>
    </div>
  );
}
