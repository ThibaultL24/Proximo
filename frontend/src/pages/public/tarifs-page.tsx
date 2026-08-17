// src/pages/public/tarifs-page.tsx
import { Link } from "react-router-dom";
import { linkButtonClass } from "../../components/ui/button";
import { HOW_IT_WORKS, PRICING_TIERS } from "../../lib/public-nav";
import { TERRITORY_HERO } from "../../lib/territory";

export function TarifsPage() {
  return (
    <div className="space-y-14 pb-16">
      <section className="relative overflow-hidden">
        <div className="relative aspect-[21/9] min-h-[200px] max-h-[320px] w-full">
          <img
            src={TERRITORY_HERO.image_url}
            alt={TERRITORY_HERO.image_alt}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-1 pb-6 sm:px-0 sm:pb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Tarifs</p>
            <h1 className="mt-2 max-w-2xl font-serif text-3xl font-semibold text-white sm:text-4xl">
              Des offres simples pour le 07700
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
              Citoyen, commercant ou agence — choisissez la formule adaptee. Essai gratuit sur les abonnements
              individuels.
            </p>
          </div>
        </div>
      </section>

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

      <section aria-labelledby="how-heading" className="border border-line bg-paper px-5 py-8 sm:px-8">
        <h2 id="how-heading" className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Comment ca marche
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {HOW_IT_WORKS.map((item) => (
            <li key={item.step} className="border border-line bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tile">Etape {item.step}</p>
              <p className="mt-2 font-serif text-lg font-semibold text-ink">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

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
