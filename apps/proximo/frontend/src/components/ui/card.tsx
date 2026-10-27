// src/components/ui/card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  /** `panel` : coins un peu plus marqués pour les dashboards métier */
  tone?: "public" | "panel";
}

export function Card({ children, className = "", hover = false, tone = "public" }: CardProps) {
  return (
    <div
      className={[
        "border border-line bg-surface p-5",
        tone === "panel" ? "rounded-xl shadow-soft" : "rounded-lg",
        hover ? "transition-colors hover:border-ink/25" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
