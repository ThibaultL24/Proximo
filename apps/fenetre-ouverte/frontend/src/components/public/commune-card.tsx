// src/components/public/commune-card.tsx
import { Link } from "react-router-dom";
import type { TerritoryCommune } from "../../lib/territory";

interface CommuneCardProps {
  commune: TerritoryCommune;
  index?: number;
}

const PLACEHOLDER_TONES = [
  "from-[#ebe4d6] to-[#d9d0c0]",
  "from-[#e6e0d4] to-[#cfc6b6]",
  "from-[#e9e3d8] to-[#d4cbb9]",
  "from-[#ece6db] to-[#dbd2c2]",
  "from-[#e4ddd0] to-[#cdc3b2]",
  "from-[#ebe5da] to-[#d6cdbd]",
  "from-[#e7e1d5] to-[#d1c8b8]",
];

export function CommuneCard({ commune, index = 0 }: CommuneCardProps) {
  const href = `/communes/${commune.slug}`;
  const tone = PLACEHOLDER_TONES[index % PLACEHOLDER_TONES.length];

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-dark">
        {commune.image_url ? (
          <>
            <img
              src={commune.image_url}
              alt={commune.image_alt}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/45 to-transparent"
              aria-hidden
            />
          </>
        ) : (
          <div
            className={`flex h-full w-full flex-col justify-between bg-gradient-to-br ${tone} p-4`}
            role="img"
            aria-label={`${commune.image_alt} — photographie à venir`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45">
              Photo à venir
            </span>
            <span className="font-serif text-3xl font-semibold text-ink/18" aria-hidden>
              {commune.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-lg font-semibold text-ink group-hover:text-tile">
          <Link
            to={href}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tile"
          >
            {commune.name}
          </Link>
        </h3>
        <p className="mt-1 text-xs font-medium text-ink-muted">{commune.postal_code}</p>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{commune.blurb}</p>
        {commune.image_credit && (
          <p className="mt-2 text-[10px] text-ink-muted/70">© {commune.image_credit}</p>
        )}
      </div>
    </article>
  );
}
