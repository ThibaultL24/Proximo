// src/pages/public/communes-page.tsx
import { CommuneCard } from "../../components/public/commune-card";
import { PublicPageHero } from "../../components/public/public-page-hero";
import { BRAND } from "../../lib/brand";
import { PAGE_HEROES, TERRITORY_COMMUNES } from "../../lib/territory";

export function CommunesPage() {
  return (
    <div className="space-y-8 pb-10">
      <PublicPageHero
        image={PAGE_HEROES.communes}
        kicker={BRAND.territoryLabel}
        title="Les communes du 07700"
      >
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
          Bourg-Saint-Andéol et six communes voisines. Ouvrez une fiche pour voir commerces, actus
          et activités sur place.
        </p>
      </PublicPageHero>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {TERRITORY_COMMUNES.map((commune, index) => (
          <CommuneCard key={commune.insee_code} commune={commune} index={index} />
        ))}
      </div>
    </div>
  );
}
