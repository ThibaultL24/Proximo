// src/pages/public/tarifs-page.tsx
import { Link } from "react-router-dom";
import { linkButtonClass } from "../../components/ui/button";
import { HowItWorks } from "../../components/public/how-it-works";
import { PublicPageHero } from "../../components/public/public-page-hero";
import { PRICING_TIERS } from "../../lib/public-nav";
import { PAGE_HEROES } from "../../lib/territory";

export function TarifsPage() {
  return (
    <div className="space-y-14 pb-16">
      <PublicPageHero
        image={PAGE_HEROES.tarifs}
        kicker="Sud Ardèche · 07700"
        title="Tarifs"
        size="lg"
        titleClassName="mt-3 font-serif text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl"
      >
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
          Des offres simples pour le territoire. Citoyen, commerçant ou agence — essai gratuit 7
          jours sur les abonnements individuels.
        </p>
      </PublicPageHero>

      <section className="grid gap-6 md:grid-cols-3">
        {PRICING_TIERS.map((tier) => (
          <article
            key={tier.id}
            className={[
              "flex flex-col border bg-surface p-6",
              "featured" in tier && tier.featured ? "border-tile shadow-sm" : "border-line",
            ].join(" ")}
          >
            {"featured" in tier && tier.featured && (
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-tile">
                Le plus populaire
              </p>
            )}
            <h2 className="font-serif text-2xl font-semibold text-ink">{tier.title}</h2>
            <p className="mt-3 font-serif text-4xl font-semibold tabular-nums text-ink">
              {tier.price}
              <span className="text-base font-normal text-ink-muted">{tier.period}</span>
            </p>
            <p className="mt-2 text-sm text-ink-muted">{tier.trial}</p>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-muted">{tier.description}</p>
            <ul className="mt-5 space-y-2 text-sm text-ink">
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="text-tile" aria-hidden>
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              to={tier.cta.href}
              className={`${linkButtonClass(tier.accent)} mt-6 self-start`}
            >
              {tier.cta.label}
            </Link>
          </article>
        ))}
      </section>

      <HowItWorks />

      <section className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink">Une question sur les tarifs ?</h2>
          <p className="mt-1 text-sm text-ink-muted">Contactez l&apos;agence pour une demo reseau.</p>
        </div>
        <Link to="/connexion" className={linkButtonClass("outline")}>
          Nous contacter
        </Link>
      </section>
    </div>
  );
}
