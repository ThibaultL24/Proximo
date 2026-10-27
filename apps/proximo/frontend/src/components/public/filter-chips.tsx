// src/components/public/filter-chips.tsx
interface FilterChip {
  id: string;
  label: string;
}

interface FilterChipsProps {
  label: string;
  options: FilterChip[];
  activeId: string;
  onChange: (id: string) => void;
}

export function FilterChips({ label, options, activeId, onChange }: FilterChipsProps) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </p>
      <div
        role="listbox"
        aria-label={label}
        className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      >
        {options.map((opt) => {
          const isActive = activeId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="option"
              aria-selected={isActive}
              onClick={() => onChange(opt.id)}
              className={[
                "shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition",
                isActive
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-surface text-ink-muted hover:border-ink/40 hover:text-ink",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
