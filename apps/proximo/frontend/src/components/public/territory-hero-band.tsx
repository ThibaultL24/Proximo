// src/components/public/territory-hero-band.tsx
import { TERRITORY_HERO } from "../../lib/territory";

/** Bande visuelle pleine largeur — ancre le journal dans le paysage du 07700. */
export function TerritoryHeroBand() {
  return (
    <figure className="relative -mx-4 overflow-hidden sm:-mx-0 sm:rounded-lg">
      <div className="relative aspect-[21/9] min-h-[160px] max-h-[280px] w-full sm:aspect-[2.8/1]">
        <img
          src={TERRITORY_HERO.image_url}
          alt={TERRITORY_HERO.image_alt}
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/15 to-transparent"
          aria-hidden
        />
        <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
          <p className="font-serif text-lg font-semibold text-white sm:text-xl">
            Sud Ardèche · 07700
          </p>
          <p className="text-[10px] font-medium text-white/70">© {TERRITORY_HERO.image_credit}</p>
        </figcaption>
      </div>
    </figure>
  );
}
