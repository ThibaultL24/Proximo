// src/components/public/bottom-nav.tsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/use-auth";
import { homePathForRole } from "../../lib/auth-redirect";

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconFeed({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16M4 12h16M4 18h10"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconShop({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 9h16l-1.5 11H5.5L4 9Z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinejoin="round"
      />
      <path
        d="M8 9V7a4 4 0 0 1 8 0v2"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconUser({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
      <path
        d="M5 19.5c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

const items = [
  { to: "/", label: "Accueil", Icon: IconHome, match: (p: string) => p === "/" },
  { to: "/fil", label: "Fil", Icon: IconFeed, match: (p: string) => p.startsWith("/fil") },
  {
    to: "/commerces",
    label: "Commerces",
    Icon: IconShop,
    match: (p: string) => p.startsWith("/commerces") || p.startsWith("/communes"),
  },
  { to: "/connexion", label: "Compte", Icon: IconUser, authAlternate: true, match: () => false },
];

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-sm md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const target = item.authAlternate && user ? homePathForRole(user.role) : item.to;
          const active =
            item.authAlternate && user
              ? location.pathname.startsWith(homePathForRole(user.role))
              : !item.authAlternate && item.match(location.pathname);
          const Icon = item.Icon;
          return (
            <Link
              key={item.label}
              to={target}
              className={[
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold tracking-wide",
                active ? "text-tile" : "text-ink-muted",
              ].join(" ")}
            >
              <Icon active={active} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
