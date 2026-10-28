interface BrandMarkProps { className?: string; title?: string; }
/** Fenêtre ouverte vers le village : icône vectorielle compacte pour l'interface. */
export function BrandMark({ className = "h-8 w-8", title = "Fenêtre Ouverte" }: BrandMarkProps) {
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <title>{title}</title>
      <circle cx="28" cy="29" r="20" fill="#ddf6ff" stroke="#ffbe22" strokeWidth="3"/>
      <path d="M15 32L24 21L30 28L39 18L45 33V44H13Z" fill="#48a86d" />
      <path d="M21 43V30L28 22L35 30V43" fill="#0b4c93" />
      <path d="M14 45Q27 37 42 45" stroke="#1396c8" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="37" cy="17" r="5" fill="#ffbe22" />
      <path d="M4 17L12 23V42L4 48V17ZM52 17L44 23V42L52 48V17Z" fill="#ffc329" stroke="#0b4c93" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}
