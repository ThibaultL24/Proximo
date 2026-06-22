// src/components/public/place-grid.tsx
import { Link } from "react-router-dom";
import { gazetteHref } from "../../lib/gazette-labels";
import { Card } from "../ui/card";
import { PLACE_KIND_LABELS } from "../../lib/place-labels";
import type { Place } from "../../types";

interface PlaceGridProps {
  places: Place[];
  basePath: string;
  title: string;
}

function placePathFor(basePath: string, place: Place) {
  return place.path || (basePath ? `${basePath}/${place.slug}` : place.slug);
}

export function PlaceGrid({ places, basePath, title }: PlaceGridProps) {
  if (places.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-xl font-semibold text-petrol">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((place) => {
          const annuaireHref = basePath ? `/annuaire/${basePath}/${place.slug}` : `/annuaire/${place.slug}`;
          const territoryPath = placePathFor(basePath, place);

          return (
            <Card key={place.id} hover className="h-full p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-brass">
                {PLACE_KIND_LABELS[place.kind] || place.kind}
              </p>
              <h3 className="mt-1 font-serif text-lg font-semibold text-petrol">{place.name}</h3>
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
                <Link to={annuaireHref} className="text-brass hover:text-petrol">
                  Commercants →
                </Link>
                <Link to={gazetteHref(territoryPath)} className="text-ink-muted hover:text-petrol">
                  Gazette →
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
