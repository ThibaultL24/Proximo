// src/components/public/place-breadcrumb.tsx
import { Link } from "react-router-dom";
import { gazetteHref } from "../../lib/gazette-labels";
import type { Place } from "../../types";

interface PlaceBreadcrumbProps {
  breadcrumb: Place[];
}

export function PlaceBreadcrumb({ breadcrumb }: PlaceBreadcrumbProps) {
  if (breadcrumb.length === 0) return null;

  const segments = breadcrumb.slice(1);

  return (
    <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1 text-sm">
      <Link to="/annuaire" className="font-medium text-brass hover:text-petrol">
        France
      </Link>
      {segments.map((place, index) => {
        const path = segments
          .slice(0, index + 1)
          .map((item) => item.slug)
          .join("/");
        const isLast = index === segments.length - 1;

        return (
          <span key={place.id} className="flex items-center gap-1">
            <span className="text-ink-muted/50">›</span>
            {isLast ? (
              <span className="font-medium text-petrol">{place.name}</span>
            ) : (
              <Link to={`/annuaire/${path}`} className="font-medium text-brass hover:text-petrol">
                {place.name}
              </Link>
            )}
          </span>
        );
      })}
      {segments.length > 0 && (
        <>
          <span className="text-ink-muted/50">·</span>
          <Link
            to={gazetteHref(segments.map((item) => item.slug).join("/"))}
            className="font-medium text-brass hover:text-petrol"
          >
            Gazette du territoire
          </Link>
        </>
      )}
    </nav>
  );
}
