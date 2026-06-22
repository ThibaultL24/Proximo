// src/components/public/sector-filter.tsx
import type { Sector } from "../../types";

interface SectorFilterProps {
  sectors: Sector[];
  value: string;
  onChange: (slug: string) => void;
}

export function SectorFilter({ sectors, value, onChange }: SectorFilterProps) {
  const activeSector = sectors.find((s) => s.slug === value);

  return (
    <div className="rounded-2xl border border-sand-dark/60 bg-surface/80 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">Explorer</p>
          <p className="mt-0.5 font-serif text-lg text-petrol">
            {activeSector ? activeSector.name : "Tous les secteurs"}
          </p>
          {activeSector?.city && (
            <p className="text-sm text-ink-muted">{activeSector.city}</p>
          )}
        </div>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="self-start text-sm font-medium text-brass transition hover:text-petrol sm:self-center"
          >
            Reinitialiser
          </button>
        )}
      </div>

      <div className="relative mt-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-surface to-transparent sm:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-surface to-transparent sm:hidden" />

        <div
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filtrer par secteur"
        >
          <SectorPill
            active={value === ""}
            label="Tous"
            onClick={() => onChange("")}
          />
          {sectors.map((sector) => (
            <SectorPill
              key={sector.id}
              active={value === sector.slug}
              label={sector.name}
              sublabel={sector.city}
              onClick={() => onChange(sector.slug)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface SectorPillProps {
  active: boolean;
  label: string;
  sublabel?: string;
  onClick: () => void;
}

function SectorPill({ active, label, sublabel, onClick }: SectorPillProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`group shrink-0 rounded-full border px-4 py-2.5 text-left transition-all duration-200 ${
        active
          ? "border-petrol bg-petrol text-surface shadow-md shadow-petrol/15"
          : "border-sand-dark/80 bg-paper text-ink-muted hover:border-petrol/40 hover:bg-surface hover:text-petrol"
      }`}
    >
      <span className={`block text-sm font-medium leading-tight ${active ? "text-surface" : "text-ink"}`}>
        {label}
      </span>
      {sublabel && (
        <span className={`mt-0.5 block text-[11px] leading-tight ${active ? "text-sand/90" : "text-ink-muted/80"}`}>
          {sublabel}
        </span>
      )}
    </button>
  );
}
