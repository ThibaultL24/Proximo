// src/components/public/category-tabs.tsx
import { FEED_CATEGORIES, type FeedCategory } from "../../lib/feed-categories";

interface CategoryTabsProps {
  active: FeedCategory | "all";
  onChange: (category: FeedCategory | "all") => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filtrer le fil local"
      className="no-scrollbar flex gap-0 overflow-x-auto border-b border-line"
    >
      {FEED_CATEGORIES.map((cat) => {
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat.id)}
            className={[
              "shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition",
              isActive
                ? "border-tile text-ink"
                : "border-transparent text-ink-muted hover:text-ink",
            ].join(" ")}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
