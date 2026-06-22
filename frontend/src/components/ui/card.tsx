// src/components/ui/card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-sand-dark/60 bg-surface p-5 shadow-sm ${hover ? "transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
