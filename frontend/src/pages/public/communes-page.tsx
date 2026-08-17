// src/pages/public/communes-page.tsx
import { CommuneCard } from "../../components/public/commune-card";
import { BRAND } from "../../lib/brand";
import { TERRITORY_COMMUNES } from "../../lib/territory";

export function CommunesPage() {
  return (
    <div className="space-y-8 pb-10">
      <header className="space-y-3 border-b border-line pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          {BRAND.territoryLabel}
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Les communes du 07700
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
          Bourg-Saint-Andéol et six communes voisines. Ouvrez une fiche pour voir commerces, actus
          et activités sur place.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {TERRITORY_COMMUNES.map((commune, index) => (
          <CommuneCard key={commune.insee_code} commune={commune} index={index} />
        ))}
      </div>
    </div>
  );
}
